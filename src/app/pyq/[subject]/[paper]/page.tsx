import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Bilingual } from "@/components/bilingual";
import { CiteChip, TopicChip } from "@/components/chips";
import { Doc } from "@/components/doc";
import { DoneCheck } from "@/components/done";
import { PageSkeleton } from "@/components/page-skeleton";
import { SubjectTabs } from "@/components/subject-tabs";
import { Toc, type TocItem } from "@/components/toc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getImages,
  getPaper,
  getReferences,
  getSolution,
  getTopics,
  LANG_ID_PREFIX,
  listPapers,
  metaStrings,
} from "@/lib/content";
import { doneId } from "@/lib/done";
import { formatDate } from "@/lib/format";
import { subjects } from "@/lib/syllabus";

export function generateStaticParams() {
  return subjects.flatMap((s) =>
    listPapers(s.slug).map((p) => ({ subject: s.slug, paper: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/pyq/[subject]/[paper]">): Promise<Metadata> {
  const { subject, paper } = await params;
  const p = getPaper(subject, paper);
  const s = subjects.find((x) => x.slug === subject);
  return p && s ? { title: `${s.name} ${p.session} paper` } : {};
}

async function PaperPageContent({
  params,
}: PageProps<"/pyq/[subject]/[paper]">) {
  const { subject, paper: slug } = await params;
  const s = subjects.find((x) => x.slug === subject);
  const paper = getPaper(subject, slug);
  if (!s || !paper) notFound();

  const refs = getReferences(subject);
  const images = getImages(subject);
  const topics = getTopics(subject);
  const papers = listPapers(subject);
  const toc: TocItem[] = paper.questions.map((q) => ({
    id: q.id,
    text: `Q${q.label} · ${q.text.length > 38 ? `${q.text.slice(0, 38).trim()}…` : q.text}`,
  }));

  return (
    <div className="flex gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <article className="min-w-0 flex-1">
        <SubjectTabs subject={subject} active="pyq" />
        <header>
          <p className="font-mono-label text-primary">{s.name}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            {paper.session}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {paper.date
              ? formatDate(paper.date)
              : "Exam date not printed on the paper"}
            {paper.time ? `, ${paper.time}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {paper.branch ? (
              <Badge variant="secondary">{paper.branch} paper</Badge>
            ) : null}
            <Badge variant="outline">{paper.duration}</Badge>
            <Badge variant="outline">{paper.maxMarks} marks</Badge>
            <Badge variant="outline" className="font-mono">
              Paper {paper.paperCode}
            </Badge>
            {paper.qpCode ? (
              <Badge variant="outline" className="font-mono">
                QP {paper.qpCode}
              </Badge>
            ) : null}
            <Button
              asChild
              variant="outline"
              className="min-h-11 gap-1.5 rounded-full px-4"
            >
              <a href={paper.sourceUrl} target="_blank" rel="noreferrer">
                <ExternalLink aria-hidden />
                Original paper (PDF)
              </a>
            </Button>
          </div>
          <ul className="mt-5 list-decimal space-y-1 pl-5 text-muted-foreground">
            {paper.instructions.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </header>

        {paper.questions.map((q, idx) => {
          const solution = getSolution(subject, slug, q.id);
          const hiSolution = solution
            ? getSolution(subject, slug, q.id, "hi")
            : null;
          const main = q.label.replace(/[a-z]+$/i, "");
          const prev = paper.questions[idx - 1];
          const firstOfMain =
            !prev || prev.label.replace(/[a-z]+$/i, "") !== main;
          const sectionNote = firstOfMain
            ? (paper.sectionNotes?.[main] ??
              (main === "1" ? paper.q1note : undefined))
            : undefined;
          const qTopics = q.topics
            .map((t) => topics.find((x) => x.slug === t))
            .filter((t): t is NonNullable<typeof t> => t !== undefined);
          const solRefs = solution
            ? metaStrings(solution.meta, "references")
            : [];
          return (
            <section
              key={q.id}
              id={q.id}
              aria-labelledby={`${q.id}-h`}
              className="mt-12 scroll-mt-24 border-t pt-8"
            >
              {sectionNote ? (
                <p className="mb-4 text-sm text-muted-foreground">
                  Question {main}: {sectionNote}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <h2 id={`${q.id}-h`} className="text-2xl font-semibold">
                  Q{q.label}
                </h2>
                <Badge variant="secondary" className="font-mono">
                  {q.marks} marks
                </Badge>
                {solution ? null : (
                  <Badge variant="outline">Solution pending</Badge>
                )}
                <span className="ml-auto">
                  <DoneCheck
                    id={doneId.question(subject, slug, q.id)}
                    label={`Q${q.label}`}
                    showLabel
                  />
                </span>
                {q.note && q.note.length <= 40 ? (
                  <Badge variant="outline">{q.note}</Badge>
                ) : null}
              </div>
              {q.note && q.note.length > 40 ? (
                <p className="mt-2 text-sm text-muted-foreground">{q.note}</p>
              ) : null}
              <div className="mt-3 rounded-lg border bg-card px-4 py-3">
                <p className="font-mono-label mb-1 text-muted-foreground">
                  Question
                </p>
                <Doc source={q.text} ctx={{ subject, refs, papers, images }} />
              </div>
              {qTopics.length > 0 ? (
                <ul className="mt-3 flex flex-wrap items-center gap-2">
                  <li className="text-sm text-muted-foreground">Read:</li>
                  {qTopics.map((t) => (
                    <li key={t.slug}>
                      <TopicChip subject={subject} topic={t} />
                    </li>
                  ))}
                </ul>
              ) : null}

              {solution ? (
                <div className="mt-6">
                  <p className="font-mono-label mb-2 text-muted-foreground">
                    Solution
                  </p>
                  <Bilingual
                    en={
                      <Doc
                        source={solution.body}
                        ctx={{ subject, refs, papers, images }}
                      />
                    }
                    hi={
                      hiSolution ? (
                        <Doc
                          source={hiSolution.body}
                          ctx={{ subject, refs, papers, images }}
                          idPrefix={LANG_ID_PREFIX.hi}
                        />
                      ) : null
                    }
                  />
                  {solRefs.length > 0 ? (
                    <ul className="mt-5 flex flex-wrap items-center gap-2">
                      <li className="text-sm text-muted-foreground">
                        Sources:
                      </li>
                      {solRefs.map((id) => {
                        const r = refs[id];
                        if (!r) throw new Error(`Unknown reference id "${id}"`);
                        return (
                          <li key={id}>
                            <CiteChip reference={r} list />
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </section>
          );
        })}
      </article>

      <aside className="hidden w-64 shrink-0 xl:block">
        <div className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto">
          <Toc items={toc} />
        </div>
      </aside>
    </div>
  );
}

export default function PaperPage(props: PageProps<"/pyq/[subject]/[paper]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PaperPageContent {...props} />
    </Suspense>
  );
}
