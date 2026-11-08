// Usage: node scripts/wrap-sums.ts [--write] <files...>
// Turns the plain "**Given:** / **To find:** / steps / **Answer** / verify box" pattern into <Sum> blocks.
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const write = process.argv.includes("--write");
const files = process.argv.slice(2).filter((a) => a !== "--write");

export function wrapSums(src: string): {
  out: string;
  wrapped: number;
  skipped: string[];
} {
  const lines = src.split("\n");
  const out: string[] = [];
  const skipped: string[] = [];
  let wrapped = 0;
  let i = 0;
  const block = (tag: string, body: string[]) => [
    `<${tag}>`,
    "",
    ...trim(body),
    "",
    `</${tag}>`,
    "",
  ];
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.startsWith("**Given:**")) {
      out.push(line);
      i++;
      continue;
    }
    const find = lines.findIndex(
      (l, k) => k > i && l.startsWith("**To find:**"),
    );
    const ans = lines.findIndex(
      (l, k) => k > find && /^\*\*(Final answer|Answer)\b/.test(l),
    );
    if (
      find < 0 ||
      ans < 0 ||
      lines.slice(i + 1, find).some((l) => l.startsWith("**Given:**"))
    ) {
      skipped.push(line.slice(0, 60));
      out.push(line);
      i++;
      continue;
    }
    const given = [
      line.replace(/^\*\*Given:\*\*\s*/, ""),
      ...lines.slice(i + 1, find),
    ];
    const toFind = [(lines[find] ?? "").replace(/^\*\*To find:\*\*\s*/, "")];
    let k = find + 1;
    while (k < ans && (lines[k] ?? "").trim() !== "")
      toFind.push(lines[k++] ?? "");
    const steps = lines.slice(k, ans);
    // "**Answer: x**" or "**Answer:** x" → "x" in bold-free form; the row itself is styled.
    const answer = [
      (lines[ans] ?? "")
        .replace(/^\*\*(?:Final answer|Answer):\*\*\s*/, "")
        .replace(/^\*\*(?:Final answer|Answer):\s*(.*)\*\*\s*$/, "$1")
        .replace(/^\*\*Answer\s*\(([^)]*)\):\s*(.*)\*\*\s*$/, "$1: $2"),
    ];
    let j = ans + 1;
    while (j < lines.length && (lines[j] ?? "").trim() !== "")
      answer.push(lines[j++] ?? "");
    // Optional verify box right after the answer.
    let n = j;
    while (n < lines.length && (lines[n] ?? "").trim() === "") n++;
    let verify: string[] = [];
    if ((lines[n] ?? "").startsWith('<Box kind="verify">')) {
      const end = lines.findIndex((l, m) => m >= n && l.includes("</Box>"));
      if (end >= 0) {
        verify = lines.slice(n, end + 1);
        j = end + 1;
      }
    }
    out.push(
      "<Sum>",
      "",
      ...block("Given", given),
      ...block("Find", toFind),
      ...block("Steps", steps),
      ...block("Answer", answer),
      ...(verify.length ? [...verify, ""] : []),
      "</Sum>",
    );
    if (!verify.length) skipped.push(`(no verify box) ${line.slice(0, 50)}`);
    wrapped++;
    i = j;
  }
  return { out: out.join("\n"), wrapped, skipped };
}

function trim(a: string[]): string[] {
  let s = 0;
  let e = a.length;
  while (s < e && (a[s] ?? "").trim() === "") s++;
  while (e > s && (a[e - 1] ?? "").trim() === "") e--;
  return a.slice(s, e);
}

// Only act when run directly, never when imported (the validator imports these helpers).
if (process.argv[1] === fileURLToPath(import.meta.url) && files.length) {
  let total = 0;
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    if (src.includes("<Sum>")) continue;
    const { out, wrapped, skipped } = wrapSums(src);
    total += wrapped;
    if (wrapped || skipped.length)
      console.log(
        `${f}: ${wrapped} wrapped${skipped.length ? `; skipped: ${skipped.join(" | ")}` : ""}`,
      );
    if (write && wrapped) fs.writeFileSync(f, out);
  }
  console.log(`${total} sums ${write ? "wrapped" : "would be wrapped"}`);
}
