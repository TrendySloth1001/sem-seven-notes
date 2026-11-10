import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clusterQuestions,
  dueTopics,
  type PPaper,
  recencyWeight,
  sessionOrder,
  topicStats,
} from "./patterns.ts";

const papers: PPaper[] = [
  {
    slug: "2023-12",
    session: "December 2023",
    questions: [
      {
        id: "q1a",
        label: "1a",
        marks: 5,
        topics: ["cnn"],
        text: "Explain pooling in CNN.",
      },
      {
        id: "q2a",
        label: "2a",
        marks: 10,
        topics: ["gan"],
        text: "Explain GAN architecture with a neat diagram.",
      },
    ],
  },
  {
    slug: "2024-12-ce",
    session: "December 2024",
    branch: "Computer Engineering",
    questions: [
      {
        id: "q1a",
        label: "1a",
        marks: 5,
        topics: ["cnn"],
        text: "Explain the pooling operation in CNN.",
      },
    ],
  },
  {
    slug: "2025-05",
    session: "May 2025",
    questions: [
      {
        id: "q1a",
        label: "1a",
        marks: 5,
        topics: ["cnn"],
        text: "Describe pooling in CNN with example.",
      },
      {
        id: "q3a",
        label: "3a",
        marks: 10,
        topics: ["rnn"],
        text: "Explain BPTT in RNN.",
      },
    ],
  },
];

test("orders sessions and weights recent ones more", () => {
  assert.deepEqual(sessionOrder(papers), ["2023-12", "2024-12", "2025-05"]);
  assert.equal(recencyWeight("2023-12", sessionOrder(papers)), 1);
  assert.equal(recencyWeight("2025-05", sessionOrder(papers)), 2);
});

test("groups the same question asked with different wording", () => {
  const c = clusterQuestions(papers);
  const pooling = c.find((x) => x.topics.includes("cnn"));
  assert.equal(pooling?.all.length, 3);
  assert.deepEqual(pooling?.sessions, ["2023-12", "2024-12", "2025-05"]);
  assert.equal(pooling?.head.paper.slug, "2025-05");
  assert.equal(c[0]?.topics[0], "cnn");
});

test("ranks topics and flags important ones the latest paper skipped", () => {
  const s = topicStats(papers, ["cnn", "gan", "rnn", "lstm"]);
  assert.equal(s.find((x) => x.slug === "lstm")?.level, "Not asked");
  assert.equal(s.find((x) => x.slug === "cnn")?.times, 3);
  assert.equal(s.find((x) => x.slug === "cnn")?.ownTimes, 2);
  const due = dueTopics(s, papers).map((x) => x.slug);
  assert.ok(!due.includes("cnn"));
  assert.ok(!due.includes("rnn"));
});
