import { test } from "node:test";
import assert from "node:assert/strict";
import {
  filterObservations,
  generateVetSummary,
} from "../src/utils/observations";
import { Observation } from "../src/types";
import { isValidDate, parseLocalDateTime } from "../src/utils/dates";

test("rejects overflow dates and times", () => {
  assert.equal(isValidDate("2026-02-30"), false);
  assert.equal(isValidDate("2024-02-29"), true);
  assert.equal(parseLocalDateTime("2026-09-07 24:00"), undefined);
  assert.equal(parseLocalDateTime("2026-02-30 12:00"), undefined);
  assert.ok(parseLocalDateTime("2026-09-07 12:30"));
});

test("unknown cats do not imply repeated vomiting or a combined weight trend", () => {
  const items = [
    entry("u1", "vomit", 0, { catId: undefined }),
    entry("u2", "vomit", 0, { catId: undefined }),
    entry("w1", "weight", 1, { weight: { valueKg: 4 } }),
    entry("w2", "weight", 0, { catId: "elsa", weight: { valueKg: 5 } }),
  ];
  const s = generateVetSummary(items, undefined, "all", now);
  assert.equal(s.important.length, 0);
  assert.equal(s.weightTrend, undefined);
});
const now = Date.parse("2026-09-07T12:00:00Z");
function entry(
  id: string,
  type: Observation["type"],
  days: number,
  extra: Partial<Observation> = {},
): Observation {
  return {
    id,
    type,
    catId: "mia",
    confidence: "certain",
    createdAt: new Date(now - days * 86400000).toISOString(),
    ...extra,
  };
}
test("filters by cat, type and inclusive rolling period, newest first", () => {
  const items = [
    entry("old", "vomit", 8),
    entry("boundary", "vomit", 7),
    entry("new", "vomit", 0),
    entry("other", "poop", 1),
    entry("unknown", "vomit", 0, { catId: undefined }),
  ];
  assert.deepEqual(
    filterObservations(
      items,
      { catId: "mia", type: "vomit", period: "7" },
      now,
    ).map((o) => o.id),
    ["new", "boundary"],
  );
  assert.equal(
    filterObservations(items, { catId: "unknown" }, now)[0].id,
    "unknown",
  );
});
test("summary counts changes without counting unknown appetite and computes chronological weight delta", () => {
  const items = [
    entry("p", "poop", 1, { poop: { consistency: "soft" } }),
    entry("d", "poop", 1, { poop: { consistency: "diarrhea", blood: true } }),
    entry("a", "food_drink", 1, {
      foodDrink: { appetite: "none", drinking: "unknown" },
    }),
    entry("u", "food_drink", 1, {
      foodDrink: { appetite: "unknown", drinking: "unknown" },
    }),
    entry("m", "medication", 1),
    entry("w1", "weight", 3, { weight: { valueKg: 4 } }),
    entry("w2", "weight", 0, { weight: { valueKg: 4.2 } }),
  ];
  const s = generateVetSummary(items, "mia", "7", now);
  assert.equal(s.total, 7);
  assert.equal(s.softDiarrheaCount, 2);
  assert.equal(s.appetiteChangeCount, 1);
  assert.equal(s.medicationCount, 1);
  assert.ok(Math.abs(s.weightTrend! - 0.2) < 0.001);
  assert.deepEqual(
    s.important.map((o) => o.id),
    ["d", "a"],
  );
});
test("repeated vomiting must concern the same cat within 24 hours", () => {
  const items = [
    entry("1", "vomit", 0),
    entry("2", "vomit", 0.5),
    entry("3", "vomit", 0, { catId: "elsa" }),
    entry("4", "vomit", 3),
  ];
  assert.deepEqual(
    generateVetSummary(items, undefined, "all", now).important.map((o) => o.id),
    ["1", "2"],
  );
});
test("empty summary and single weight have no invented trend", () => {
  assert.equal(generateVetSummary([], "mia", "30", now).weightTrend, undefined);
  assert.equal(
    generateVetSummary(
      [entry("w", "weight", 0, { weight: { valueKg: 4 } })],
      "mia",
      "all",
      now,
    ).weightTrend,
    undefined,
  );
});
