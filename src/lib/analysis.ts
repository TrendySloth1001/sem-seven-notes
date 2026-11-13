// Theme-level exam analysis: which question themes each paper asked, how often, and how marks spread over modules.
// Pure functions over paper data and a subject's analysis.json, so the page and the tests share them.

export type ThemeDef = {
  name: string;
  topic: string;
  type: "theory" | "numerical" | "program";
  /** "<paper slug>/<question id>", e.g. "2024-05/q2b". */
  questions: string[];
};

export type AQ = { id: string; label: string; marks: number; note?: string };
export type APaper = {
  slug: string;
  session: string;
  date: string | null;
  branch?: string;
  assignment?: boolean;
  questions: AQ[];
};

export type Hit<P extends APaper = APaper> = { paper: P; q: AQ; tag: string };

export type ThemeStat<P extends APaper = APaper> = ThemeDef & {
  module: number;
  /** Exam appearances, oldest paper first. */
  asked: Hit<P>[];
  /** Questions on it in the teachers' class assignments. */
  set: Hit<P>[];
  /** Distinct exam sessions it appeared in. */
  sessions: string[];
  marks: number[];
  tier: 1 | 2 | 3;
  /** Every question in it is marked outside the student's syllabus. */
  offSyllabus: boolean;
};

export type Analysis<P extends APaper = APaper> = {
  /** Exam papers oldest first, each with its short tag (P1, P2, ...). */
  papers: { paper: P; tag: string }[];
  assignments: { paper: P; tag: string }[];
  sessionCount: number;
  themes: ThemeStat<P>[];
  /** Marks set per module in each exam paper, in `papers` order. */
  moduleMarks: { module: number; perPaper: number[]; average: number }[];
};

/** Sessions like "2024-12" from slugs like "2024-12" or "2024-12-ce". */
const sessionOf = (slug: string) => slug.slice(0, 7);

/**
 * Tier 1: in at least half of the exam sessions, or in a third of them and also set by the teachers.
 * Tier 2: repeated, or set by the teachers. Tier 3: asked once.
 */
export function tierOf(
  sessions: number,
  total: number,
  teacher: boolean,
): 1 | 2 | 3 {
  if (sessions >= Math.max(2, Math.ceil(total / 2))) return 1;
  if (teacher && sessions >= Math.max(2, Math.ceil(total / 3))) return 1;
  if (sessions >= 2 || teacher) return 2;
  return 3;
}

export function analyse<P extends APaper>(
  all: P[],
  defs: ThemeDef[],
  moduleOf: (topic: string) => number,
): Analysis<P> {
  const byDate = (a: P, b: P) =>
    (a.date ?? a.slug).localeCompare(b.date ?? b.slug) ||
    a.slug.localeCompare(b.slug);
  const papers = all
    .filter((p) => !p.assignment)
    .sort(byDate)
    .map((paper, i) => ({ paper, tag: `P${i + 1}` }));
  const assignments = all
    .filter((p) => p.assignment)
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((paper, i) => ({ paper, tag: `A${i + 1}` }));
  const tagged = new Map(
    [...papers, ...assignments].map((x) => [x.paper.slug, x]),
  );
  const sessionCount = new Set(papers.map((x) => sessionOf(x.paper.slug))).size;
  const order = new Map(papers.map((x, i) => [x.paper.slug, i]));

  const themes = defs.map((d) => {
    const hits = d.questions.flatMap((ref) => {
      const [slug = "", id] = ref.split("/");
      const t = tagged.get(slug);
      const q = t?.paper.questions.find((x) => x.id === id);
      return t && q ? [{ paper: t.paper, q, tag: t.tag }] : [];
    });
    const asked = hits
      .filter((h) => !h.paper.assignment)
      .sort(
        (a, b) =>
          (order.get(a.paper.slug) ?? 0) - (order.get(b.paper.slug) ?? 0),
      );
    const set = hits.filter((h) => h.paper.assignment);
    const sessions = [
      ...new Set(asked.map((h) => sessionOf(h.paper.slug))),
    ].sort();
    return {
      ...d,
      module: moduleOf(d.topic),
      asked,
      set,
      sessions,
      marks: [...new Set(hits.map((h) => h.q.marks))].sort((a, b) => a - b),
      tier: tierOf(sessions.length, sessionCount, set.length > 0),
      offSyllabus:
        hits.length > 0 &&
        hits.every((h) => h.q.note?.startsWith("Not in") ?? false),
    };
  });
  // Most important first: tier, then sessions, then marks asked, then how recent.
  const latest = (t: ThemeStat<P>) =>
    Math.max(-1, ...t.asked.map((h) => order.get(h.paper.slug) ?? -1));
  const marksAsked = (t: ThemeStat<P>) =>
    t.asked.reduce((n, h) => n + h.q.marks, 0);
  themes.sort(
    (a, b) =>
      a.tier - b.tier ||
      b.sessions.length - a.sessions.length ||
      b.set.length - a.set.length ||
      marksAsked(b) - marksAsked(a) ||
      latest(b) - latest(a),
  );

  const modules = [...new Set(themes.map((t) => t.module))].sort(
    (a, b) => a - b,
  );
  const moduleMarks = modules.map((module) => {
    const perPaper = papers.map(({ paper }) =>
      themes
        .filter((t) => t.module === module && !t.offSyllabus)
        .flatMap((t) => t.asked)
        .filter((h) => h.paper.slug === paper.slug)
        .reduce((n, h) => n + h.q.marks, 0),
    );
    const average = perPaper.length
      ? perPaper.reduce((n, x) => n + x, 0) / perPaper.length
      : 0;
    return { module, perPaper, average };
  });

  return { papers, assignments, sessionCount, themes, moduleMarks };
}

/** Problems with a subject's theme file: unknown ids, ids used twice, questions left out. */
export function themeProblems(all: APaper[], defs: ThemeDef[]): string[] {
  const known = new Set(
    all.flatMap((p) => p.questions.map((q) => `${p.slug}/${q.id}`)),
  );
  const seen = new Map<string, string>();
  const out: string[] = [];
  for (const d of defs)
    for (const ref of d.questions) {
      if (!known.has(ref)) out.push(`unknown question ${ref} in "${d.name}"`);
      const prev = seen.get(ref);
      if (prev) out.push(`${ref} is in both "${prev}" and "${d.name}"`);
      seen.set(ref, d.name);
    }
  for (const ref of known)
    if (!seen.has(ref)) out.push(`question ${ref} is in no theme`);
  return out;
}
