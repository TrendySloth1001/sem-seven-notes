import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/page-skeleton";
import { getTopics, listWrittenNotes } from "@/lib/content";
import { subjects } from "@/lib/syllabus";

export function generateStaticParams() {
  return subjects
    .filter((s) => getTopics(s.slug).length > 0)
    .map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/notes/[subject]">): Promise<Metadata> {
  const { subject } = await params;
  const s = subjects.find((x) => x.slug === subject);
  return s ? { title: `${s.name} notes` } : {};
}

async function NotesIndexContent({ params }: PageProps<"/notes/[subject]">) {
  const { subject } = await params;
  const s = subjects.find((x) => x.slug === subject);
  const topics = getTopics(subject);
  if (!s || topics.length === 0) notFound();
  const written = listWrittenNotes(subject);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="font-mono-label text-primary">{s.name}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Notes</h1>
      <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
        {written.size} of {topics.length} topics written. Each note shows the
        past-paper questions it answers.
      </p>
      <div className="mt-8 flex flex-col gap-8">
        {s.modules.map((m) => {
          const inModule = topics.filter((t) => t.module === m.number);
          if (inModule.length === 0) return null;
          return (
            <section key={m.number} aria-labelledby={`m${m.number}`}>
              <h2 id={`m${m.number}`} className="text-sm font-semibold">
                <span className="font-mono text-primary">
                  {String(m.number).padStart(2, "0")}
                </span>{" "}
                {m.title}
              </h2>
              <ul className="mt-2 divide-y rounded-xl border">
                {inModule.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/notes/${subject}/${t.slug}`}
                      className="flex min-h-12 items-center justify-between gap-3 px-4 py-2 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span>{t.title}</span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {written.has(t.slug) ? "written" : "not yet"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}

export default function NotesIndex(props: PageProps<"/notes/[subject]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NotesIndexContent {...props} />
    </Suspense>
  );
}
