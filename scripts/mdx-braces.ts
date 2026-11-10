// Usage: node scripts/mdx-braces.ts [--write] <files...>
// In MDX, "{...}" in plain text runs as JavaScript, so set notation like {deposit, money} crashes the page.
// A bare "<=" fails too, because "<" opens a tag. This finds both outside maths, code and component tags,
// and with --write escapes braces as \{ \} and writes "<=" as "≤".
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// Spans MDX must keep as they are: frontmatter, code, display and inline maths, inline code, JSX tags, escaped braces.
const PROTECTED =
  /^---\n[\s\S]*?\n---\n|```[\s\S]*?```|\$\$[\s\S]*?\$\$|(?<!\\)\$[^$\n]+?\$|`[^`\n]+`|<\/?[A-Za-z][^<>]*>|\\[{}]/g;

export function escapeBraces(src: string): { out: string; count: number } {
  let out = "";
  let last = 0;
  let count = 0;
  const esc = (text: string) =>
    text.replace(/[{}]|<=/g, (b) => {
      count++;
      return b === "<=" ? "≤" : `\\${b}`;
    });
  for (const m of src.matchAll(PROTECTED)) {
    out += esc(src.slice(last, m.index)) + m[0];
    last = m.index + m[0].length;
  }
  out += esc(src.slice(last));
  return { out, count };
}

const write = process.argv.includes("--write");
const files = process.argv.slice(2).filter((a) => a !== "--write");
// Only act when run directly, never when imported (the validator imports these helpers).
if (process.argv[1] === fileURLToPath(import.meta.url) && files.length) {
  let total = 0;
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    const { out, count } = escapeBraces(src);
    if (!count) continue;
    total += count;
    console.log(`${f}: ${count} brace(s)`);
    if (write) fs.writeFileSync(f, out);
  }
  console.log(`${total} unescaped brace(s) ${write ? "escaped" : "found"}`);
}
