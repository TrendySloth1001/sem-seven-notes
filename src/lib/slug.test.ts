import assert from "node:assert/strict";
import { test } from "node:test";
import { slugify } from "./slug.ts";

test("slugify lowercases and joins words with dashes", () => {
  assert.equal(
    slugify("  Data Structures & Algorithms! "),
    "data-structures-algorithms",
  );
});
