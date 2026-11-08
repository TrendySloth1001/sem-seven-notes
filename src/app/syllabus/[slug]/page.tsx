import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Layers,
  Target,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/page-skeleton";
import { Toc, type TocItem } from "@/components/toc";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { moduleId, subjects, totalHours } from "@/lib/syllabus";

export function generateStaticParams() {
  return subjects.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/syllabus/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = subjects.find((x) => x.slug === slug);
  return s
    ? { title: s.name, description: `${s.name} (${s.code}) syllabus.` }
    : {};
}

const h2 = "scroll-mt-24 text-2xl font-semibold tracking-tight";
const list =
  "list-disc space-y-2 pl-5 leading-relaxed marker:text-muted-foreground";

async function SubjectPageContent({ params }: PageProps<"/syllabus/[slug]">) {
  const { slug } = await params;
  const index = subjects.findIndex((x) => x.slug === slug);
  const s = subjects[index];
  if (!s) notFound();

  const total = totalHours(s);
  const prev = subjects[index - 1];
  const next = subjects[index + 1];
  const toc: TocItem[] = [
    { id: "hours", text: "Where the hours go" },
    ...s.modules.map((m) => ({
      id: moduleId(m.number),
      text: `${m.number}. ${m.title}`,
    })),
    { id: "outcomes", text: "Course outcomes" },
    { id: "books", text: "Books" },
  ];

  return (
    <div className="mx-auto flex max-w-5xl gap-10 px-4 py-8 sm:px-6 sm:py-12">
      <article className="min-w-0 max-w-3xl flex-1">
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="font-mono">{s.code}</Badge>
            <Badge variant="secondary">{s.kind}</Badge>
            <Badge variant="outline">{s.credits} credits</Badge>
            <Badge variant="outline" className="gap-1">
              <Clock aria-hidden className="size-3" />
              {total} hrs
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Layers aria-hidden className="size-3" />
              {s.modules.length} modules
            </Badge>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {s.name}
          </h1>
          {s.prerequisite ? (
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Prerequisite:</span>{" "}
              {s.prerequisite}
            </p>
          ) : null}
        </header>

        <section aria-labelledby="hours" className="mt-12">
          <h2 id="hours" className={h2}>
            Where the hours go
          </h2>
          <ul className="mt-4 flex flex-col gap-4 rounded-2xl border bg-card p-5">
            {s.modules.map((m) => (
              <li key={m.number}>
                <a
                  href={`#${moduleId(m.number)}`}
                  className="mb-1.5 flex items-baseline justify-between gap-3 text-sm outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>
                    {m.number}. {m.title}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {m.hours} hrs
                  </span>
                </a>
                <Progress
                  value={(m.hours / total) * 100}
                  aria-label={`${m.title}: ${m.hours} of ${total} hours`}
                />
              </li>
            ))}
          </ul>
        </section>

        {s.modules.map((m) => (
          <section
            key={m.number}
            aria-labelledby={moduleId(m.number)}
            className="mt-12"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id={moduleId(m.number)} className={h2}>
                <span className="mr-2 font-mono text-primary">
                  {String(m.number).padStart(2, "0")}
                </span>
                {m.title}
              </h2>
              <Badge variant="secondary" className="mt-1 shrink-0 font-mono">
                {m.hours} hrs
              </Badge>
            </div>
            <ul className={`mt-4 ${list}`}>
              {m.topics.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        ))}

        <section aria-labelledby="outcomes" className="mt-12">
          <h2 id="outcomes" className={`${h2} flex items-center gap-2`}>
            <Target aria-hidden className="size-6 text-primary" />
            Course outcomes
          </h2>
          <ul className={`mt-4 ${list}`}>
            {s.outcomes.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="books" className="mt-12">
          <h2 id="books" className={`${h2} flex items-center gap-2`}>
            <BookOpen aria-hidden className="size-6 text-primary" />
            Books
          </h2>
          <ul className={`mt-4 ${list}`}>
            {s.books.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-sm text-muted-foreground">
          Source:{" "}
          {s.source.url ? (
            <a
              className="underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={s.source.url}
              rel="noreferrer"
              target="_blank"
            >
              {s.source.name}
            </a>
          ) : (
            s.source.name
          )}
        </p>

        <nav
          aria-label="Other subjects"
          className="mt-10 grid gap-3 border-t pt-6 sm:grid-cols-2"
        >
          {prev ? (
            <Link
              href={`/syllabus/${prev.slug}`}
              className="flex min-h-14 items-center gap-3 rounded-2xl border bg-card p-4 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft aria-hidden className="size-5 shrink-0" />
              <span>
                <span className="font-mono-label block text-muted-foreground">
                  Previous
                </span>
                {prev.name}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/syllabus/${next.slug}`}
              className="flex min-h-14 items-center justify-end gap-3 rounded-2xl border bg-card p-4 text-right outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring sm:col-start-2"
            >
              <span>
                <span className="font-mono-label block text-muted-foreground">
                  Next
                </span>
                {next.name}
              </span>
              <ArrowRight aria-hidden className="size-5 shrink-0" />
            </Link>
          ) : null}
        </nav>
      </article>

      <aside className="hidden w-60 shrink-0 xl:block">
        <div className="sticky top-24">
          <Toc items={toc} />
        </div>
      </aside>
    </div>
  );
}

export default function SubjectPage(props: PageProps<"/syllabus/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SubjectPageContent {...props} />
    </Suspense>
  );
}
