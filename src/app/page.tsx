import { BookOpen, FileText, ListTree } from "lucide-react";
import Link from "next/link";
import { SubjectProgress } from "@/components/done";
import { Button } from "@/components/ui/button";
import {
  getTopics,
  isSolved,
  listPapers,
  listWrittenNotes,
  subjectItems,
} from "@/lib/content";
import { subjects } from "@/lib/syllabus";

// Card actions are real buttons: the main one filled, the others outlined.
const action = "min-h-11 gap-1.5 rounded-full px-4";

export default function Home() {
  const cards = subjects.map((s) => {
    const topics = getTopics(s.slug);
    const papers = listPapers(s.slug);
    const questions = papers.flatMap((p) =>
      p.questions.map((q) => isSolved(s.slug, p.slug, q.id)),
    );
    return {
      s,
      notes: listWrittenNotes(s.slug).size,
      topics: topics.length,
      papers: papers.length,
      own: papers.filter((p) => !p.branch).length,
      solved: questions.filter(Boolean).length,
      questions: questions.length,
      items: subjectItems(
        s.slug,
        s.modules.flatMap((m) => m.units),
      ),
    };
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">sem</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        A platform to prepare for end semester exams. Notes for every topic,
        every past-paper question solved, in English and Hinglish.
      </p>
      <Button asChild size="lg" className="mt-6 min-h-11 rounded-full px-6">
        <Link href="/syllabus">Open the syllabus</Link>
      </Button>

      <h2 className="mt-14 text-2xl font-semibold tracking-tight">Subjects</h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {cards.map(({ s, ...c }, i) => (
          <li
            key={s.slug}
            className="flex flex-col gap-4 rounded-2xl border bg-card p-5"
          >
            <div>
              <p className="font-mono text-sm text-muted-foreground">
                {String(i + 1).padStart(2, "0")} · {s.code}
              </p>
              <h3 className="mt-1 text-xl font-semibold leading-snug">
                <Link
                  href={`/syllabus/${s.slug}`}
                  className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {s.name}
                </Link>
              </h3>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Notes</dt>
                <dd className="font-medium">
                  {c.notes} of {c.topics} topics
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Questions solved</dt>
                <dd className="font-medium">
                  {c.solved} of {c.questions}
                  <span className="text-muted-foreground">
                    {" "}
                    · {c.papers} papers
                    {c.own > 0 ? `, ${c.own} yours` : ""}
                  </span>
                </dd>
              </div>
            </dl>
            <SubjectProgress items={c.items} compact />
            <nav
              aria-label={`${s.name} sections`}
              className="mt-auto flex flex-wrap gap-2"
            >
              {c.topics > 0 ? (
                <Button asChild className={action}>
                  <Link href={`/notes/${s.slug}`}>
                    <BookOpen aria-hidden />
                    Notes
                  </Link>
                </Button>
              ) : null}
              {c.papers > 0 ? (
                <Button asChild variant="outline" className={action}>
                  <Link href={`/pyq/${s.slug}`}>
                    <FileText aria-hidden />
                    Past papers
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline" className={action}>
                <Link href={`/syllabus/${s.slug}`}>
                  <ListTree aria-hidden />
                  Syllabus
                </Link>
              </Button>
            </nav>
          </li>
        ))}
      </ul>
    </main>
  );
}
