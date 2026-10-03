/*
|-----------------------------------------
| server-derived Counselor progress metrics
|-----------------------------------------
*/

export const COUNCILOR_PROGRESS_TIME_ZONE = "Asia/Dhaka";

const normalizeEmail = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");

function partsInTimeZone(date, timeZone) {
  const entries = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .filter((part) => part.type !== "literal")
    .map((part) => [part.type, Number(part.value)]);
  return Object.fromEntries(entries);
}

function zonedMidnightToUtc(year, month, day, timeZone) {
  const targetAsUtc = Date.UTC(year, month - 1, day);
  let guess = targetAsUtc;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const local = partsInTimeZone(new Date(guess), timeZone);
    const representedAsUtc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second);
    const correction = targetAsUtc - representedAsUtc;
    guess += correction;
    if (correction === 0) break;
  }
  return new Date(guess);
}

function previousCalendarDay({ year, month, day }, days) {
  const previous = new Date(Date.UTC(year, month - 1, day - days));
  return { year: previous.getUTCFullYear(), month: previous.getUTCMonth() + 1, day: previous.getUTCDate() };
}

export function getCouncilorProgressWindows(asOf = new Date(), timeZone = COUNCILOR_PROGRESS_TIME_ZONE) {
  const end = new Date(asOf);
  if (Number.isNaN(end.getTime())) throw new TypeError("Counselor progress asOf must be a valid date.");
  const local = partsInTimeZone(end, timeZone);
  const today = { year: local.year, month: local.month, day: local.day };
  const weekday = new Date(Date.UTC(today.year, today.month - 1, today.day)).getUTCDay();
  const daysSinceMonday = (weekday + 6) % 7;
  const weekStart = previousCalendarDay(today, daysSinceMonday);
  const monthStart = { year: today.year, month: today.month, day: 1 };
  const endIso = end.toISOString();
  const window = (date) => ({
    from: zonedMidnightToUtc(date.year, date.month, date.day, timeZone),
    to: end,
  });

  return {
    timeZone,
    asOf: end,
    daily: window(today),
    weekly: window(weekStart),
    monthly: window(monthStart),
    asOfIso: endIso,
  };
}

const activityIn = (window) => ({
  $and: [
    { $ne: ["$__progressAt", null] },
    { $gte: ["$__progressAt", { $literal: window.from }] },
    { $lt: ["$__progressAt", { $literal: window.to }] },
    {
      $eq: [{ $toLower: { $trim: { input: { $ifNull: ["$followUps.authorEmail", ""] } } } }, "$__progressOwnerEmail"],
    },
  ],
});

export function buildCouncilorProgressPipeline(councilors, windows) {
  const ids = [...new Set(councilors.map((councilor) => councilor.id).filter(Boolean))];
  const emails = [...new Set(councilors.map((councilor) => normalizeEmail(councilor.email)).filter(Boolean))];
  const selectors = [
    ...(ids.length ? [{ councilorId: { $in: ids } }] : []),
    ...(emails.length ? [{ councilorId: null, councilorEmail: { $in: emails } }] : []),
  ];
  if (!selectors.length) return [];

  const hasCouncilorId = {
    $and: [{ $ne: [{ $ifNull: ["$councilorId", null] }, null] }, { $ne: ["$councilorId", ""] }],
  };
  const emailBranches = councilors
    .filter((councilor) => councilor.id && normalizeEmail(councilor.email))
    .map((councilor) => ({
      case: { $eq: ["$councilorId", { $literal: councilor.id }] },
      then: { $literal: normalizeEmail(councilor.email) },
    }));
  const periodMatches = {
    daily: activityIn(windows.daily),
    weekly: activityIn(windows.weekly),
    monthly: activityIn(windows.monthly),
  };

  return [
    { $match: selectors.length === 1 ? selectors[0] : { $or: selectors } },
    {
      $addFields: {
        __progressOwnerKey: {
          $cond: [
            hasCouncilorId,
            { $concat: ["id:", { $toString: "$councilorId" }] },
            {
              $concat: ["email:", { $toLower: { $trim: { input: { $ifNull: ["$councilorEmail", ""] } } } }],
            },
          ],
        },
        __progressOwnerEmail: {
          $switch: {
            branches: emailBranches,
            default: { $toLower: { $trim: { input: { $ifNull: ["$councilorEmail", ""] } } } },
          },
        },
      },
    },
    { $unwind: { path: "$followUps", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        __progressAt: {
          $convert: { input: "$followUps.createdAt", to: "date", onError: null, onNull: null },
        },
      },
    },
    {
      $group: {
        _id: { owner: "$__progressOwnerKey", customer: "$id" },
        __working: {
          $first: {
            $cond: [{ $in: [{ $ifNull: ["$customerStatus", "active"] }, ["inactive", "archived"]] }, 0, 1],
          },
        },
        __dailyFollowUps: { $sum: { $cond: [periodMatches.daily, 1, 0] } },
        __dailyCustomersTouched: { $max: { $cond: [periodMatches.daily, 1, 0] } },
        __weeklyFollowUps: { $sum: { $cond: [periodMatches.weekly, 1, 0] } },
        __weeklyCustomersTouched: { $max: { $cond: [periodMatches.weekly, 1, 0] } },
        __monthlyFollowUps: { $sum: { $cond: [periodMatches.monthly, 1, 0] } },
        __monthlyCustomersTouched: { $max: { $cond: [periodMatches.monthly, 1, 0] } },
      },
    },
    {
      $group: {
        _id: "$_id.owner",
        assignedCustomers: { $sum: 1 },
        workingCustomers: { $sum: "$__working" },
        dailyFollowUps: { $sum: "$__dailyFollowUps" },
        dailyCustomersTouched: { $sum: "$__dailyCustomersTouched" },
        weeklyFollowUps: { $sum: "$__weeklyFollowUps" },
        weeklyCustomersTouched: { $sum: "$__weeklyCustomersTouched" },
        monthlyFollowUps: { $sum: "$__monthlyFollowUps" },
        monthlyCustomersTouched: { $sum: "$__monthlyCustomersTouched" },
      },
    },
  ];
}

function count(row, field) {
  const value = Number(row?.[field]);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function makePeriod(window, row, period) {
  return {
    from: window.from.toISOString(),
    to: window.to.toISOString(),
    followUps: count(row, `${period}FollowUps`),
    customersTouched: count(row, `${period}CustomersTouched`),
  };
}

function makeSnapshot(windows, totals) {
  return {
    timeZone: windows.timeZone,
    asOf: windows.asOfIso,
    assignedCustomers: totals.assignedCustomers,
    workingCustomers: totals.workingCustomers,
    periods: {
      daily: makePeriod(windows.daily, totals, "daily"),
      weekly: makePeriod(windows.weekly, totals, "weekly"),
      monthly: makePeriod(windows.monthly, totals, "monthly"),
    },
  };
}

export function mapCouncilorProgress(councilors, rows, windows) {
  const byOwnerKey = new Map(rows.map((row) => [row._id, row]));
  const byCouncilorId = new Map();
  for (const councilor of councilors) {
    const idRow = byOwnerKey.get(`id:${councilor.id}`);
    const emailRow = byOwnerKey.get(`email:${normalizeEmail(councilor.email)}`);
    const total = (field) => count(idRow, field) + count(emailRow, field);
    byCouncilorId.set(
      councilor.id,
      makeSnapshot(windows, {
        assignedCustomers: total("assignedCustomers"),
        workingCustomers: total("workingCustomers"),
        dailyFollowUps: total("dailyFollowUps"),
        dailyCustomersTouched: total("dailyCustomersTouched"),
        weeklyFollowUps: total("weeklyFollowUps"),
        weeklyCustomersTouched: total("weeklyCustomersTouched"),
        monthlyFollowUps: total("monthlyFollowUps"),
        monthlyCustomersTouched: total("monthlyCustomersTouched"),
      }),
    );
  }
  const values = [...byCouncilorId.values()];
  const sum = (read) => values.reduce((total, value) => total + read(value), 0);
  const team = makeSnapshot(windows, {
    assignedCustomers: sum((value) => value.assignedCustomers),
    workingCustomers: sum((value) => value.workingCustomers),
    dailyFollowUps: sum((value) => value.periods.daily.followUps),
    dailyCustomersTouched: sum((value) => value.periods.daily.customersTouched),
    weeklyFollowUps: sum((value) => value.periods.weekly.followUps),
    weeklyCustomersTouched: sum((value) => value.periods.weekly.customersTouched),
    monthlyFollowUps: sum((value) => value.periods.monthly.followUps),
    monthlyCustomersTouched: sum((value) => value.periods.monthly.customersTouched),
  });
  return { byCouncilorId, team };
}
