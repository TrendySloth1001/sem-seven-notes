import { CalendarDays, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/page-skeleton";
import { isSolved, listPapers } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { subjects } from "@/lib/syllabus";

export function generateStaticParams() {
  return subjects
    .filter((s) => listPapers(s.slug).length > 0)
    .map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/pyq/[subject]">): Promise<Metadata> {
  const { subject } = await params;
  const s = subjects.find((x) => x.slug === subject);
  return s ? { title: `${s.name} past papers` } : {};
}

async function PapersIndexContent({ params }: PageProps<"/pyq/[subject]">) {
  const { subject } = await params;
  const s = subjects.find((x) => x.slug === subject);
  const papers = listPapers(subject);
  if (!s || papers.length === 0) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="font-mono-label text-primary">{s.name}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Past papers</h1>
      <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
        Every question from each paper, with its own solution. Newest first.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {papers.map((p) => {
          const solved = p.questions.filter((q) =>
            isSolved(subject, p.slug, q.id),
          ).length;
          return (
            <li key={p.slug}>
              <Link
                href={`/pyq/${subject}/${p.slug}`}
                className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-5 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                <h2 className="text-xl font-semibold">{p.session}</h2>
                {p.branch ? (
                  <p className="text-sm text-muted-foreground">
                    {p.branch} paper
                  </p>
                ) : null}
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays aria-hidden className="size-4" />
                  {p.date ? formatDate(p.date) : "Exam date not printed"}
                </p>
                <p className="mt-auto flex items-center gap-1.5 pt-2 text-sm">
                  <CheckCircle2 aria-hidden className="size-4 text-primary" />
                  {solved} of {p.questions.length} solved
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export default function PapersIndex(props: PageProps<"/pyq/[subject]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PapersIndexContent {...props} />
    </Suspense>
  );
}
