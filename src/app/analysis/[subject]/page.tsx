import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DoneCheck, DoneProgress } from "@/components/done";
import { PageSkeleton } from "@/components/page-skeleton";
import { SubjectTabs } from "@/components/subject-tabs";
import { Toc, type TocItem } from "@/components/toc";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { analyse, type ThemeStat } from "@/lib/analysis";
import { getAnalysis, getTopics, listPapers, type Paper } from "@/lib/content";
import { doneId } from "@/lib/done";
import { subjects } from "@/lib/syllabus";

export function generateStaticParams() {
  return subjects
    .filter((s) => getAnalysis(s.slug))
    .map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/analysis/[subject]">): Promise<Metadata> {
  const { subject } = await params;
  const s = subjects.find((x) => x.slug === subject);
  return s ? { title: `${s.name} exam analysis` } : {};
}

const h2 = "scroll-mt-24 text-2xl font-semibold tracking-tight";
const frame = "mt-4 overflow-hidden rounded-2xl border bg-card";
const TYPE = { theory: "T", numerical: "N", program: "P" } as const;
const TIERS = [
  {
    tier: 1,
    title: "Tier 1: must do",
    blurb:
      "In at least half of the exam sessions, or in a third of them and also set by your teachers.",
  },
  {
    tier: 2,
    title: "Tier 2: should do",
    blurb: "Asked in two or more sessions, or set by your teachers.",
  },
  {
    tier: 3,
    title: "Tier 3: if time allows",
    blurb: "Asked once so far.",
  },
] as const;

// Darker cells for more marks, so the paper map reads like a heat map.
function heat(marks: number) {
  if (marks >= 10) return "bg-primary text-primary-foreground";
  if (marks > 0) return "bg-primary/25 text-foreground";
  return "text-muted-foreground/50";
}

function ThemeTable({
  subject,
  themes,
  sessionCount,
  topicHref,
}: {
  subject: string;
  themes: ThemeStat<Paper>[];
  sessionCount: number;
  topicHref: (slug: string) => string;
}) {
  return (
    <div className={frame}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12 pl-3">
              <span className="sr-only">Learned</span>
            </TableHead>
            <TableHead className="w-8 px-1">#</TableHead>
            <TableHead>Theme</TableHead>
            <TableHead>Module</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Sessions</TableHead>
            <TableHead className="pr-4">Asked in</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {themes.map((t, i) => (
            <TableRow key={t.name}>
              <TableCell className="py-1 pl-3">
                <DoneCheck id={doneId.theme(subject, t.name)} label={t.name} />
              </TableCell>
              <TableCell className="px-1 font-mono text-muted-foreground">
                {i + 1}
              </TableCell>
              <TableCell className="min-w-56 whitespace-normal">
                <Link
                  href={topicHref(t.topic)}
                  className="font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t.name}
                </Link>
                <span className="block text-xs text-muted-foreground">
                  {t.marks.join(" / ")} marks
                </span>
              </TableCell>
              <TableCell className="font-mono">M{t.module}</TableCell>
              <TableCell className="font-mono">{TYPE[t.type]}</TableCell>
              <TableCell className="font-mono tabular-nums">
                {t.sessions.length}/{sessionCount}
              </TableCell>
              <TableCell className="pr-4">
                <span className="flex min-w-40 flex-wrap gap-1">
                  {[...t.asked, ...t.set]
                    .map((h) => h.tag)
                    .filter((tag, i, all) => all.indexOf(tag) === i)
                    .map((tag) => {
                      const n = [...t.asked, ...t.set].filter(
                        (h) => h.tag === tag,
                      ).length;
                      return (
                        <Badge
                          key={tag}
                          variant={
                            tag.startsWith("A") ? "secondary" : "outline"
                          }
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
  );
}

async function AnalysisContent({ params }: PageProps<"/analysis/[subject]">) {
  const { subject } = await params;
  const s = subjects.find((x) => x.slug === subject);
  const file = getAnalysis(subject);
  if (!s || !file) notFound();
  const topics = getTopics(subject);
  const moduleOf = (slug: string) =>
    topics.find((t) => t.slug === slug)?.module ?? 0;
  const a = analyse(listPapers(subject), file.themes, moduleOf);
  const N = a.sessionCount;
  const topicHref = (slug: string) => `/notes/${subject}/${slug}`;
  const inSyllabus = a.themes.filter((t) => !t.offSyllabus);
  const off = a.themes.filter((t) => t.offSyllabus);
  const mapped = inSyllabus.filter((t) => t.tier < 3);
  const cols = [...a.papers, ...a.assignments];
  const themeOf = new Map(
    a.themes.flatMap((t) =>
      [...t.asked, ...t.set].map((h) => [`${h.paper.slug}/${h.q.id}`, t]),
    ),
  );
  const setTotal = a.moduleMarks.reduce((n, m) => n + m.average, 0) || 1;
  const own = a.papers.filter((p) => !p.paper.branch).length;

  const toc: TocItem[] = [
    { id: "priority", text: "Study priority" },
    { id: "map", text: "Paper map" },
    { id: "weightage", text: "Module weightage" },
    { id: "by-module", text: "Module by module" },
    { id: "strategy", text: "How to plan the paper" },
    { id: "by-paper", text: "Paper by paper" },
    { id: "papers", text: "Papers analysed" },
  ];

  return (
    <div className="flex gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <article className="min-w-0 flex-1">
        <SubjectTabs subject={subject} active="analysis" />
        <header>
          <p className="font-mono-label text-primary">{s.name}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Exam analysis
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            Every question from {a.papers.length} past papers ({N} exam
            sessions, {own} for your branch)
            {a.assignments.length
              ? ` and ${a.assignments.length} class assignments`
              : ""}
            , grouped into {a.themes.length} themes: the thing each question
            really asks. Learn a theme once and you can answer every question in
            it.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm">
            <li>
              <Badge variant="outline" className="font-mono">
                P1…P{a.papers.length}
              </Badge>{" "}
              exam papers, oldest first
            </li>
            {a.assignments.length ? (
              <li>
                <Badge variant="secondary" className="font-mono">
                  A1
                </Badge>{" "}
                class assignment
              </li>
            ) : null}
            <li>
              <span className="font-mono">T</span> theory ·{" "}
              <span className="font-mono">N</span> numerical
              {a.themes.some((t) => t.type === "program") ? (
                <>
                  {" "}
                  · <span className="font-mono">P</span> program
                </>
              ) : null}
            </li>
          </ul>
        </header>

        <div className="mt-8 max-w-xl">
          <DoneProgress
            title="Themes learned"
            rows={TIERS.map((tier) => ({
              label: `Tier ${tier.tier}`,
              ids: inSyllabus
                .filter((t) => t.tier === tier.tier)
                .map((t) => doneId.theme(subject, t.name)),
            }))}
          />
        </div>

        <section aria-labelledby="priority" className="mt-10">
          <h2 id="priority" className={h2}>
            Study priority
          </h2>
          <p className="mt-2 text-muted-foreground">
            The master ranking, split into tiers. Sessions counts the exam
            sittings a theme appeared in (a CE and your own paper of the same
            month count once).
          </p>
          {TIERS.map((tier) => {
            const list = inSyllabus.filter((t) => t.tier === tier.tier);
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
                <ThemeTable
                  subject={subject}
                  themes={list}
                  sessionCount={N}
                  topicHref={topicHref}
                />
              </div>
            ) : null;
          })}
          {off.length ? (
            <div className="mt-8">
              <h3 className="text-lg font-semibold">
                Not in your syllabus{" "}
                <span className="font-normal text-muted-foreground">
                  ({off.length})
                </span>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Asked in Computer Engineering papers on parts your branch does
                not study. Skip them unless you have time.
              </p>
              <ThemeTable
                subject={subject}
                themes={off}
                sessionCount={N}
                topicHref={topicHref}
              />
            </div>
          ) : null}
        </section>

        <section aria-labelledby="map" className="mt-12">
          <h2 id="map" className={h2}>
            Paper map
          </h2>
          <p className="mt-2 text-muted-foreground">
            Which paper asked which Tier 1 and Tier 2 theme, and for how many
            marks. Darker cells are 10-mark questions.
          </p>
          <div className={frame}>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="sticky left-0 z-10 bg-muted pl-4">
                    Theme
                  </TableHead>
                  {cols.map((c) => (
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
                {mapped.map((t) => (
                  <TableRow key={t.name}>
                    <TableCell className="sticky left-0 z-10 min-w-40 max-w-72 whitespace-normal bg-card pl-4 text-sm leading-snug">
                      {t.name}
                    </TableCell>
                    {cols.map((c) => {
                      const m = [...t.asked, ...t.set]
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
            Marks set from each module in every paper (out of everything set,
            not what you attempt), with the average per paper.
          </p>
          <div className={frame}>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="pl-4">Module</TableHead>
                  {a.papers.map((p) => (
                    <TableHead
                      key={p.paper.slug}
                      className="px-1 text-center font-mono"
                      title={p.paper.session}
                    >
                      {p.tag}
                    </TableHead>
                  ))}
                  <TableHead className="pr-4 text-right">Average</TableHead>
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
                    {m.perPaper.map((v, i) => (
                      <TableCell
                        key={a.papers[i]?.paper.slug ?? i}
                        className="px-1 text-center font-mono tabular-nums"
                      >
                        {v}
                      </TableCell>
                    ))}
                    <TableCell className="pr-4 text-right font-mono font-semibold tabular-nums">
                      ~{Math.round(m.average)}{" "}
                      <span className="font-normal text-muted-foreground">
                        ({Math.round((m.average / setTotal) * 100)}%)
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section aria-labelledby="by-module" className="mt-12">
          <h2 id="by-module" className={h2}>
            Module by module
          </h2>
          <ol className="mt-4 grid gap-3 xl:grid-cols-2">
            {a.moduleMarks.map((m) => {
              const mod = s.modules.find((x) => x.number === m.module);
              const list = inSyllabus.filter((t) => t.module === m.module);
              const [top] = list;
              return (
                <li key={m.module} className="rounded-2xl border bg-card p-4">
                  <h3 className="font-semibold">
                    <span className="mr-2 font-mono text-primary">
                      M{m.module}
                    </span>
                    {mod?.title}
                    {mod ? (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · {mod.hours} hrs
                      </span>
                    ) : null}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    About {Math.round(m.average)} marks set per paper (
                    {Math.round((m.average / setTotal) * 100)}% of the paper).
                    {top
                      ? ` Most asked: ${top.name} (${top.sessions.length} of ${N} sessions).`
                      : ""}
                  </p>
                  <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                    {list.map((t) => (
                      <li key={t.name} className="flex items-start gap-2">
                        <span className="w-10 shrink-0 font-mono tabular-nums text-muted-foreground">
                          {t.sessions.length}/{N}
                        </span>
                        <span className="min-w-0 flex-1">
                          {t.name}
                          <span className="text-muted-foreground">
                            {" "}
                            · {TYPE[t.type]} · {t.marks.join("/")}
                            {t.set.length ? " · teacher" : ""}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="strategy" className="mt-12">
          <h2 id="strategy" className={h2}>
            How to plan the paper
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            {file.strategy.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="by-paper" className="mt-12">
          <h2 id="by-paper" className={h2}>
            Paper by paper
          </h2>
          <p className="mt-2 text-muted-foreground">
            Every question with the theme and module it belongs to.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {[...cols].reverse().map((c) => (
              <details
                key={c.paper.slug}
                className="rounded-2xl border bg-card"
              >
                <summary className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="font-mono text-primary">{c.tag}</span>
                  <span className="font-medium">{c.paper.session}</span>
                  <span className="text-sm text-muted-foreground">
                    {c.paper.branch ? "Computer Engineering" : ""}
                    {c.paper.qpCode ? ` · QP ${c.paper.qpCode}` : ""}
                  </span>
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

        <section aria-labelledby="papers" className="mt-12">
          <h2 id="papers" className={h2}>
            Papers analysed
          </h2>
          <div className={frame}>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="pl-4">#</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>QP code</TableHead>
                  <TableHead className="pr-4">Paper</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cols.map((c) => (
                  <TableRow key={c.paper.slug}>
                    <TableCell className="pl-4 font-mono">{c.tag}</TableCell>
                    <TableCell>
                      <Link
                        href={`/pyq/${subject}/${c.paper.slug}`}
                        className="outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {c.paper.session}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono">
                      {c.paper.date ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono">
                      {c.paper.qpCode ?? "—"}
                    </TableCell>
                    <TableCell className="pr-4">
                      {c.paper.assignment
                        ? "Class assignment"
                        : c.paper.branch
                          ? "Computer Engineering"
                          : "Your branch"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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

export default function AnalysisPage(props: PageProps<"/analysis/[subject]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AnalysisContent {...props} />
    </Suspense>
  );
}
