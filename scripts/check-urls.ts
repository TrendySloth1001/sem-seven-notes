// Usage: node scripts/check-urls.ts <references.json> [more.json ...]
// Prints HTTP status and page title for every reference URL, so a citation is only kept if it really loads.
import fs from "node:fs";

type Ref = { id: string; url: string; title?: string };
const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: node scripts/check-urls.ts <file.json> ...");
  process.exit(2);
}
let bad = 0;
for (const file of files) {
  const refs = JSON.parse(fs.readFileSync(file, "utf8")) as Ref[];
  for (const r of refs) {
    try {
      const res = await fetch(r.url, {
        headers: { "User-Agent": "Mozilla/5.0 (sem study project link check)" },
        redirect: "follow",
        signal: AbortSignal.timeout(25000),
      });
      const html = (await res.text()).slice(0, 400000);
      const title = (
        /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "(no title)"
      )
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 90);
      if (!res.ok) bad++;
      console.log(
        `${res.ok ? "ok " : "BAD"} ${res.status} ${r.id} | ${title} | ${r.url}`,
      );
    } catch (e) {
      bad++;
      console.log(`BAD ERR ${r.id} | ${(e as Error).name} | ${r.url}`);
    }
  }
}
process.exit(bad > 0 ? 1 : 0);
