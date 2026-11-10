import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Bilingual } from "@/components/bilingual";
import { CiteChip, PaperChip, SyllabusChip } from "@/components/chips";
import { Doc } from "@/components/doc";
import { DoneCheck } from "@/components/done";
import { PageSkeleton } from "@/components/page-skeleton";
import { SubjectTabs } from "@/components/subject-tabs";
import { Toc, type TocItem } from "@/components/toc";
import { Badge } from "@/components/ui/badge";
import {
  askedIn,
  getImages,
  getNote,
  getReferences,
  getTopics,
  LANG_ID_PREFIX,
  listPapers,
  metaString,
  metaStrings,
  type Doc as NoteDoc,
  type Reference,
} from "@/lib/content";
import { doneId } from "@/lib/done";
import { subjects } from "@/lib/syllabus";

const SOURCE_GROUPS: {
  id: string;
  title: string;
  kinds: Reference["kind"][];
  blurb?: string;
}[] = [
  {
    id: "references",
    title: "References",
    kinds: ["book", "paper", "course", "notes"],
  },
  {
    id: "tutorials",
    title: "Tutorials and articles",
    kinds: ["tutorial"],
    blurb:
      "Popular beginner-friendly explanations, for a second view of the same idea. The definitions and formulas in this note follow the primary references above; where a tutorial differs, trust the references.",
  },
  { id: "docs", title: "Library documentation", kinds: ["docs"] },
  { id: "wikipedia", title: "Wikipedia", kinds: ["wiki"] },
];

export function generateStaticParams() {
  return subjects.flatMap((s) =>
    getTopics(s.slug).map((t) => ({ subject: s.slug, topic: t.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/notes/[subject]/[topic]">): Promise<Metadata> {
  const { subject, topic } = await params;
  const t = getTopics(subject).find((x) => x.slug === topic);
  return t ? { title: t.title } : {};
}

async function NotePageContent({
  params,
}: PageProps<"/notes/[subject]/[topic]">) {
  const { subject, topic } = await params;
  const s = subjects.find((x) => x.slug === subject);
  const t = getTopics(subject).find((x) => x.slug === topic);
  if (!s || !t) notFound();

  const note = getNote(subject, topic);
  const asked = askedIn(subject, topic);
  const refs = getReferences(subject);
  const images = getImages(subject);
  const refIds = note ? metaStrings(note.meta, "references") : [];
  const resolved = refIds.map((id) => {
    const r = refs[id];
    if (!r) throw new Error(`Unknown reference id "${id}"`);
    return r;
  });
  const groups = SOURCE_GROUPS.map((g) => ({
    ...g,
    items: resolved.filter((r) => g.kinds.includes(r.kind)),
  })).filter((g) => g.items.length > 0);
  const hiNote = note ? getNote(subject, topic, "hi") : null;
  const papers = listPapers(subject);

  const intro = (doc: NoteDoc | null) => {
    const summary = doc ? metaString(doc.meta, "summary") : "";
    const keyIdeas = doc ? metaStrings(doc.meta, "keyIdeas") : [];
    return (
      <>
        {summary ? (
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            {summary}
          </p>
        ) : null}
        {keyIdeas.length > 0 ? (
          <ul className="mt-5 list-disc space-y-1.5 pl-5 leading-relaxed marker:text-muted-foreground">
            {keyIdeas.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        ) : null}
      </>
    );
  };

  const tocFor = (doc: NoteDoc | null): TocItem[] => [
    { id: "asked-in", text: "Asked in past papers" },
    ...(doc?.headings.filter((h) => h.depth === 2) ?? []).map((h) => ({
      id: h.id,
      text: h.text,
    })),
    ...groups.map((g) => ({ id: g.id, text: g.title })),
  ];

  return (
    <div className="flex gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <article className="min-w-0 flex-1">
        <SubjectTabs subject={subject} active="notes" />
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Module {t.module}</Badge>
            <SyllabusChip subject={subject} module={t.module} />
            <span className="ml-auto">
              <DoneCheck
                id={doneId.note(subject, t.slug)}
                label={t.title}
                showLabel
              />
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {t.title}
          </h1>
          {hiNote ? (
            <Bilingual en={intro(note)} hi={intro(hiNote)} />
          ) : (
            intro(note)
          )}
        </header>

        <section aria-labelledby="asked-in" className="mt-10">
          <h2 id="asked-in" className="scroll-mt-24 text-2xl font-semibold">
            Asked in past papers
          </h2>
          {asked.length > 0 ? (
            <>
              <p className="mt-2 text-muted-foreground">
                {asked.length} questions across {papers.length} papers. Open one
                to see it solved.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {asked.map(({ paper, question }) => (
                  <li key={`${paper.slug}-${question.id}`}>
                    <PaperChip
                      subject={subject}
                      paper={paper}
                      question={question}
                      list
                    />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-muted-foreground">
              No question in the four papers so far is tagged with this topic.
            </p>
          )}
        </section>

        {note ? (
          <div className="mt-10">
            <Bilingual
              en={
                <Doc
                  source={note.body}
                  ctx={{ subject, refs, papers, images }}
                />
              }
              hi={
                hiNote ? (
                  <Doc
                    source={hiNote.body}
                    ctx={{ subject, refs, papers, images }}
                    idPrefix={LANG_ID_PREFIX.hi}
                  />
                ) : null
              }
            />
          </div>
        ) : (
          <p className="mt-10 rounded-lg border bg-card p-4 text-muted-foreground">
            This note has not been written yet. The questions above show what it
            needs to cover.
          </p>
        )}

        {groups.map((g) => (
          <section
            key={g.id}
            aria-labelledby={g.id}
            className="mt-12 border-t pt-8"
          >
            <h2 id={g.id} className="scroll-mt-24 text-2xl font-semibold">
              {g.title}
            </h2>
            {g.blurb ? (
              <p className="mt-2 text-muted-foreground">{g.blurb}</p>
            ) : null}
            <ul className="mt-4 flex flex-col gap-3">
              {g.items.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col gap-1.5 [overflow-wrap:anywhere]"
                >
                  <span>
                    {g.id === "references"
                      ? `${r.authors}${r.year ? ` (${r.year})` : ""}. ${r.title}. ${r.venue}.`
                      : r.title}
                  </span>
                  <span>
                    <CiteChip reference={r} list />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </article>

      <aside className="hidden w-60 shrink-0 xl:block">
        <div className="sticky top-24">
          {hiNote ? (
            <Bilingual
              en={<Toc items={tocFor(note)} />}
              hi={<Toc items={tocFor(hiNote)} />}
            />
          ) : (
            <Toc items={tocFor(note)} />
          )}
        </div>
      </aside>
    </div>
  );
}

export default function NotePage(props: PageProps<"/notes/[subject]/[topic]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NotePageContent {...props} />
    </Suspense>
  );
}
