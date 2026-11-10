// Exam-pattern analysis over a subject's past papers: how much each topic is worth, which questions repeat,
// and what is likely to come next. Pure functions over paper data, so the page and the tests share them.

export type PQ = {
  id: string;
  label: string;
  marks: number;
  topics: string[];
  text: string;
};
export type PPaper = {
  slug: string;
  session: string;
  branch?: string;
  questions: PQ[];
};

/** Own-branch papers count fully; other branches' papers are good evidence but count less. */
export const OTHER_BRANCH_WEIGHT = 0.7;

// Exam-instruction words carry no topic meaning, so they are ignored when comparing questions.
const STOP = new Set(
  `a an and are as at be by can do does for from give how in into is it its of on or the their them then there these this to two using what when where which while why with your you short note notes write explain describe discuss define state list compare differentiate between difference detail details detailed brief briefly suitable example examples neat diagram diagrams help working work works various different types type significance role need importance important advantages disadvantages applications application its any following each concept concepts`.split(
    " ",
  ),
);

export function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/\\[{}]/g, " ")
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/[\s-]+/)
      .map((w) => w.replace(/(ies)$/, "y").replace(/(?<=[a-z]{3})s$/, ""))
      .filter((w) => w.length > 1 && !STOP.has(w)),
  );
}

export function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return inter / (a.size + b.size - inter);
}

/** Sessions oldest to newest, from slugs like "2024-12" or "2024-12-ce". */
export function sessionOrder(papers: PPaper[]): string[] {
  return [...new Set(papers.map((p) => p.slug.slice(0, 7)))].sort();
}

/** 1 for the oldest session up to 2 for the newest: recent papers say more about the next one. */
export function recencyWeight(slug: string, order: string[]): number {
  const i = order.indexOf(slug.slice(0, 7));
  return order.length <= 1 ? 2 : 1 + i / (order.length - 1);
}

export type Asked<P extends PPaper = PPaper> = {
  paper: P;
  q: P["questions"][number];
};

export type Cluster<P extends PPaper = PPaper> = {
  /** The newest wording, used as the headline. */
  head: Asked<P>;
  all: Asked<P>[];
  topics: string[];
  /** Distinct sessions it appeared in. */
  sessions: string[];
  lastSession: string;
  score: number;
};

/** Groups questions that ask the same thing (similar wording and a shared topic). */
export function clusterQuestions<P extends PPaper>(
  papers: P[],
  threshold = 0.5,
): Cluster<P>[] {
  const order = sessionOrder(papers);
  const asked: Asked<P>[] = papers
    .flatMap((paper) => paper.questions.map((q) => ({ paper, q })))
    .sort((x, y) => y.paper.slug.localeCompare(x.paper.slug));
  const groups: { toks: Set<string>; items: Asked<P>[] }[] = [];
  for (const a of asked) {
    const t = tokens(a.q.text);
    const home = groups.find(
      (g) =>
        similarity(g.toks, t) >= threshold &&
        (g.items[0]?.q.topics.some((x) => a.q.topics.includes(x)) ?? false),
    );
    if (home) home.items.push(a);
    else groups.push({ toks: t, items: [a] });
  }
  return groups
    .map(({ items }) => {
      const sessions = [
        ...new Set(items.map((i) => i.paper.slug.slice(0, 7))),
      ].sort();
      const [head] = items;
      if (!head) throw new Error("empty question group");
      const score = items.reduce(
        (s, i) =>
          s +
          recencyWeight(i.paper.slug, order) *
            (i.paper.branch ? OTHER_BRANCH_WEIGHT : 1),
        0,
      );
      return {
        head,
        all: items,
        topics: [...new Set(items.flatMap((i) => i.q.topics))],
        sessions,
        lastSession: sessions[sessions.length - 1] ?? "",
        score,
      };
    })
    .sort(
      (a, b) => b.score - a.score || b.lastSession.localeCompare(a.lastSession),
    );
}

export type TopicStat = {
  slug: string;
  times: number;
  ownTimes: number;
  marks: number;
  sessions: string[];
  lastSession: string;
  score: number;
  level: "Very high" | "High" | "Medium" | "Low" | "Not asked";
};

/** Importance of each topic: marks asked, weighted by recency and branch, scaled against the top topic. */
export function topicStats(
  papers: PPaper[],
  topicSlugs: string[],
): TopicStat[] {
  const order = sessionOrder(papers);
  const stats = topicSlugs.map((slug) => {
    const hits = papers.flatMap((paper) =>
      paper.questions
        .filter((q) => q.topics.includes(slug))
        .map((q) => ({ paper, q })),
    );
    const sessions = [
      ...new Set(hits.map((h) => h.paper.slug.slice(0, 7))),
    ].sort();
    return {
      slug,
      times: hits.length,
      ownTimes: hits.filter((h) => !h.paper.branch).length,
      // A question tagged with several topics shares its marks between them.
      marks: hits.reduce((s, h) => s + h.q.marks / h.q.topics.length, 0),
      sessions,
      lastSession: sessions[sessions.length - 1] ?? "",
      score: hits.reduce(
        (s, h) =>
          s +
          (h.q.marks / h.q.topics.length) *
            recencyWeight(h.paper.slug, order) *
            (h.paper.branch ? OTHER_BRANCH_WEIGHT : 1),
        0,
      ),
    };
  });
  // Levels by rank among asked topics, so a subject whose marks are spread evenly still shows what leads.
  const asked = stats
    .filter((x) => x.times > 0)
    .sort((a, b) => b.score - a.score);
  const rank = new Map(asked.map((x, k) => [x.slug, k / asked.length]));
  return stats
    .map((x) => {
      const r = rank.get(x.slug);
      const level: TopicStat["level"] =
        r === undefined
          ? "Not asked"
          : r < 0.2
            ? "Very high"
            : r < 0.5
              ? "High"
              : r < 0.8
                ? "Medium"
                : "Low";
      return { ...x, level };
    })
    .sort((a, b) => b.score - a.score);
}

/** Important topics that the newest paper skipped: examiners often come back to them. */
export function dueTopics(stats: TopicStat[], papers: PPaper[]): TopicStat[] {
  const latest = sessionOrder(papers).at(-1);
  return stats.filter(
    (s) =>
      (s.level === "Very high" || s.level === "High") &&
      s.lastSession !== latest,
  );
}
