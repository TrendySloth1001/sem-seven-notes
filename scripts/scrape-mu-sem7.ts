// Usage: node scripts/scrape-mu-sem7.ts
// Scrapes subject + exam-session metadata for MU BE Sem 7 (Computer Engineering, AI/DS/ML)
// from muquestionpapers.com. Only metadata is stored; PDFs are linked, not downloaded.
import { mkdir, writeFile } from "node:fs/promises";

const BASE = "https://muquestionpapers.com";
const BRANCHES = [
  { id: "computer-engineering", label: "Computer Engineering" },
  {
    id: "computer-engineering-aids",
    label: "Computer Engineering (AI, DS, ML)",
  },
] as const;
const DELAY_MS = 5000;

type Paper = {
  branch: string;
  subject: string;
  category: "core" | "dloc" | "iloc";
  session: string;
  year: number;
  month: "may" | "december";
  scheme: "rev-2019-c-scheme";
  url: string;
};

// Current scheme names look like <year>_<month>_<subject>-rev-2019...; older ones use codes like AI_DEC16.
const NEW_NAME = /_semester-7_(\d{4})_(may|december)_(.+?)-rev-2019/;

const ACRONYMS: Record<string, string> = { ai: "AI", vr: "VR" };
const SMALL_WORDS = new Set(["and", "for", "with", "of"]);

function titleCase(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map(
      (w) =>
        ACRONYMS[w] ??
        (SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)),
    )
    .join(" ");
}

function parseSubject(raw: string): {
  subject: string;
  category: Paper["category"];
} {
  // The source spells this subject two ways across sessions.
  const slug = raw
    .replace("neural-network-fuzzy-system", "neural-network-and-fuzzy-system")
    .replace(/[:‘’']/g, "")
    .replace(/&amp;|&/g, "and")
    .replace(/-+/g, "-");
  const m = /^(dloc|iloc)-(i{1,3}|iv)-(.+)$/.exec(slug);
  if (!m) return { subject: titleCase(slug), category: "core" };
  const kind = m[1] === "dloc" ? "dloc" : "iloc";
  return { subject: titleCase(m[3] ?? slug), category: kind };
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "sem-pyq-research/0.1 (personal study project)" },
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

const papers: Paper[] = [];
let skippedLegacy = 0;

for (const [i, branch] of BRANCHES.entries()) {
  if (i > 0) await new Promise((r) => setTimeout(r, DELAY_MS));
  const html = await fetchText(`${BASE}/be/${branch.id}/semester-7`);
  const hrefs = new Set(
    [...html.matchAll(/href="(\/storage\/questionpapers\/[^"]+)"/g)].map((m) =>
      (m[1] ?? "").replaceAll("&amp;", "&"),
    ),
  );
  for (const href of hrefs) {
    const file = decodeURIComponent(href.split("/").pop() ?? "");
    const m = NEW_NAME.exec(file);
    if (!m) {
      skippedLegacy++;
      continue;
    }
    const year = Number(m[1]);
    const month = m[2] === "may" ? "may" : "december";
    const { subject, category } = parseSubject(m[3] ?? "");
    papers.push({
      branch: branch.label,
      subject,
      category,
      session: `${month === "may" ? "May" : "December"} ${year}`,
      year,
      month,
      scheme: "rev-2019-c-scheme",
      url: new URL(href, BASE).href,
    });
  }
}

papers.sort(
  (a, b) =>
    a.branch.localeCompare(b.branch) ||
    a.subject.localeCompare(b.subject) ||
    b.year - a.year,
);

const output = {
  // License is not stated by the source; papers are MU's. Link only, remove on request.
  meta: {
    source: BASE,
    license: "unknown (University of Mumbai)",
    scrapedAt: new Date().toISOString(),
    skippedLegacy,
  },
  papers,
};
await mkdir("data", { recursive: true });
await writeFile(
  "data/mu-sem7-papers.json",
  `${JSON.stringify(output, null, 2)}\n`,
);

for (const branch of BRANCHES) {
  console.log(`\n${branch.label}`);
  const subjects = new Map<string, Set<string>>();
  for (const p of papers.filter((x) => x.branch === branch.label)) {
    const key = `${p.subject} [${p.category}]`;
    const set = subjects.get(key) ?? new Set<string>();
    set.add(p.session);
    subjects.set(key, set);
  }
  for (const [name, sessions] of subjects)
    console.log(`  ${name}: ${[...sessions].join(", ")}`);
}
console.log(
  `\n${papers.length} papers saved to data/mu-sem7-papers.json (${skippedLegacy} legacy-scheme files skipped)`,
);
