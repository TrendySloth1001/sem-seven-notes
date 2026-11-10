import assert from "node:assert/strict";
import { test } from "node:test";
import { compileError } from "./compile-mdx.ts";

test("passes valid MDX and maths", async () => {
  assert.equal(
    await compileError(
      "Text with $x^2$ and a table.\n\n| a | b |\n|---|---|\n| 1 | 2 |",
    ),
    null,
  );
});

test("fails broken maths and broken syntax", async () => {
  assert.match(
    (await compileError("R code $subject < 3 & df$ here")) ?? "",
    /maths does not parse/,
  );
  assert.match(
    (await compileError("i = 2, 4 <= 29")) ?? "",
    /error compiling MDX/,
  );
});
