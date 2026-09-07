import { test } from "node:test";
import assert from "node:assert/strict";
import { choiceLabel, parseWeight, formatNumber } from "../src/utils/locale";
import { observationSummary } from "../src/utils/observations";

test("Dutch weight input accepts a comma without changing numeric storage", () => {
  assert.equal(parseWeight("4,25"), 4.25);
  assert.equal(parseWeight("4.25"), 4.25);
  assert.ok(Number.isNaN(parseWeight("vier")));
  assert.equal(formatNumber(4.25), "4,25");
});
test("stored enums render as Dutch labels and summaries", () => {
  assert.equal(choiceLabel("probably"), "Waarschijnlijk");
  assert.equal(
    observationSummary({
      id: "test",
      type: "poop",
      confidence: "unknown",
      createdAt: "2026-09-07T12:00:00Z",
      poop: { consistency: "soft", blood: true },
    }),
    "Zacht · bloed gezien",
  );
});
