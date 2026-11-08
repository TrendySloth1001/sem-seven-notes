// Reads study content from content/<subject>/ at build time.
// Layout: references.json, topics.json, notes/<topic>.mdx, pyq/<paper>/paper.json, pyq/<paper>/<question>.mdx
import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import matter from "gray-matter";

const ROOT = path.join(process.cwd(), "content");

export type Reference = {
  id: string;
  short: string;
  authors: string;
  title: string;
  venue: string;
  year?: number;
  url: string;
  kind: "book" | "paper" | "course" | "notes" | "tutorial" | "docs" | "wiki";
};

export type Topic = { slug: string; title: string; module: number };

/** Licences we accept for third-party images; anything else fails validation. */
export const IMAGE_LICENSES = [
  "Public domain",
  "CC0",
  "CC BY 2.0",
  "CC BY 2.5",
  "CC BY 3.0",
  "CC BY 4.0",
  "CC BY-SA 2.0",
  "CC BY-SA 2.5",
  "CC BY-SA 3.0",
  "CC BY-SA 4.0",
] as const;

export type ImageRef = {
  id: string;
  /** A PNG render on upload.wikimedia.org (thumb URL for SVG originals). */
  src: string;
  width: number;
  height: number;
  alt: string;
  author: string;
  license: (typeof IMAGE_LICENSES)[number];
  licenseUrl?: string;
  /** The Commons file page. */
  sourceUrl: string;
};

export type PaperQuestion = {
  id: string;
  label: string;
  marks: number;
  topics: string[];
  text: string;
  /** e.g. "Program question" or "Not in the CSE (AI&ML) syllabus". */
  note?: string;
};

export type Paper = {
  slug: string;
  session: string;
  date: string | null;
  time: string | null;
  duration: string;
  maxMarks: number;
  paperCode: string;
  qpCode: string | null;
  sourceUrl: string;
  instructions: string[];
  /** Legacy: note printed before question 1. */
  q1note?: string;
  /** Printed before the first sub-question of a main question, keyed by its number, e.g. {"6": "Write short notes on any two."} */
  sectionNotes?: Record<string, string>;
  /** Which branch's paper this is. Missing means the student's own branch. */
  branch?: string;
  questions: PaperQuestion[];
};

export type Heading = { depth: 2 | 3; text: string; id: string };

/** "hi" is Hinglish, stored next to the English file as <name>.hi.mdx. */
export type Lang = "en" | "hi";

// Hinglish heading ids get this prefix so both versions can sit on one page without duplicate ids.
export const LANG_ID_PREFIX: Record<Lang, string> = { en: "", hi: "hi-" };

const langFile = (base: string, lang: Lang) =>
  lang === "en" ? `${base}.mdx` : `${base}.${lang}.mdx`;

export type Doc = {
  meta: Record<string, unknown>;
  body: string;
  headings: Heading[];
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function exists(file: string): boolean {
  return fs.existsSync(file);
}

function extractHeadings(body: string, prefix = ""): Heading[] {
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const text = (m[2] ?? "").replace(/[`*_]/g, "");
    out.push({
      depth: m[1]?.length === 2 ? 2 : 3,
      text,
      id: prefix + slugger.slug(text),
    });
  }
  return out;
}

function readDoc(file: string, lang: Lang = "en"): Doc {
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    meta: data,
    body: content,
    headings: extractHeadings(content, LANG_ID_PREFIX[lang]),
  };
}

export function getReferences(subject: string): Record<string, Reference> {
  const dir = path.join(ROOT, subject);
  const files = [path.join(dir, "references.json")];
  const extra = path.join(dir, "references");
  if (exists(extra)) {
    for (const f of fs.readdirSync(extra).sort()) {
      if (f.endsWith(".json")) files.push(path.join(extra, f));
    }
  }
  const out: Record<string, Reference> = {};
  for (const file of files.filter(exists)) {
    for (const r of readJson<Reference[]>(file)) {
      if (out[r.id])
        throw new Error(`Duplicate reference id "${r.id}" in ${file}`);
      out[r.id] = r;
    }
  }
  return out;
}

// images.json plus images/*.json fragments, like references.
export function getImages(subject: string): Record<string, ImageRef> {
  const dir = path.join(ROOT, subject);
  const files = [path.join(dir, "images.json")];
  const extra = path.join(dir, "images");
  if (exists(extra)) {
    for (const f of fs.readdirSync(extra).sort()) {
      if (f.endsWith(".json")) files.push(path.join(extra, f));
    }
  }
  const out: Record<string, ImageRef> = {};
  for (const file of files.filter(exists)) {
    for (const r of readJson<ImageRef[]>(file)) {
      if (out[r.id]) throw new Error(`Duplicate image id "${r.id}" in ${file}`);
      out[r.id] = r;
    }
  }
  return out;
}

export function getTopics(subject: string): Topic[] {
  const file = path.join(ROOT, subject, "topics.json");
  return exists(file) ? readJson<Topic[]>(file) : [];
}

export function getNote(
  subject: string,
  slug: string,
  lang: Lang = "en",
): Doc | null {
  const file = path.join(ROOT, subject, "notes", langFile(slug, lang));
  return exists(file) ? readDoc(file, lang) : null;
}

export function listWrittenNotes(subject: string): Set<string> {
  const dir = path.join(ROOT, subject, "notes");
  if (!exists(dir)) return new Set();
  return new Set(
    fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".mdx") && !f.endsWith(".hi.mdx"))
      .map((f) => f.replace(/\.mdx$/, "")),
  );
}

export function listPapers(subject: string): Paper[] {
  const dir = path.join(ROOT, subject, "pyq");
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((d) => exists(path.join(dir, d, "paper.json")))
    .map((d) => readJson<Paper>(path.join(dir, d, "paper.json")))
    .sort((a, b) => b.slug.localeCompare(a.slug));
}

export function getPaper(subject: string, slug: string): Paper | null {
  const file = path.join(ROOT, subject, "pyq", slug, "paper.json");
  return exists(file) ? readJson<Paper>(file) : null;
}

export function getSolution(
  subject: string,
  paper: string,
  questionId: string,
  lang: Lang = "en",
): Doc | null {
  const file = path.join(
    ROOT,
    subject,
    "pyq",
    paper,
    langFile(questionId, lang),
  );
  return exists(file) ? readDoc(file, lang) : null;
}

export function isSolved(
  subject: string,
  paper: string,
  questionId: string,
): boolean {
  return exists(path.join(ROOT, subject, "pyq", paper, `${questionId}.mdx`));
}

export type AskedIn = { paper: Paper; question: PaperQuestion };

// Every question that is tagged with this topic, newest paper first.
export function askedIn(subject: string, topic: string): AskedIn[] {
  return listPapers(subject).flatMap((paper) =>
    paper.questions
      .filter((q) => q.topics.includes(topic))
      .map((question) => ({ paper, question })),
  );
}

export function metaString(meta: Record<string, unknown>, key: string): string {
  const v = meta[key];
  return typeof v === "string" ? v : "";
}

export function metaStrings(
  meta: Record<string, unknown>,
  key: string,
): string[] {
  const v = meta[key];
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string")
    : [];
}
