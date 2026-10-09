/*
|-----------------------------------------
| Leads HTTP integration tests in a disposable MongoDB database
| Run: node scripts/test-leads.cjs [--keep-open]
|-----------------------------------------
*/

const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const { readFileSync } = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const { loadEnvConfig } = require("@next/env");
const { MongoClient, ObjectId } = require("mongodb");

loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const qaName = `leads_qa_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
const sourceUri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/demo-apps";
// Only this newly generated database is ever written or dropped.
const qaUri = sourceUri.replace(/^(mongodb(?:\+srv)?:\/\/[^/]+)(?:\/[^?]*)?(\?.*)?$/, `$1/${qaName}$2`);
if (!qaUri.includes(`/${qaName}`) || !/^leads_qa_[a-f0-9]{24}$/.test(qaName))
  throw new Error("QA database isolation failed.");
const mongo = new MongoClient(qaUri, { serverSelectionTimeoutMS: 10000 });
const db = mongo.db(qaName);
const origin = "http://127.0.0.1:3001";
const password = "Leads-QA-only-2026!";
let server,
  passed = 0,
  closing = false;

async function cleanup() {
  if (closing) return;
  closing = true;
  if (server && !server.killed) {
    if (process.platform === "win32") {
      await new Promise((resolve) => {
        const stop = spawn("taskkill", ["/pid", String(server.pid), "/t", "/f"], {
          windowsHide: true,
          stdio: "ignore",
        });
        stop.on("close", resolve);
        stop.on("error", resolve);
      });
    } else server.kill("SIGTERM");
  }
  // Guard the final resolved database name before the destructive cleanup.
  if (db.databaseName !== qaName || !/^leads_qa_[a-f0-9]{24}$/.test(db.databaseName))
    throw new Error("Refusing unsafe database cleanup.");
  try {
    await db.dropDatabase();
  } finally {
    await mongo.close();
  }
}
process.on("SIGINT", async () => {
  await cleanup();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await cleanup();
  process.exit(0);
});
async function request(path, method = "GET", body, cookie, headers = {}) {
  const response = await fetch(`${origin}${path}`, {
    method,
    headers: {
      Origin: origin,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data, status: response.status };
}
async function expectStatus(path, method, body, cookie, status, headers) {
  const result = await request(path, method, body, cookie, headers);
  assert.equal(result.status, status, `${method} ${path}: ${JSON.stringify(result.data)}`);
  return result.data;
}
async function check(name, run) {
  await run();
  passed++;
  console.log(`PASS ${name}`);
}
const base = "/api/dashboard/leads/v1";
const endpoint = (kind, mine = false) => `${base}?kind=${kind}&mine=${mine}`;
const itemEndpoint = (id, mine = false, kind = "customers") => `${base}/${id}?kind=${kind}&mine=${mine}`;

// Exercise the exact browser workbook parser with real XLSX bytes, without
// relying on the browser extension's optional local-file-upload permission.
function excelParser() {
  const ts = require("typescript");
  const filename = path.resolve("src/app/dashboard/leads/_components/excel.ts");
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded._compile(compiled, filename);
  return loaded.exports;
}

(async () => {
  await mongo.connect();
  const { hashPassword } = await import("better-auth/crypto");
  const hashedPassword = await hashPassword(password);
  const now = new Date();
  for (const [key, role] of [
    ["admin", "Admin"],
    ["councilor-a", "Councilor"],
    ["councilor-b", "Councilor"],
    ["user", "user"],
  ]) {
    const email = `qa-${key}@example.test`,
      id = `qa-${key}`,
      roleId = `qa-role-${role}`;
    const userObjectId = new ObjectId();
    await db
      .collection("role")
      .updateOne({ id: roleId }, { $set: { id: roleId, name: role, permissions: {} } }, { upsert: true });
    await db
      .collection("user")
      .insertOne({ _id: userObjectId, name: `QA ${key}`, email, emailVerified: true, createdAt: now, updatedAt: now });
    await db.collection("account").insertOne({
      id: randomUUID(),
      userId: userObjectId,
      accountId: userObjectId.toHexString(),
      providerId: "credential",
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });
    await db
      .collection("access")
      .insertOne({ id, email, roleId, roleName: role, blocked: false, createdAt: now, updatedAt: now });
  }
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "3001"],
    {
      cwd: process.cwd(),
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        MONGODB_URI: qaUri,
        BETTER_AUTH_URL: origin,
        BETTER_AUTH_TRUSTED_ORIGINS: origin,
        BETTER_AUTH_SECRET: randomUUID() + randomUUID(),
        AuthorizationEnable: process.argv.includes("--authorization-disabled") ? "false" : "true",
        REDIS_HOST: "",
        REDIS_USERNAME: "",
        REDIS_PASSWORD: "",
        GOOGLE_CLIENT_ID: "",
        GOOGLE_CLIENT_SECRET: "",
        GMAIL_USER: "",
        GMAIL_APP_PASSWORD: "",
      },
    },
  );
  let startupOutput = "";
  server.stdout.on("data", (chunk) => {
    startupOutput += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    startupOutput += chunk.toString();
  });
  for (let attempt = 0; attempt < 120; attempt++) {
    if (server.exitCode !== null) throw new Error(`QA server exited: ${startupOutput.slice(-1200)}`);
    try {
      if ((await fetch(`${origin}/api/auth/v1/ok`)).ok) break;
    } catch {}
    if (attempt === 119) throw new Error("QA server startup timed out.");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  async function login(key) {
    const result = await request("/api/auth/v1/sign-in/email", "POST", { email: `qa-${key}@example.test`, password });
    assert.equal(result.status, 200, JSON.stringify(result.data));
    return result.response.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ");
  }
  const [admin, councilorA, councilorB, user] = await Promise.all([
    login("admin"),
    login("councilor-a"),
    login("councilor-b"),
    login("user"),
  ]);
  await check("all Leads handlers reject anonymous and unrelated roles", async () => {
    const calls = [
      [endpoint("customers"), "GET"],
      [endpoint("customers"), "POST", {}],
      [itemEndpoint("none"), "PATCH", {}],
      [itemEndpoint("none"), "DELETE"],
      [`${base}/bulk`, "PATCH", {}],
      [`${base}/bulk`, "DELETE", {}],
      [`${base}/import`, "POST", {}],
    ];
    for (const [path, method, body] of calls) {
      await expectStatus(path, method, body, undefined, 401);
      await expectStatus(path, method, body, user, 403);
    }
  });
  const funnelInput = {
    name: "QA New enquiries",
    position: 1,
    description: "New customer enquiries",
    status: "active",
  };
  const funnel = (await expectStatus(endpoint("funnels"), "POST", funnelInput, admin, 201)).item;
  const secondFunnel = (
    await expectStatus(endpoint("funnels"), "POST", { ...funnelInput, name: "QA Follow-up", position: 2 }, admin, 201)
  ).item;
  await check("funnel position uniqueness, editing, and role restrictions", async () => {
    await expectStatus(endpoint("funnels"), "POST", funnelInput, admin, 409);
    await expectStatus(itemEndpoint(funnel.id, false, "funnels"), "PATCH", { ...funnelInput, position: 3 }, admin, 200);
    await expectStatus(endpoint("funnels"), "POST", { ...funnelInput, position: 4 }, councilorA, 403);
    const list = await expectStatus(endpoint("funnels"), "GET", undefined, admin, 200);
    assert.deepEqual(
      list.items.map((item) => item.position),
      [2, 3],
    );
  });
  const counselorInput = {
    name: "QA Councilor A",
    mobile: "01700000001",
    email: "qa-councilor-a@example.test",
    status: "active",
  };
  const profileA = (await expectStatus(endpoint("councilors"), "POST", counselorInput, admin, 201)).item;
  await expectStatus(
    endpoint("councilors"),
    "POST",
    { ...counselorInput, name: "QA Councilor B", mobile: "01700000002", email: "qa-councilor-b@example.test" },
    admin,
    201,
  );
  const customerInput = {
    name: "QA Unassigned",
    mobile: "01710000000",
    email: "",
    funnelId: funnel.id,
    status: "active",
    blocked: false,
  };
  const customer = (await expectStatus(endpoint("customers"), "POST", customerInput, admin, 201)).item;
  await check("canonical mobile uniqueness and untrusted assignment rejection", async () => {
    await expectStatus(endpoint("customers"), "POST", { ...customerInput, mobile: "+8801710000000" }, admin, 409);
    await expectStatus(
      endpoint("customers", true),
      "POST",
      { ...customerInput, mobile: "01710000001", assignedTo: "victim@example.test" },
      councilorA,
      400,
    );
  });
  let winner;
  await check("concurrent councilor claims have exactly one winner", async () => {
    const claims = await Promise.all([
      request(itemEndpoint(customer.id), "PATCH", { action: "claim" }, councilorA),
      request(itemEndpoint(customer.id), "PATCH", { action: "claim" }, councilorB),
    ]);
    assert.deepEqual(claims.map((claim) => claim.status).sort(), [200, 409]);
    winner = (await db.collection("leads-customers").findOne({ id: customer.id })).assignedTo;
    assert.ok(["qa-councilor-a@example.test", "qa-councilor-b@example.test"].includes(winner));
  });
  const own = (
    await expectStatus(
      endpoint("customers", true),
      "POST",
      { ...customerInput, name: "QA My Lead", mobile: "01710000001" },
      councilorA,
      201,
    )
  ).item;
  const other = (
    await expectStatus(
      endpoint("customers", true),
      "POST",
      { ...customerInput, name: "QA Other Lead", mobile: "01710000002" },
      councilorB,
      201,
    )
  ).item;
  const adminOwn = (
    await expectStatus(
      endpoint("customers", true),
      "POST",
      { ...customerInput, name: "QA Admin Lead", mobile: "01710000003" },
      admin,
      201,
    )
  ).item;
  await check("My Leads uses session identity for every role and filter", async () => {
    const mine = await expectStatus(endpoint("customers", true), "GET", undefined, councilorA, 200);
    assert.ok(mine.items.every((item) => item.assignedTo === "qa-councilor-a@example.test"));
    const narrowed = await expectStatus(
      `${endpoint("customers", true)}&councilor=qa-councilor-b%40example.test`,
      "GET",
      undefined,
      councilorA,
      200,
    );
    assert.equal(narrowed.total, 0);
    const unassigned = await expectStatus(
      `${endpoint("customers", true)}&assignment=unassigned`,
      "GET",
      undefined,
      councilorA,
      200,
    );
    assert.equal(unassigned.total, 0);
    const adminMine = await expectStatus(endpoint("customers", true), "GET", undefined, admin, 200);
    assert.deepEqual(
      adminMine.items.map((item) => item.id),
      [adminOwn.id],
    );
  });
  await check("item and mixed bulk writes cannot mutate another councilor's customers", async () => {
    await expectStatus(itemEndpoint(other.id), "PATCH", { ...customerInput, mobile: other.mobile }, councilorA, 404);
    await expectStatus(itemEndpoint(other.id, true), "DELETE", undefined, councilorA, 409);
    await expectStatus(
      `${base}/bulk`,
      "PATCH",
      { kind: "customers", ids: [own.id, other.id], status: "inactive" },
      councilorA,
      409,
    );
    assert.equal((await db.collection("leads-customers").findOne({ id: own.id })).status, "active");
    await expectStatus(
      itemEndpoint(own.id),
      "PATCH",
      { action: "assign", assignedTo: "qa-councilor-b@example.test" },
      councilorA,
      403,
    );
    await expectStatus(
      itemEndpoint(adminOwn.id, true),
      "PATCH",
      { action: "assign", assignedTo: "qa-councilor-a@example.test" },
      admin,
      403,
    );
  });
  await check("Admin reassignment and counselling activity persist", async () => {
    await expectStatus(
      itemEndpoint(customer.id),
      "PATCH",
      { action: "assign", assignedTo: "qa-councilor-a@example.test" },
      admin,
      200,
    );
    await expectStatus(itemEndpoint(own.id, true), "PATCH", { action: "counsel" }, councilorA, 200);
    assert.equal(await db.collection("leads-activities").countDocuments({ customerId: own.id, type: "counselled" }), 1);
    await expectStatus(itemEndpoint(other.id), "PATCH", { action: "counsel" }, councilorA, 403);
  });
  await check("imports report row errors and auto-assign only successful own rows", async () => {
    const XLSX = require("xlsx");
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet([
        {
          Name: "QA Imported Lead",
          Mobile: "01710000004",
          Email: "",
          "Funnel ID": funnel.id,
          Status: "active",
          Blocked: "false",
          "Assigned councilor": "forged@example.test",
        },
        {
          Name: "QA Duplicate",
          Mobile: own.mobile,
          Email: "",
          "Funnel ID": funnel.id,
          Status: "active",
          Blocked: "false",
        },
      ]),
      "Leads",
    );
    const bytes = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const rows = await excelParser().readLeadExcel(new File([bytes], "leads.xlsx"), "customers");
    const result = await expectStatus(
      `${base}/import`,
      "POST",
      {
        kind: "customers",
        mine: true,
        rows,
      },
      councilorA,
      200,
    );
    assert.equal(result.imported, 1);
    assert.equal(result.errors[0].row, 3);
    const imported = await db.collection("leads-customers").findOne({ name: "QA Imported Lead" });
    assert.equal(imported.assignedTo, "qa-councilor-a@example.test");
    await expectStatus(`${base}/import`, "POST", { kind: "councilors", rows: [counselorInput] }, councilorA, 403);
  });
  await check("referenced deletes, bad status, inactive profiles, and blocked access fail safely", async () => {
    await expectStatus(itemEndpoint(funnel.id, false, "funnels"), "DELETE", undefined, admin, 409);
    await expectStatus(itemEndpoint(profileA.id, false, "councilors"), "DELETE", undefined, admin, 409);
    await expectStatus(`${base}/bulk`, "PATCH", { kind: "customers", ids: [own.id], status: "invalid" }, admin, 400);
    await db.collection("leads-councilors").updateOne({ id: profileA.id }, { $set: { status: "inactive" } });
    await expectStatus(endpoint("customers"), "GET", undefined, councilorA, 403);
    await db.collection("leads-councilors").updateOne({ id: profileA.id }, { $set: { status: "active" } });
    await db.collection("access").updateOne({ id: "qa-councilor-a" }, { $set: { blocked: true } });
    await expectStatus(endpoint("customers"), "GET", undefined, councilorA, 403);
    await db.collection("access").updateOne({ id: "qa-councilor-a" }, { $set: { blocked: false } });
  });
  await check("CSRF and JSON guards apply to Leads mutations", async () => {
    await expectStatus(endpoint("customers"), "POST", customerInput, admin, 403, {
      Origin: "https://other.example.test",
    });
    await expectStatus(`${base}/bulk`, "DELETE", { kind: "customers", ids: [own.id] }, admin, 415, {
      "Content-Type": "text/plain",
    });
    await expectStatus(`${base}/bulk`, "PATCH", { kind: ["customers"], ids: [own.id], status: "inactive" }, admin, 400);
  });
  await check("successful CRUD and bulk operations persist without changing assignment", async () => {
    const disposable = (
      await expectStatus(
        endpoint("customers", true),
        "POST",
        { ...customerInput, mobile: "01710000008", name: "QA Disposable" },
        councilorA,
        201,
      )
    ).item;
    const edited = await expectStatus(
      itemEndpoint(disposable.id, true),
      "PATCH",
      { ...customerInput, name: "QA Edited", mobile: disposable.mobile, blocked: true },
      councilorA,
      200,
    );
    assert.equal(edited.item.assignedTo, "qa-councilor-a@example.test");
    assert.equal(edited.item.blocked, true);
    await expectStatus(itemEndpoint(disposable.id), "PATCH", { action: "counsel" }, councilorA, 403);
    await expectStatus(
      `${base}/bulk`,
      "PATCH",
      { kind: "customers", mine: true, ids: [disposable.id], status: "inactive" },
      councilorA,
      200,
    );
    const removed = await expectStatus(
      `${base}/bulk`,
      "DELETE",
      { kind: "customers", mine: true, ids: [disposable.id] },
      councilorA,
      200,
    );
    assert.equal(removed.deletedCount, 1);
    const extraFunnel = (await expectStatus(endpoint("funnels"), "POST", { ...funnelInput, position: 9 }, admin, 201))
      .item;
    await expectStatus(
      `${base}/bulk`,
      "PATCH",
      { kind: "funnels", ids: [extraFunnel.id], status: "inactive" },
      admin,
      200,
    );
    await expectStatus(itemEndpoint(extraFunnel.id, false, "funnels"), "DELETE", undefined, admin, 200);
    const extraCouncilor = (
      await expectStatus(
        endpoint("councilors"),
        "POST",
        { ...counselorInput, email: "qa-disposable@example.test" },
        admin,
        201,
      )
    ).item;
    await expectStatus(
      itemEndpoint(extraCouncilor.id, false, "councilors"),
      "PATCH",
      { ...counselorInput, email: "qa-disposable@example.test", name: "QA Renamed" },
      admin,
      200,
    );
    await expectStatus(
      `${base}/bulk`,
      "PATCH",
      { kind: "councilors", ids: [extraCouncilor.id], status: "inactive" },
      admin,
      200,
    );
    await expectStatus(itemEndpoint(extraCouncilor.id, false, "councilors"), "DELETE", undefined, admin, 200);
  });
  await check("oversized workbooks and request bodies fail without silent truncation", async () => {
    const XLSX = require("xlsx");
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        Array.from({ length: 101 }, () => ({ Name: "QA Too many", Mobile: "01710000009", "Funnel ID": funnel.id })),
      ),
      "Leads",
    );
    const bytes = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    await assert.rejects(() => excelParser().readLeadExcel(new File([bytes], "too-many.xlsx"), "customers"), /100/);
    await expectStatus(endpoint("customers"), "POST", { oversized: "x".repeat(513000) }, admin, 413);
  });
  // Seed enough records for pagination/search and dated records for real analytics.
  await db.collection("leads-customers").insertMany(
    Array.from({ length: 17 }, (_, index) => ({
      kind: "customers",
      id: randomUUID(),
      name: `QA Pagination ${String(index).padStart(2, "0")}`,
      mobile: `+88018000000${String(index).padStart(2, "0")}`,
      email: `page-${index}@example.test`,
      status: index % 3 ? "active" : "inactive",
      blocked: false,
      funnelId: secondFunnel.id,
      assignedTo: index % 2 ? "qa-councilor-a@example.test" : null,
      assignedAt: null,
      lastCounselledAt: null,
      createdAt: new Date(now.getTime() - (index + 1) * 60000),
      updatedAt: now,
    })),
  );
  await db
    .collection("leads-customers")
    .updateOne({ name: "QA Pagination 16" }, { $set: { createdAt: new Date(now.getTime() - 31 * 86400000) } });
  await db.collection("leads-activities").insertOne({
    id: randomUUID(),
    customerId: own.id,
    councilor: "qa-councilor-a@example.test",
    type: "counselled",
    createdAt: new Date(now.getTime() - 25 * 3600000),
  });
  await check("pagination, database search, filters, and monthly overview use stored data", async () => {
    const page = await expectStatus(`${endpoint("customers")}&page=2&pageSize=10`, "GET", undefined, admin, 200);
    assert.equal(page.items.length, 10);
    assert.equal(page.page, 2);
    const searched = await expectStatus(
      `${endpoint("customers")}&search=QA%20Pagination%2016`,
      "GET",
      undefined,
      admin,
      200,
    );
    assert.equal(searched.total, 1);
    const overview = await expectStatus(`${base}?overview=true`, "GET", undefined, admin, 200);
    assert.equal(overview.summary.all, await db.collection("leads-customers").countDocuments({}));
    assert.equal(overview.months.length, 12);
    assert.equal(overview.summary.new30Days, overview.summary.all - 1);
    assert.equal(overview.months.at(-1).customers, overview.summary.all - 1);
    assert.equal(overview.progress.find((row) => row.email === "qa-councilor-a@example.test").counselling24Hours, 1);
  });
  console.log(`Leads integration: ${passed} scenarios passed using an isolated database.`);
  if (process.argv.includes("--keep-open")) {
    console.log(
      `Browser QA ready: ${origin}/login (synthetic qa-admin@example.test account). Ctrl+C removes the test server and database.`,
    );
    await once(server, "exit");
  }
  await cleanup();
})().catch(async (error) => {
  console.error(error.message);
  await cleanup().catch(() => {});
  process.exitCode = 1;
});
