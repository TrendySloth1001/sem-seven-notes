import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Bilingual } from "@/components/bilingual";
import { Doc } from "@/components/doc";
import { PageSkeleton } from "@/components/page-skeleton";
import { SubjectTabs } from "@/components/subject-tabs";
import { Toc } from "@/components/toc";
import { Badge } from "@/components/ui/badge";
import {
  getAnalysis,
  getImages,
  getMasterAnswer,
  getReferences,
  LANG_ID_PREFIX,
  listPapers,
  studyThemes,
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
}: PageProps<"/assignments/[subject]">): Promise<Metadata> {
  const { subject } = await params;
  const s = subjects.find((x) => x.slug === subject);
  return s ? { title: `${s.name} assignment concepts` } : {};
}

async function AssignmentContent({
  params,
}: PageProps<"/assignments/[subject]">) {
  const { subject } = await params;
  const s = subjects.find((x) => x.slug === subject);
  if (!s) notFound();
  // Themes the teachers set in a class assignment, in study order.
  const themes = studyThemes(subject).flatMap((t) => {
    const slug = slugify(t.name);
    const en = getMasterAnswer(subject, slug);
    if (!t.set.length || !en) return [];
    return [{ t, slug, en, hi: getMasterAnswer(subject, slug, "hi") }];
  });
  if (!themes.length) notFound();
  const ctx = {
    subject,
    refs: getReferences(subject),
    papers: listPapers(subject),
    images: getImages(subject),
  };

  return (
    <div className="flex gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <article className="min-w-0 flex-1">
        <SubjectTabs subject={subject} active="analysis" />
        <header className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Assignment concepts
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            {themes.length} concepts cover every assignment question. Each
            answer fits any way the question can be asked: learn the core for 5
            marks, add the extended part for 10. Most likely first.
          </p>
        </header>
        {themes.map(({ t, slug, en, hi }, i) => (
          <section
            key={slug}
            aria-labelledby={`concept-${slug}`}
            className="mt-14 border-t pt-8"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Tier {t.tier}</Badge>
              <Badge variant="secondary">Module {t.module}</Badge>
              <Badge variant="outline" className="font-mono">
                {t.sessions.length} sessions
              </Badge>
            </div>
            <h2
              id={`concept-${slug}`}
              className="mt-3 scroll-mt-24 text-2xl font-semibold tracking-tight"
            >
              {i + 1}. {t.name}
            </h2>
            <div className="mt-6">
              <Bilingual
                en={<Doc source={en.body} ctx={ctx} idPrefix={`${slug}-`} />}
                hi={
                  hi ? (
                    <Doc
                      source={hi.body}
                      ctx={ctx}
                      idPrefix={`${slug}-${LANG_ID_PREFIX.hi}`}
                    />
                  ) : null
                }
              />
            </div>
            <p className="mt-6 text-sm">
              <Link
                href={`/analysis/${subject}/${slug}`}
                className="text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                Questions and sources for this concept
              </Link>
            </p>
          </section>
        ))}
      </article>

      <aside className="hidden w-64 shrink-0 xl:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <Toc
            items={themes.map(({ t, slug }, i) => ({
              id: `concept-${slug}`,
              text: `${i + 1}. ${t.name}`,
            }))}
          />
        </div>
      </aside>
    </div>
  );
}

export default function AssignmentPage(
  props: PageProps<"/assignments/[subject]">,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AssignmentContent {...props} />
    </Suspense>
  );
}
