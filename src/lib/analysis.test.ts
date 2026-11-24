import assert from "node:assert/strict";
import { test } from "node:test";
import {
  type APaper,
  analyse,
  analyseSheets,
  sheetTier,
  themeProblems,
  tierOf,
} from "./analysis.ts";

const papers: APaper[] = [
  {
    slug: "2024-12",
    session: "December 2024",
    date: "2024-11-20",
    questions: [
      { id: "q1a", label: "1a", marks: 5 },
      { id: "q2a", label: "2a", marks: 10 },
    ],
  },
  {
    slug: "2024-05",
    session: "May 2024",
    date: "2024-05-20",
    questions: [
      { id: "q1a", label: "1a", marks: 5 },
      { id: "q2a", label: "2a", marks: 10 },
    ],
  },
  {
    slug: "assignment-1",
    session: "Assignment 1",
    date: null,
    assignment: true,
    questions: [{ id: "q1", label: "1", marks: 10 }],
  },
];

const defs = [
  {
    name: "Pooling",
    topic: "cnn",
    type: "theory" as const,
    questions: ["2024-05/q1a", "2024-12/q1a", "assignment-1/q1"],
  },
  {
    name: "GAN",
    topic: "gan",
    type: "theory" as const,
    questions: ["2024-05/q2a"],
  },
  {
    name: "LSTM",
    topic: "lstm",
    type: "theory" as const,
    questions: ["2024-12/q2a"],
  },
];

test("tiers: frequent or repeated-and-set first, once-asked last", () => {
  assert.equal(tierOf(5, 10, false), 1);
  assert.equal(tierOf(4, 10, true), 1);
  assert.equal(tierOf(4, 10, false), 2);
  assert.equal(tierOf(2, 10, false), 2);
  assert.equal(tierOf(0, 10, true), 2);
  assert.equal(tierOf(1, 10, false), 3);
});

test("analyse tags papers by date, ranks themes and sums module marks", () => {
  const a = analyse(papers, defs, (t) => ({ cnn: 4, gan: 6, lstm: 5 })[t] ?? 0);
  assert.deepEqual(
    a.papers.map((p) => `${p.tag}:${p.paper.slug}`),
    ["P1:2024-05", "P2:2024-12"],
  );
  assert.equal(a.assignments[0]?.tag, "A1");
  assert.equal(a.sessionCount, 2);
  const [top] = a.themes;
  assert.equal(top?.name, "Pooling");
  assert.equal(top?.tier, 1);
  assert.deepEqual(top?.marks, [5, 10]);
  assert.deepEqual(a.moduleMarks.find((m) => m.module === 4)?.perPaper, [5, 5]);
  assert.deepEqual(
    a.moduleMarks.find((m) => m.module === 6)?.perPaper,
    [10, 0],
  );
});

test("themeProblems finds unknown, doubled and missing questions", () => {
  assert.deepEqual(themeProblems(papers, defs), []);
  const bad = [
    { ...defs[0], questions: ["2024-05/q1a", "2024-05/q9"] },
    { ...defs[1], questions: ["2024-05/q1a"] },
  ].map((d) => ({
    name: d.name ?? "",
    topic: "x",
    type: "theory" as const,
    questions: d.questions,
  }));
  const p = themeProblems(papers, bad);
  assert.ok(p.some((x) => x.includes("unknown question 2024-05/q9")));
  assert.ok(p.some((x) => x.includes("in both")));
  assert.ok(p.some((x) => x.includes("2024-12/q2a is in no theme")));
});

test("sheet analysis counts only assignments and ranks repeats first", () => {
  const sheets: APaper[] = [
    ...papers,
    {
      slug: "assignment-2",
      session: "Assignment 2",
      date: null,
      assignment: true,
      questions: [{ id: "q1", label: "1", marks: 5 }],
    },
  ];
  const defs = [
    {
      name: "Once",
      topic: "t",
      type: "theory" as const,
      questions: ["assignment-2/q1", "2024-12/q1a"],
    },
    {
      name: "Twice",
      topic: "t",
      type: "theory" as const,
      questions: ["assignment-1/q1", "assignment-2/q1"]
        .slice(0, 1)
        .concat(["2024-05/q2a"]),
    },
    {
      name: "Exam only",
      topic: "t",
      type: "theory" as const,
      questions: ["2024-12/q2a"],
    },
  ];
  const a = analyseSheets(sheets, defs, () => 1);
  assert.deepEqual(
    a.themes.map((t) => t.name),
    ["Twice", "Once"],
  );
  assert.equal(a.themes[0]?.marks, 10);
  assert.equal(sheetTier(2, 5), 1);
  assert.equal(sheetTier(1, 10), 2);
  assert.equal(sheetTier(1, 5), 3);
});
