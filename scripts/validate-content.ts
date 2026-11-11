// Usage: node scripts/validate-content.ts
// Checks every note and solution: known reference ids, known PYQ/topic ids, no headings in solutions.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { IMAGE_LICENSES, type ImageRef } from "../src/lib/content.ts";
import { compileError } from "./compile-mdx.ts";
import { escapeBraces } from "./mdx-braces.ts";

const ROOT = path.join(process.cwd(), "content");
let errors = 0;
// Every MDX source (files and question texts), compiled at the end exactly as the site would.
const toCompile: { file: string; label: string; source: string }[] = [];
const fail = (file: string, msg: string) => {
  errors++;
  console.error(`✗ ${path.relative(process.cwd(), file)}: ${msg}`);
};
const readJson = <T>(f: string): T =>
  JSON.parse(fs.readFileSync(f, "utf8")) as T;

for (const subject of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, subject);
  if (!fs.statSync(dir).isDirectory()) continue;
  const refFiles = [path.join(dir, "references.json")];
  const fragDir = path.join(dir, "references");
  if (fs.existsSync(fragDir)) {
    for (const f of fs.readdirSync(fragDir))
      if (f.endsWith(".json")) refFiles.push(path.join(fragDir, f));
  }
  const refs = new Set<string>();
  const KINDS = new Set([
    "book",
    "paper",
    "course",
    "notes",
    "tutorial",
    "docs",
    "wiki",
    "class",
  ]);
  for (const rf of refFiles) {
    for (const r of readJson<
      {
        id: string;
        url?: string;
        kind: string;
        short?: string;
        title?: string;
      }[]
    >(rf)) {
      if (refs.has(r.id)) fail(rf, `duplicate reference id "${r.id}"`);
      refs.add(r.id);
      // Class files are private to the college, so only they may omit a link.
      if (
        r.kind === "class"
          ? r.url !== undefined
          : !r.url?.startsWith("https://")
      )
        fail(
          rf,
          `${r.id}: url must be https, and absent only for kind "class"`,
        );
      if (!KINDS.has(r.kind)) fail(rf, `${r.id} has unknown kind "${r.kind}"`);
      if (!r.short || !r.title) fail(rf, `${r.id} needs "short" and "title"`);
    }
  }
  // Images: only openly licensed PNG renders from Wikimedia Commons, each with author and source page.
  const images = new Set<string>();
  const LICENSES = new Set<string>(IMAGE_LICENSES);
  const imgFiles = [path.join(dir, "images.json")];
  const imgDir = path.join(dir, "images");
  if (fs.existsSync(imgDir))
    for (const f of fs.readdirSync(imgDir))
      if (f.endsWith(".json")) imgFiles.push(path.join(imgDir, f));
  for (const f of imgFiles.filter((x) => fs.existsSync(x))) {
    for (const im of readJson<Partial<ImageRef>[]>(f)) {
      const id = im.id ?? "(no id)";
      if (images.has(id)) fail(f, `duplicate image id "${id}"`);
      images.add(id);
      const commons =
        !!im.src?.startsWith(
          "https://upload.wikimedia.org/wikipedia/commons/",
        ) &&
        /\.(png|jpe?g)$/i.test(im.src) &&
        !!im.sourceUrl?.startsWith("https://commons.wikimedia.org/");
      const d2l =
        /^https:\/\/d2l\.ai\/_images\/[\w.-]+\.(svg|png)$/.test(im.src ?? "") &&
        !!im.sourceUrl?.startsWith("https://d2l.ai/") &&
        im.license === "CC BY-SA 4.0";
      const cls =
        new RegExp(`^/class/${subject}/[\\w.-]+\\.(png|jpe?g)$`).test(
          im.src ?? "",
        ) &&
        fs.existsSync(path.join("public", im.src ?? "")) &&
        im.license === "Used with permission" &&
        !!im.source;
      if (!commons && !d2l && !cls)
        fail(
          f,
          `${id}: src must be a Commons PNG/JPEG (sourceUrl on commons.wikimedia.org), a d2l.ai/_images figure (CC BY-SA 4.0, sourceUrl on d2l.ai), or a class figure in public/class/<subject>/ ("Used with permission", with source)`,
        );
      if (!LICENSES.has(im.license ?? ""))
        fail(f, `${id}: license "${im.license}" is not in IMAGE_LICENSES`);
      if (!im.author || !im.alt) fail(f, `${id}: needs author and alt`);
      if (!(Number(im.width) > 0 && Number(im.height) > 0))
        fail(f, `${id}: needs width and height`);
    }
  }
  if (!fs.existsSync(path.join(dir, "topics.json"))) {
    console.log(`${subject}: no topics.json yet, skipped`);
    continue;
  }
  const topics = new Set(
    readJson<{ slug: string }[]>(path.join(dir, "topics.json")).map(
      (t) => t.slug,
    ),
  );
  // Optional per-topic revision guide: one entry per known topic, with study points and reuse tricks.
  const revFile = path.join(dir, "revision.json");
  if (fs.existsSync(revFile)) {
    for (const r of readJson<
      { topic?: string; study?: unknown; tricks?: unknown }[]
    >(revFile)) {
      if (!topics.has(r.topic ?? ""))
        fail(revFile, `unknown topic "${r.topic}"`);
      for (const k of ["study", "tricks"] as const) {
        const v = r[k];
        if (
          !Array.isArray(v) ||
          v.length === 0 ||
          v.some((x) => typeof x !== "string" || !x.trim())
        )
          fail(revFile, `${r.topic}: ${k} must be a non-empty list of strings`);
      }
    }
  }
  const papers = new Map<string, Set<string>>();
  const pyqDir = path.join(dir, "pyq");
  if (!fs.existsSync(path.join(dir, "topics.json"))) {
    console.log(`${subject}: no topics.json yet, skipped`);
    continue;
  }
  for (const p of fs.existsSync(pyqDir) ? fs.readdirSync(pyqDir) : []) {
    const file = path.join(pyqDir, p, "paper.json");
    if (!fs.existsSync(file)) continue;
    const paper = readJson<{ questions: { id: string; topics: string[] }[] }>(
      file,
    );
    papers.set(p, new Set(paper.questions.map((q) => q.id)));
    for (const q of paper.questions as { id: string; text?: string }[]) {
      toCompile.push({ file, label: `${q.id}: `, source: q.text ?? "" });
      if (escapeBraces(q.text ?? "").count)
        fail(
          file,
          `${q.id}: "{" or "}" in text runs as code in MDX; run node scripts/mdx-braces.ts or write \\{ \\}`,
        );
    }
    for (const q of paper.questions) {
      for (const t of q.topics)
        if (!topics.has(t)) fail(file, `${q.id}: unknown topic "${t}"`);
    }
  }

  const files = [
    ...fs
      .readdirSync(path.join(dir, "notes"))
      .map((f) => path.join(dir, "notes", f)),
    ...[...papers.keys()].flatMap((p) =>
      fs
        .readdirSync(path.join(pyqDir, p))
        .filter((f) => f.endsWith(".mdx"))
        .map((f) => path.join(pyqDir, p, f)),
    ),
  ].filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    // Hinglish copies (<name>.hi.mdx) must sit next to the English file they translate.
    if (
      file.endsWith(".hi.mdx") &&
      !fs.existsSync(file.replace(/\.hi\.mdx$/, ".mdx"))
    )
      fail(file, "Hinglish file has no English counterpart");
    const raw = fs.readFileSync(file, "utf8");
    toCompile.push({ file, label: "", source: raw });
    if (escapeBraces(raw).count)
      fail(
        file,
        `"{", "}" or "<=" outside maths/code breaks MDX; run node scripts/mdx-braces.ts --write ${path.relative(process.cwd(), file)}`,
      );
    const { data, content } = matter(raw);
    const isSolution = file.includes(`${path.sep}pyq${path.sep}`);
    for (const id of (data.references as string[] | undefined) ?? []) {
      if (!refs.has(id))
        fail(file, `frontmatter reference "${id}" is not in references.json`);
    }
    for (const m of content.matchAll(/<Cite id="([^"]+)"/g)) {
      if (!refs.has(m[1] ?? ""))
        fail(file, `<Cite id="${m[1]}"> is not in references.json`);
    }
    for (const m of content.matchAll(/<Img id="([^"]+)"/g)) {
      if (!images.has(m[1] ?? ""))
        fail(file, `<Img id="${m[1]}"> is not in images.json`);
    }
    for (const m of content.matchAll(/<PYQ id="([^"]+)"/g)) {
      const [p, q] = (m[1] ?? "").split("/");
      if (!papers.get(p ?? "")?.has(q ?? ""))
        fail(file, `<PYQ id="${m[1]}"> does not exist`);
    }
    for (const m of content.matchAll(/```mermaid\n([^\n]*)/g)) {
      if (!(m[1] ?? "").startsWith("%% caption:"))
        fail(file, "a mermaid block must start with %% caption: ...");
    }
    if (isSolution) {
      const [, p, q] =
        /pyq[\\/]([^\\/]+)[\\/]([^\\/.]+)(?:\.hi)?\.mdx$/.exec(file) ?? [];
      if (!papers.get(p ?? "")?.has(q ?? ""))
        fail(file, "solution file does not match a question id");
      if (/^#{1,6}\s/m.test(content))
        fail(
          file,
          "solutions must not contain headings (duplicate anchor ids on the paper page)",
        );
    }
  }
  console.log(
    `${subject}: ${files.length} MDX files, ${papers.size} papers checked`,
  );
}
for (const c of toCompile) {
  const e = await compileError(c.source);
  if (e) fail(c.file, `${c.label}MDX does not compile: ${e}`);
}
console.log(`${toCompile.length} MDX sources compiled`);
if (errors > 0) {
  console.error(`\n${errors} problem(s)`);
  process.exit(1);
}
console.log("✓ content valid");
