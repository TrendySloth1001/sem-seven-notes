import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Bilingual } from "@/components/bilingual";
import { CiteChip, PaperChip } from "@/components/chips";
import { Doc } from "@/components/doc";
import { DoneCheck } from "@/components/done";
import { PageSkeleton } from "@/components/page-skeleton";
import { SubjectTabs } from "@/components/subject-tabs";
import { Toc, type TocItem } from "@/components/toc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { analyse } from "@/lib/analysis";
import {
  getAnalysis,
  getImages,
  getMasterAnswer,
  getReferences,
  getTopics,
  LANG_ID_PREFIX,
  listPapers,
  metaStrings,
  type Doc as NoteDoc,
  studyThemes,
} from "@/lib/content";
import { doneId } from "@/lib/done";
import { slugify } from "@/lib/slug";
import { subjects } from "@/lib/syllabus";

export function generateStaticParams() {
  return subjects.flatMap((s) =>
    studyThemes(s.slug)
      .filter((t) => getMasterAnswer(s.slug, slugify(t.name)))
      .map((t) => ({ subject: s.slug, theme: slugify(t.name) })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/analysis/[subject]/[theme]">): Promise<Metadata> {
  const { subject, theme } = await params;
  const t = studyThemes(subject).find((x) => slugify(x.name) === theme);
  return t ? { title: t.name } : {};
}

const TYPE = { theory: "Theory", numerical: "Numerical", program: "Program" };

async function ThemeContent({
  params,
}: PageProps<"/analysis/[subject]/[theme]">) {
  const { subject, theme } = await params;
  const s = subjects.find((x) => x.slug === subject);
  const file = getAnalysis(subject);
  const answer = getMasterAnswer(subject, theme);
  if (!s || !file || !answer) notFound();
  const topics = getTopics(subject);
  const papers = listPapers(subject);
  const a = analyse(
    papers,
    file.themes,
    (slug) => topics.find((x) => x.slug === slug)?.module ?? 0,
  );
  const ranked = a.themes.filter((x) => !x.offSyllabus);
  const i = ranked.findIndex((x) => slugify(x.name) === theme);
  const t = ranked[i];
  if (!t) notFound();
  const hi = getMasterAnswer(subject, theme, "hi");
  const refs = getReferences(subject);
  const images = getImages(subject);
  const ctx = { subject, refs, papers, images };
  const used = metaStrings(answer.meta, "references").flatMap((id) => {
    const r = refs[id];
    return r ? [r] : [];
  });
  // Neighbours in study order, so a student can work down the ranking.
  const withAnswer = (k: number) => {
    const x = ranked[k];
    return x && getMasterAnswer(subject, slugify(x.name)) ? x : undefined;
  };
  const prev = withAnswer(i - 1);
  const next = withAnswer(i + 1);
  const topic = topics.find((x) => x.slug === t.topic);
  const tocFor = (doc: NoteDoc): TocItem[] => [
    { id: "covers", text: "Questions it answers" },
    ...doc.headings
      .filter((h) => h.depth === 2)
      .map((h) => ({ id: h.id, text: h.text })),
    ...(used.length ? [{ id: "sources", text: "Sources" }] : []),
  ];

  return (
    <div className="flex gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <article className="min-w-0 flex-1">
        <SubjectTabs subject={subject} active="analysis" />
        <Link
          href={`/analysis/${subject}#priority`}
          className="text-sm text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← Exam analysis
        </Link>
        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Tier {t.tier}</Badge>
            <Badge variant="secondary">Module {t.module}</Badge>
            <Badge variant="outline">{TYPE[t.type]}</Badge>
            <Badge variant="outline" className="font-mono">
              {t.sessions.length}/{a.sessionCount} sessions
            </Badge>
            <span className="ml-auto">
              <DoneCheck
                id={doneId.theme(subject, t.name)}
                label={t.name}
                showLabel
              />
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t.name}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            One answer for all {t.asked.length + t.set.length} questions below:
            learn the core answer for 5 marks, add the extended part for 10.
          </p>
        </header>

        <section aria-labelledby="covers" className="mt-8">
          <h2 id="covers" className="scroll-mt-24 text-xl font-semibold">
            Questions it answers
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {[...t.asked].reverse().map((h) => (
              <li
                key={`${h.paper.slug}-${h.q.id}`}
                className="flex flex-col gap-1 text-sm sm:flex-row sm:items-start sm:gap-3"
              >
                <span className="shrink-0">
                  <PaperChip subject={subject} paper={h.paper} question={h.q} />
                </span>
                <span className="text-muted-foreground">{h.q.marks} marks</span>
              </li>
            ))}
            {t.set.map((h) => (
              <li
                key={`${h.paper.slug}-${h.q.id}`}
                className="flex flex-col gap-1 text-sm sm:flex-row sm:items-start sm:gap-3"
              >
                <span className="shrink-0">
                  <PaperChip subject={subject} paper={h.paper} question={h.q} />
                </span>
                <span className="text-muted-foreground">
                  set by your teachers
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10">
          <Bilingual
            en={<Doc source={answer.body} ctx={ctx} />}
            hi={
              hi ? (
                <Doc source={hi.body} ctx={ctx} idPrefix={LANG_ID_PREFIX.hi} />
              ) : null
            }
          />
        </div>

        {used.length ? (
          <section aria-labelledby="sources" className="mt-12 border-t pt-8">
            <h2 id="sources" className="scroll-mt-24 text-xl font-semibold">
              Sources
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {used.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col gap-1.5 [overflow-wrap:anywhere]"
                >
                  <span>{r.title}</span>
                  <span>
                    <CiteChip reference={r} list />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <nav
          aria-label="Other themes"
          className="mt-12 flex flex-wrap justify-between gap-3 border-t pt-6"
        >
          {prev ? (
            <Button asChild variant="outline" className="min-h-11 rounded-full">
              <Link href={`/analysis/${subject}/${slugify(prev.name)}`}>
                ← {prev.name}
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {topic ? (
            <Button asChild variant="ghost" className="min-h-11 rounded-full">
              <Link href={`/notes/${subject}/${topic.slug}`}>
                Full note: {topic.title}
              </Link>
            </Button>
          ) : null}
          {next ? (
            <Button asChild variant="outline" className="min-h-11 rounded-full">
              <Link href={`/analysis/${subject}/${slugify(next.name)}`}>
                {next.name} →
              </Link>
            </Button>
          ) : null}
        </nav>
      </article>

      <aside className="hidden w-60 shrink-0 xl:block">
        <div className="sticky top-24">
          {hi ? (
            <Bilingual
              en={<Toc items={tocFor(answer)} />}
              hi={<Toc items={tocFor(hi)} />}
            />
          ) : (
            <Toc items={tocFor(answer)} />
          )}
        </div>
      </aside>
    </div>
  );
}

export default function ThemePage(
  props: PageProps<"/analysis/[subject]/[theme]">,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ThemeContent {...props} />
    </Suspense>
  );
}
