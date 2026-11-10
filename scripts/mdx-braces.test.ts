import assert from "node:assert/strict";
import { test } from "node:test";
import { escapeBraces } from "./mdx-braces.ts";

test("escapes set notation in text but not maths, code or tags", () => {
  const src =
    'Context {deposit, money} and $w_{n-1}$ and `a{b}` <Cite id="x" />\n\n$$\nP_{i}\n$$\n\nw_{n-1} \\{ok\\}';
  const { out, count } = escapeBraces(src);
  assert.equal(count, 4);
  assert.equal(
    out,
    'Context \\{deposit, money\\} and $w_{n-1}$ and `a{b}` <Cite id="x" />\n\n$$\nP_{i}\n$$\n\nw_\\{n-1\\} \\{ok\\}',
  );
});

test("writes a bare <= in text as ≤ but leaves code alone", () => {
  const { out, count } = escapeBraces("i = 2, 4 <= 29 and `i * i <= n`");
  assert.equal(count, 1);
  assert.equal(out, "i = 2, 4 ≤ 29 and `i * i <= n`");
});

test("leaves frontmatter alone", () => {
  const src = '---\nkeyIdeas: ["{x}"]\n---\n\nText.';
  assert.equal(escapeBraces(src).count, 0);
});
