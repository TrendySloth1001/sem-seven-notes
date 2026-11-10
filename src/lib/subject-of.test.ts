import assert from "node:assert/strict";
import { test } from "node:test";
import { subjectOf } from "./subject-of.ts";

test("finds the subject in subject URLs only", () => {
  assert.equal(subjectOf("/notes/deep-learning/cnn"), "deep-learning");
  assert.equal(
    subjectOf("/pyq/natural-language-processing"),
    "natural-language-processing",
  );
  assert.equal(
    subjectOf("/syllabus/blockchain-technologies"),
    "blockchain-technologies",
  );
  assert.equal(subjectOf("/patterns/big-data-analytics"), "big-data-analytics");
  assert.equal(subjectOf("/syllabus"), undefined);
  assert.equal(subjectOf("/"), undefined);
});
