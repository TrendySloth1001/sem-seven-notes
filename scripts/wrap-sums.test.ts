import assert from "node:assert/strict";
import { test } from "node:test";
import { wrapSums } from "./wrap-sums.ts";

test("wraps a plain sum with its verify box", () => {
  const src = [
    "Intro.",
    "",
    "**Given:** $w = 2$.",
    "",
    "**To find:** the new weight.",
    "",
    "1. Subtract: $2 - 0.4 = 1.6$.",
    "",
    "**Answer: new $w = 1.6$.**",
    "",
    '<Box kind="verify">',
    "",
    "Check.",
    "",
    "</Box>",
    "",
    "After.",
  ].join("\n");
  const { out, wrapped, skipped } = wrapSums(src);
  assert.equal(wrapped, 1);
  assert.deepEqual(skipped, []);
  assert.match(out, /<Sum>\n\n<Given>\n\n\$w = 2\$\.\n\n<\/Given>/);
  assert.match(out, /<Answer>\n\nnew \$w = 1\.6\$\.\n\n<\/Answer>/);
  assert.match(out, /<\/Box>\n\n<\/Sum>\n\nAfter\./);
});

test("leaves text without a To find line alone", () => {
  const src = "**Given:** something.\n\nNo sum here.";
  const { out, wrapped } = wrapSums(src);
  assert.equal(wrapped, 0);
  assert.equal(out, src);
});
