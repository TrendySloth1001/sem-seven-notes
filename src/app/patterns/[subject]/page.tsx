import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PaperChip, TopicChip } from "@/components/chips";
import { PageSkeleton } from "@/components/page-skeleton";
import { SubjectTabs } from "@/components/subject-tabs";
import { Toc, type TocItem } from "@/components/toc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getTopics, listExamPapers, type Paper } from "@/lib/content";
import {
  type Cluster,
  clusterQuestions,
  dueTopics,
  OTHER_BRANCH_WEIGHT,
  type TopicStat,
  topicStats,
} from "@/lib/patterns";
import { subjects, totalHours } from "@/lib/syllabus";

export function generateStaticParams() {
  return subjects
    .filter((s) => listExamPapers(s.slug).length > 0)
    .map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/patterns/[subject]">): Promise<Metadata> {
  const { subject } = await params;
  const s = subjects.find((x) => x.slug === subject);
  return s ? { title: `${s.name} exam patterns` } : {};
}

const h2 = "scroll-mt-24 text-2xl font-semibold tracking-tight";

const LEVEL_STYLE: Record<
  TopicStat["level"],
  "default" | "secondary" | "outline"
> = {
  "Very high": "default",
  High: "secondary",
  Medium: "outline",
  Low: "outline",
  "Not asked": "outline",
};

function ClusterCard({
  c,
  subject,
  rank,
  sessionName,
  topicTitle,
}: {
  c: Cluster<Paper>;
  subject: string;
  rank: number;
  sessionName: (slug: string) => string;
  topicTitle: (slug: string) => string;
}) {
  const marks = [...new Set(c.all.map((a) => a.q.marks))].sort((a, b) => a - b);
  return (
    <li className="rounded-2xl border bg-card p-4">
      <div className="flex gap-3">
        <span className="font-mono text-sm text-muted-foreground">
          {String(rank).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-relaxed [overflow-wrap:anywhere]">
            {c.head.q.text.replace(/\\([{}])/g, "$1")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>Asked {c.all.length}×</Badge>
            <Badge variant="secondary">
              in {c.sessions.length} session{c.sessions.length > 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline">Last: {sessionName(c.lastSession)}</Badge>
            <Badge variant="outline" className="font-mono">
              {marks.join(" / ")} marks
            </Badge>
          </div>
          <details className="group mt-3">
            <summary className="cursor-pointer text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
              How it was asked each time
            </summary>
            <ul className="mt-2 flex flex-col gap-2">
              {c.all.map((a) => (
                <li
                  key={`${a.paper.slug}-${a.q.id}`}
                  className="flex flex-col gap-1 text-sm sm:flex-row sm:items-start sm:gap-3"
                >
                  <span className="shrink-0">
                    <PaperChip
                      subject={subject}
                      paper={a.paper}
                      question={a.q}
                    />
                  </span>
                  <span className="text-muted-foreground [overflow-wrap:anywhere]">
                    {a.q.text.replace(/\\([{}])/g, "$1")}
                  </span>
                </li>
              ))}
            </ul>
          </details>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button asChild size="sm" className="min-h-9 rounded-full px-4">
              <Link
                href={`/pyq/${subject}/${c.head.paper.slug}#${c.head.q.id}`}
              >
                See the solution
              </Link>
            </Button>
            {c.topics.map((t) => (
              <TopicChip
                key={t}
                subject={subject}
                topic={{ slug: t, title: topicTitle(t), module: 0 }}
              />
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

async function PatternsContent({ params }: PageProps<"/patterns/[subject]">) {
  const { subject } = await params;
  const s = subjects.find((x) => x.slug === subject);
  const papers = listExamPapers(subject);
  if (!s || papers.length === 0) notFound();
  const topics = getTopics(subject);

  const sessions = new Map(papers.map((p) => [p.slug.slice(0, 7), p.session]));
  const sessionName = (slug: string) => sessions.get(slug) ?? slug;
  const topicTitle = (slug: string) =>
    topics.find((t) => t.slug === slug)?.title ?? slug;

  const clusters = clusterQuestions(papers);
  const repeated = clusters.filter((c) => c.sessions.length >= 2);
  const likely = repeated.slice(0, 10);
  const stats = topicStats(
    papers,
    topics.map((t) => t.slug),
  );
  const due = dueTopics(stats, papers);
  const topScore = Math.max(...stats.map((x) => x.score), 1);
  const own = papers.filter((p) => !p.branch).length;
  const questionCount = papers.reduce((n, p) => n + p.questions.length, 0);

  const hours = totalHours(s);
  const totalMarks = stats.reduce((n, x) => n + x.marks, 0) || 1;
  const modules = s.modules.map((m) => {
    const marks = stats
      .filter((x) => topics.find((t) => t.slug === x.slug)?.module === m.number)
      .reduce((n, x) => n + x.marks, 0);
    return {
      ...m,
      marksPct: (marks / totalMarks) * 100,
      hoursPct: (m.hours / hours) * 100,
    };
  });

  const toc: TocItem[] = [
    { id: "likely", text: "Most likely this time" },
    ...(due.length ? [{ id: "due", text: "Due back" }] : []),
    { id: "importance", text: "Topic importance" },
    { id: "modules", text: "Module weightage" },
    { id: "repeated", text: "All repeated questions" },
    { id: "method", text: "How this is worked out" },
  ];

  return (
    <div className="flex gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <article className="min-w-0 flex-1">
        <SubjectTabs subject={subject} active="patterns" />
        <header>
          <p className="font-mono-label text-primary">{s.name}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Exam patterns
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            Worked out from {papers.length} past papers ({own} for your branch,{" "}
            {papers.length - own} Computer Engineering) and {questionCount}{" "}
            questions. The counts are facts from the papers; “likely” is a
            pattern, not a promise, so still cover the whole syllabus.
          </p>
        </header>

        <section aria-labelledby="likely" className="mt-10">
          <h2 id="likely" className={h2}>
            Most likely this time
          </h2>
          <p className="mt-2 text-muted-foreground">
            Questions that keep coming back, ranked by how often and how
            recently they were asked. Prepare these first.
          </p>
          <ol className="mt-4 grid items-start gap-3 2xl:grid-cols-2">
            {likely.map((c, i) => (
              <ClusterCard
                key={`${c.head.paper.slug}-${c.head.q.id}`}
                c={c}
                subject={subject}
                rank={i + 1}
                sessionName={sessionName}
                topicTitle={topicTitle}
              />
            ))}
          </ol>
        </section>

        {due.length ? (
          <section aria-labelledby="due" className="mt-12">
            <h2 id="due" className={h2}>
              Due back
            </h2>
            <p className="mt-2 text-muted-foreground">
              Important topics that the latest paper skipped. Examiners often
              return to them.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {due.map((t) => (
                <li key={t.slug}>
                  <TopicChip
                    subject={subject}
                    topic={{
                      slug: t.slug,
                      title: topicTitle(t.slug),
                      module: 0,
                    }}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="importance" className="mt-12">
          <h2 id="importance" className={h2}>
            Topic importance
          </h2>
          <p className="mt-2 text-muted-foreground">
            Marks asked on each topic. Recent papers count more, and Computer
            Engineering papers count {Math.round(OTHER_BRANCH_WEIGHT * 100)}% of
            yours.
          </p>
          <ul className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {stats.map((t) => (
              <li
                key={t.slug}
                className="flex flex-col gap-2 rounded-2xl border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/notes/${subject}/${t.slug}`}
                    className="font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {topicTitle(t.slug)}
                  </Link>
                  <Badge variant={LEVEL_STYLE[t.level]}>{t.level}</Badge>
                </div>
                <Progress
                  value={(t.score / topScore) * 100}
                  aria-label={`${topicTitle(t.slug)} importance`}
                />
                <p className="text-xs text-muted-foreground">
                  {t.times === 0
                    ? "Not asked in these papers yet."
                    : `Asked ${t.times}× (${t.ownTimes} in your branch) · about ${Math.round(t.marks)} marks · last ${sessionName(t.lastSession)}`}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="modules" className="mt-12">
          <h2 id="modules" className={h2}>
            Module weightage
          </h2>
          <p className="mt-2 text-muted-foreground">
            Share of past-paper marks against share of lecture hours. A module
            with more marks than hours pays back more per hour of study.
          </p>
          <ul className="mt-4 grid gap-x-8 gap-y-4 rounded-2xl border bg-card p-4 lg:grid-cols-2">
            {modules.map((m) => (
              <li key={m.number} className="flex flex-col gap-1.5">
                <p className="text-sm font-medium">
                  <span className="mr-2 font-mono text-primary">
                    {m.number}
                  </span>
                  {m.title}
                </p>
                <div className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 text-xs text-muted-foreground">
                  <span>Marks</span>
                  <Progress
                    value={m.marksPct}
                    aria-label={`${m.title} share of marks`}
                  />
                  <span className="font-mono tabular-nums">
                    {Math.round(m.marksPct)}%
                  </span>
                  <span>Hours</span>
                  <Progress
                    value={m.hoursPct}
                    aria-label={`${m.title} share of hours`}
                  />
                  <span className="font-mono tabular-nums">
                    {Math.round(m.hoursPct)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="repeated" className="mt-12">
          <h2 id="repeated" className={h2}>
            All repeated questions
          </h2>
          <p className="mt-2 text-muted-foreground">
            {repeated.length} questions were asked in two or more sessions.
          </p>
          <ol className="mt-4 grid items-start gap-3 2xl:grid-cols-2">
            {repeated.map((c, i) => (
              <ClusterCard
                key={`all-${c.head.paper.slug}-${c.head.q.id}`}
                c={c}
                subject={subject}
                rank={i + 1}
                sessionName={sessionName}
                topicTitle={topicTitle}
              />
            ))}
          </ol>
        </section>

        <section aria-labelledby="method" className="mt-12">
          <h2 id="method" className={h2}>
            How this is worked out
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
            <li>
              Questions are grouped when their wording overlaps strongly and
              they share a topic, so “Explain X” and “Illustrate the working of
              X with an example” count as one question.
            </li>
            <li>
              Each appearance scores more the newer the paper is (the newest
              counts twice the oldest), and a Computer Engineering paper counts{" "}
              {Math.round(OTHER_BRANCH_WEIGHT * 100)}%.
            </li>
            <li>
              Topic importance adds up the marks of every question on the topic
              with the same weights; a question on two topics shares its marks.
              Levels are by rank: top 20% very high, next 30% high, next 30%
              medium.
            </li>
            <li>
              Since your college became autonomous this semester, the paper may
              change style; the repeats here come from University of Mumbai
              papers.
            </li>
          </ul>
        </section>
      </article>

      <aside className="hidden w-60 shrink-0 xl:block">
        <div className="sticky top-24">
          <Toc items={toc} />
        </div>
      </aside>
    </div>
  );
}

export default function PatternsPage(props: PageProps<"/patterns/[subject]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PatternsContent {...props} />
    </Suspense>
  );
}
