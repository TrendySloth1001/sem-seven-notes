import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/page-skeleton";
import { SubjectTabs } from "@/components/subject-tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { analyseSheets } from "@/lib/analysis";
import {
  getAnalysis,
  getMasterAnswer,
  getTopics,
  listPapers,
} from "@/lib/content";
import { slugify } from "@/lib/slug";
import { subjects } from "@/lib/syllabus";

export function generateStaticParams() {
  return subjects
    .filter((s) => getAnalysis(s.slug))
    .map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/assignments/[subject]/analysis">): Promise<Metadata> {
  const { subject } = await params;
  const s = subjects.find((x) => x.slug === subject);
  return s ? { title: `${s.name} assignment analysis` } : {};
}

const h2 = "scroll-mt-24 text-2xl font-semibold tracking-tight";
const frame = "mt-4 overflow-hidden rounded-2xl border bg-card";
const TIERS = [
  { tier: 1, title: "Tier 1: must do", blurb: "Set on two or more sheets." },
  {
    tier: 2,
    title: "Tier 2: should do",
    blurb: "Set on one sheet, for 10 or more marks.",
  },
  { tier: 3, title: "Tier 3: if time allows", blurb: "Set once, for less." },
] as const;

function heat(marks: number) {
  if (marks >= 10) return "bg-primary text-primary-foreground";
  if (marks > 0) return "bg-primary/25 text-foreground";
  return "text-muted-foreground/50";
}

async function SheetAnalysis({
  params,
}: PageProps<"/assignments/[subject]/analysis">) {
  const { subject } = await params;
  const s = subjects.find((x) => x.slug === subject);
  const file = getAnalysis(subject);
  if (!s || !file) notFound();
  const topics = getTopics(subject);
  const a = analyseSheets(
    listPapers(subject),
    file.themes,
    (slug) => topics.find((t) => t.slug === slug)?.module ?? 0,
  );
  if (!a.themes.length) notFound();
  const href = (name: string, topic: string) =>
    getMasterAnswer(subject, slugify(name))
      ? `/analysis/${subject}/${slugify(name)}`
      : `/notes/${subject}/${topic}`;
  const themeOf = new Map(
    a.themes.flatMap((t) =>
      t.hits.map((h) => [`${h.paper.slug}/${h.q.id}`, t] as const),
    ),
  );
  const setTotal = a.moduleMarks.reduce((n, m) => n + m.total, 0) || 1;
  const questions = a.sheets.reduce((n, c) => n + c.paper.questions.length, 0);

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <article className="mx-auto max-w-5xl">
        <SubjectTabs subject={subject} active="analysis" />
        <header>
          <p className="font-mono-label text-primary">{s.name}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Assignment analysis
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            Only what your teachers set: {a.sheets.length} sheets and{" "}
            {questions} questions, grouped into {a.themes.length} themes. Past
            papers are left out. Read the{" "}
            <Link
              href={`/assignments/${subject}`}
              className="text-primary underline-offset-2 hover:underline"
            >
              concept answers
            </Link>{" "}
            in this order.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm">
            {a.sheets.map((c) => (
              <li key={c.paper.slug}>
                <Badge variant="secondary" className="font-mono">
                  {c.tag}
                </Badge>{" "}
                {c.paper.session}
              </li>
            ))}
          </ul>
        </header>

        <section aria-labelledby="priority" className="mt-10">
          <h2 id="priority" className={h2}>
            Study priority
          </h2>
          {TIERS.map((tier) => {
            const list = a.themes.filter((t) => t.tier === tier.tier);
            return list.length ? (
              <div key={tier.tier} className="mt-8">
                <h3 className="text-lg font-semibold">
                  {tier.title}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({list.length})
                  </span>
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tier.blurb}
                </p>
                <div className={frame}>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-8 pl-4">#</TableHead>
                        <TableHead>Theme</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead className="pr-4">Set in</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((t, i) => (
                        <TableRow key={t.name}>
                          <TableCell className="pl-4 font-mono text-muted-foreground">
                            {i + 1}
                          </TableCell>
                          <TableCell className="min-w-56 whitespace-normal">
                            <Link
                              href={href(t.name, t.topic)}
                              className="font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {t.name}
                            </Link>
                          </TableCell>
                          <TableCell className="font-mono">
                            M{t.module}
                          </TableCell>
                          <TableCell className="font-mono tabular-nums">
                            {t.marks}
                          </TableCell>
                          <TableCell className="pr-4">
                            <span className="flex min-w-24 flex-wrap gap-1">
                              {t.sheets.map((tag) => {
                                const n = t.hits.filter(
                                  (h) => h.tag === tag,
                                ).length;
                                return (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="font-mono"
                                  >
                                    {tag}
                                    {n > 1 ? `×${n}` : ""}
                                  </Badge>
                                );
                              })}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null;
          })}
        </section>

        <section aria-labelledby="map" className="mt-12">
          <h2 id="map" className={h2}>
            Sheet map
          </h2>
          <p className="mt-2 text-muted-foreground">
            Which sheet set which Tier 1 and Tier 2 theme, and for how many
            marks. Darker cells are 10-mark questions.
          </p>
          <div className={frame}>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="sticky left-0 z-10 bg-muted pl-4">
                    Theme
                  </TableHead>
                  {a.sheets.map((c) => (
                    <TableHead
                      key={c.paper.slug}
                      className="px-1 text-center font-mono"
                      title={c.paper.session}
                    >
                      {c.tag}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {a.themes
                  .filter((t) => t.tier < 3)
                  .map((t) => (
                    <TableRow key={t.name}>
                      <TableCell className="sticky left-0 z-10 min-w-40 max-w-72 whitespace-normal bg-card pl-4 text-sm leading-snug">
                        {t.name}
                      </TableCell>
                      {a.sheets.map((c) => {
                        const m = t.hits
                          .filter((h) => h.paper.slug === c.paper.slug)
                          .reduce((n, h) => n + h.q.marks, 0);
                        return (
                          <TableCell key={c.paper.slug} className="px-1 py-1">
                            <span
                              className={`flex size-8 items-center justify-center rounded-md font-mono text-xs ${heat(m)}`}
                            >
                              {m || "·"}
                            </span>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section aria-labelledby="weightage" className="mt-12">
          <h2 id="weightage" className={h2}>
            Module weightage
          </h2>
          <p className="mt-2 text-muted-foreground">
            Marks your teachers set from each module, on every sheet.
          </p>
          <div className={frame}>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="pl-4">Module</TableHead>
                  {a.sheets.map((c) => (
                    <TableHead
                      key={c.paper.slug}
                      className="px-1 text-center font-mono"
                    >
                      {c.tag}
                    </TableHead>
                  ))}
                  <TableHead className="pr-4 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {a.moduleMarks.map((m) => (
                  <TableRow key={m.module}>
                    <TableCell className="min-w-44 whitespace-normal pl-4">
                      <span className="mr-2 font-mono text-primary">
                        M{m.module}
                      </span>
                      {s.modules.find((x) => x.number === m.module)?.title}
                    </TableCell>
                    {m.perSheet.map((v, i) => (
                      <TableCell
                        key={a.sheets[i]?.paper.slug ?? i}
                        className="px-1 text-center font-mono tabular-nums"
                      >
                        {v}
                      </TableCell>
                    ))}
                    <TableCell className="pr-4 text-right font-mono font-semibold tabular-nums">
                      {m.total}{" "}
                      <span className="font-normal text-muted-foreground">
                        ({Math.round((m.total / setTotal) * 100)}%)
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section aria-labelledby="by-sheet" className="mt-12">
          <h2 id="by-sheet" className={h2}>
            Sheet by sheet
          </h2>
          <p className="mt-2 text-muted-foreground">
            Every question with the theme and module it belongs to.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {a.sheets.map((c) => (
              <details
                key={c.paper.slug}
                className="rounded-2xl border bg-card"
              >
                <summary className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="font-mono text-primary">{c.tag}</span>
                  <span className="font-medium">{c.paper.session}</span>
                </summary>
                <ul className="flex flex-col gap-2 border-t px-4 py-3 text-sm">
                  {c.paper.questions.map((q) => {
                    const t = themeOf.get(`${c.paper.slug}/${q.id}`);
                    return (
                      <li key={q.id} className="flex items-start gap-3">
                        <span className="w-10 shrink-0 font-mono text-muted-foreground">
                          Q{q.label}
                        </span>
                        <span className="min-w-0 flex-1">
                          <Link
                            href={`/pyq/${subject}/${c.paper.slug}#${q.id}`}
                            className="outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {t?.name ?? q.id}
                          </Link>
                          <span className="text-muted-foreground">
                            {" "}
                            · M{t?.module ?? "?"} · {q.marks} marks
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </details>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}

export default function SheetAnalysisPage(
  props: PageProps<"/assignments/[subject]/analysis">,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SheetAnalysis {...props} />
    </Suspense>
  );
}
