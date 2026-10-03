/*
|-----------------------------------------
| Counselor progress metric tests
|-----------------------------------------
*/

import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCouncilorProgressPipeline,
  getCouncilorProgressWindows,
  mapCouncilorProgress,
} from "./councilor-progress.mjs";

test("calendar windows use Asia/Dhaka local midnight and a Monday week start", () => {
  const windows = getCouncilorProgressWindows(new Date("2026-10-01T02:00:00.000Z"));

  assert.equal(windows.timeZone, "Asia/Dhaka");
  assert.equal(windows.asOfIso, "2026-10-01T02:00:00.000Z");
  assert.equal(windows.daily.from.toISOString(), "2026-09-30T18:00:00.000Z");
  assert.equal(windows.weekly.from.toISOString(), "2026-09-27T18:00:00.000Z");
  assert.equal(windows.monthly.from.toISOString(), "2026-09-30T18:00:00.000Z");
  for (const period of [windows.daily, windows.weekly, windows.monthly]) assert.equal(period.to, windows.asOf);
});

test("progress pipeline scopes current and legacy assignments and attributes follow-ups to the Counselor", () => {
  const councilors = [
    { id: "councilor-1", email: "one@example.com" },
    { id: "councilor-2", email: "two@example.com" },
  ];
  const pipeline = buildCouncilorProgressPipeline(
    councilors,
    getCouncilorProgressWindows(new Date("2026-10-01T02:00:00.000Z")),
  );
  const match = pipeline.find((stage) => "$match" in stage).$match;
  const groupPerCustomer = pipeline.find((stage) => "$group" in stage && stage.$group._id?.customer);

  assert.deepEqual(match.$or[0], { councilorId: { $in: ["councilor-1", "councilor-2"] } });
  assert.deepEqual(match.$or[1], {
    councilorId: null,
    councilorEmail: { $in: ["one@example.com", "two@example.com"] },
  });
  assert.equal(groupPerCustomer.$group.__working.$first.$cond[0].$in[1].includes("inactive"), true);
  assert.equal(groupPerCustomer.$group.__working.$first.$cond[0].$in[1].includes("archived"), true);
  assert.ok(JSON.stringify(groupPerCustomer.$group.__dailyFollowUps).includes("followUps.authorEmail"));
  assert.ok(JSON.stringify(groupPerCustomer.$group.__dailyFollowUps).includes("__progressAt"));
});

test("Counselor and team summaries are mapped from server aggregate rows, including legacy email ownership", () => {
  const councilors = [
    { id: "councilor-1", email: "one@example.com" },
    { id: "councilor-2", email: "two@example.com" },
  ];
  const windows = getCouncilorProgressWindows(new Date("2026-10-01T02:00:00.000Z"));
  const result = mapCouncilorProgress(
    councilors,
    [
      {
        _id: "id:councilor-1",
        assignedCustomers: 2,
        workingCustomers: 1,
        dailyFollowUps: 3,
        dailyCustomersTouched: 2,
        weeklyFollowUps: 5,
        weeklyCustomersTouched: 2,
        monthlyFollowUps: 7,
        monthlyCustomersTouched: 2,
      },
      {
        _id: "email:one@example.com",
        assignedCustomers: 1,
        workingCustomers: 1,
        dailyFollowUps: 1,
        dailyCustomersTouched: 1,
        weeklyFollowUps: 2,
        weeklyCustomersTouched: 1,
        monthlyFollowUps: 3,
        monthlyCustomersTouched: 1,
      },
      {
        _id: "id:councilor-2",
        assignedCustomers: 2,
        workingCustomers: 2,
        dailyFollowUps: 4,
        dailyCustomersTouched: 2,
        weeklyFollowUps: 4,
        weeklyCustomersTouched: 2,
        monthlyFollowUps: 4,
        monthlyCustomersTouched: 2,
      },
    ],
    windows,
  );

  assert.equal(result.byCouncilorId.get("councilor-1").assignedCustomers, 3);
  assert.equal(result.byCouncilorId.get("councilor-1").workingCustomers, 2);
  assert.equal(result.byCouncilorId.get("councilor-1").periods.daily.followUps, 4);
  assert.equal(result.byCouncilorId.get("councilor-1").periods.daily.customersTouched, 3);
  assert.equal(result.team.assignedCustomers, 5);
  assert.equal(result.team.workingCustomers, 4);
  assert.equal(result.team.periods.weekly.followUps, 11);
  assert.equal(result.team.periods.monthly.customersTouched, 5);
});
