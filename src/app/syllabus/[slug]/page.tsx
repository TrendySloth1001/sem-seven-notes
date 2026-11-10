import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DoneCheck } from "@/components/done";
import { PageSkeleton } from "@/components/page-skeleton";
import { SubjectTabs } from "@/components/subject-tabs";
import { Toc, type TocItem } from "@/components/toc";
import { Badge } from "@/components/ui/badge";
import { doneId } from "@/lib/done";
import {
  moduleId,
  ROMAN,
  type Subject,
  subjects,
  totalHours,
} from "@/lib/syllabus";

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
const table = "w-full border-collapse text-sm";
const th = "border bg-muted px-3 py-2 text-center font-semibold";
const td = "border px-3 py-2 text-center";
const numbered = "mt-4 list-decimal space-y-2 pl-6 leading-relaxed";

// The two scheme tables at the top of a VIVA syllabus, laid out as in the PDF.
function SchemeTables({ s }: { s: Subject }) {
  if (!s.scheme) {
    return (
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Course Code</th>
              <th className={th}>Course Title</th>
              <th className={th}>Credit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${td} font-mono`}>{s.code}</td>
              <td className={td}>{s.name}</td>
              <td className={td}>{s.credits}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  const { teaching, credits, exam } = s.scheme;
  return (
    <>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className={`${table} min-w-[36rem]`}>
          <thead>
            <tr>
              <th rowSpan={2} className={th}>
                Course Code
              </th>
              <th rowSpan={2} className={th}>
                Course Name
              </th>
              <th colSpan={3} className={th}>
                Teaching Scheme (Contact Hours)
              </th>
              <th colSpan={4} className={th}>
                Credits Assigned
              </th>
            </tr>
            <tr>
              {[
                "Theory",
                "Practical",
                "Tut",
                "Theory",
                "Practical",
                "Tut",
                "Total",
              ].map((h, i) => (
                <th key={`${h}-${i}`} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${td} font-mono`}>{s.code}</td>
              <td className={td}>{s.name}</td>
              {[
                teaching.theory,
                teaching.practical,
                teaching.tut,
                credits.theory,
                credits.practical,
                credits.tut,
                credits.total,
              ].map((v, i) => (
                <td key={`t-${i}-${v}`} className={td}>
                  {v}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className={`${table} min-w-[40rem]`}>
          <thead>
            <tr>
              <th rowSpan={3} className={th}>
                Course Code
              </th>
              <th rowSpan={3} className={th}>
                Course Name
              </th>
              <th colSpan={5} className={th}>
                Theory
              </th>
              <th rowSpan={3} className={th}>
                Term work
              </th>
              <th rowSpan={3} className={th}>
                Pract/ Oral
              </th>
              <th rowSpan={3} className={th}>
                Total
              </th>
            </tr>
            <tr>
              <th colSpan={3} className={th}>
                Internal Assessment
              </th>
              <th rowSpan={2} className={th}>
                End SEM Exam
              </th>
              <th rowSpan={2} className={th}>
                Exam duration (in hrs)
              </th>
            </tr>
            <tr>
              <th className={th}>Test 1</th>
              <th className={th}>Test 2</th>
              <th className={th}>Avg.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${td} font-mono`}>{s.code}</td>
              <td className={td}>{s.name}</td>
              {[
                exam.test1,
                exam.test2,
                exam.avg,
                exam.endSem,
                exam.duration,
                exam.termWork,
                exam.practOral,
                exam.total,
              ].map((v, i) => (
                <td key={`e-${i}-${v}`} className={td}>
                  {v}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

// The detailed syllabus table. Below md each module stacks into one block so the phone never scrolls sideways.
function DetailedSyllabus({ s }: { s: Subject }) {
  const viva = s.format === "viva";
  const total = totalHours(s);
  const hrs = (n: number) => (viva ? String(n).padStart(2, "0") : String(n));
  const cell = "md:border md:px-3 md:py-2 md:align-top";
  return (
    <div className="mt-4 md:overflow-x-auto md:rounded-lg md:border">
      <table className={`${table} max-md:block`}>
        <thead className="max-md:hidden">
          <tr>
            <th className={`${th} w-14`}>{viva ? "Sr. No." : "Module"}</th>
            {viva ? <th className={`${th} w-40`}>Module</th> : null}
            <th className={th}>{viva ? "Detailed Content" : "Content"}</th>
            <th className={`${th} w-16`}>{viva ? "Hours" : `${total}Hrs`}</th>
            {viva ? <th className={`${th} w-20`}>CO Mapping</th> : null}
          </tr>
        </thead>
        <tbody className="max-md:flex max-md:flex-col max-md:gap-4">
          {s.modules.map((m) => (
            <tr
              key={m.number}
              id={moduleId(m.number)}
              className="scroll-mt-24 max-md:block max-md:rounded-xl max-md:border max-md:bg-card max-md:p-4"
            >
              <td className={`${cell} text-center font-semibold max-md:hidden`}>
                {viva ? ROMAN[m.number - 1] : m.number}
              </td>
              {viva ? (
                <td className={`${cell} font-semibold max-md:hidden`}>
                  {m.title}
                </td>
              ) : null}
              <td className={`${cell} max-md:block`}>
                <p className="mb-2 font-semibold md:hidden">
                  <span className="mr-2 font-mono text-primary">
                    {viva ? ROMAN[m.number - 1] : m.number}
                  </span>
                  {m.title}
                </p>
                <div className="mb-3 flex flex-wrap gap-2 md:hidden">
                  <Badge variant="secondary" className="font-mono">
                    {hrs(m.hours)} hrs
                  </Badge>
                  {m.co?.map((c) => (
                    <Badge key={c} variant="outline" className="font-mono">
                      {c}
                    </Badge>
                  ))}
                </div>
                {viva ? null : (
                  <p className="mb-2 font-semibold max-md:hidden">{m.title}</p>
                )}
                <ol className="space-y-2 text-left">
                  {m.units.map((u) => (
                    <li key={u.no} className="flex gap-2 leading-relaxed">
                      <span className="-ml-1.5 -mt-1 shrink-0">
                        <DoneCheck
                          id={doneId.unit(s.slug, u.no)}
                          label={`${u.no} ${u.heading ?? u.text}`}
                        />
                      </span>
                      <span className="w-7 shrink-0 font-mono text-xs leading-6 text-muted-foreground">
                        {u.no}
                      </span>
                      <span>
                        {u.heading ? (
                          <span className="block font-semibold">
                            {u.heading}
                          </span>
                        ) : null}
                        {u.text}
                      </span>
                    </li>
                  ))}
                </ol>
              </td>
              <td className={`${cell} text-center font-semibold max-md:hidden`}>
                {hrs(m.hours)}
              </td>
              {viva ? (
                <td className={`${cell} text-center max-md:hidden`}>
                  {m.co?.map((c) => (
                    <span key={c} className="block font-semibold">
                      {c}
                    </span>
                  ))}
                </td>
              ) : null}
            </tr>
          ))}
          <tr className="max-md:block max-md:rounded-xl max-md:border max-md:p-4">
            <td
              colSpan={viva ? 3 : 2}
              className={`${cell} text-right font-semibold max-md:inline`}
            >
              Total No. of Lectures:{" "}
            </td>
            <td className={`${cell} text-center font-semibold max-md:inline`}>
              {total}
            </td>
            {viva ? <td className={`${cell} max-md:hidden`} /> : null}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function LinkOrText({ text }: { text: string }) {
  const m = /(https?:\/\/\S+)/.exec(text);
  if (!m?.[1]) return <>{text}</>;
  const url = m[1];
  const [before = "", after = ""] = text.split(url);
  return (
    <>
      {before}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="break-all text-primary underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {url}
      </a>
      {after}
    </>
  );
}

async function SubjectPageContent({ params }: PageProps<"/syllabus/[slug]">) {
  const { slug } = await params;
  const index = subjects.findIndex((x) => x.slug === slug);
  const s = subjects[index];
  if (!s) notFound();

  const viva = s.format === "viva";
  const prev = subjects[index - 1];
  const next = subjects[index + 1];

  // Sections in the order the PDF prints them.
  const prerequisite = s.prerequisite ? (
    <section aria-labelledby="prerequisite" className="mt-10" key="pre">
      <h2 id="prerequisite" className={h2}>
        Prerequisite
      </h2>
      <p className="mt-3 leading-relaxed">{s.prerequisite}</p>
    </section>
  ) : null;
  const objectives = (
    <section aria-labelledby="objectives" className="mt-10" key="obj">
      <h2 id="objectives" className={h2}>
        Course Objectives
      </h2>
      {viva ? (
        <p className="mt-2 text-muted-foreground">The Course aims to</p>
      ) : null}
      <ol className={numbered}>
        {s.objectives.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ol>
    </section>
  );
  const outcomes = (
    <section aria-labelledby="outcomes" className="mt-10" key="out">
      <h2 id="outcomes" className={h2}>
        Course Outcomes
      </h2>
      {viva ? (
        <p className="mt-2 text-muted-foreground">Learners will be able to</p>
      ) : null}
      <ol className={numbered}>
        {s.outcomes.map((o, i) => (
          <li key={o}>
            {viva ? (
              <span className="mr-2 font-mono text-xs text-muted-foreground">
                CO{i + 1}
              </span>
            ) : null}
            {o}
          </li>
        ))}
      </ol>
    </section>
  );
  const intro = viva
    ? [objectives, outcomes, prerequisite]
    : [prerequisite, objectives, outcomes];

  const toc: TocItem[] = [
    { id: "scheme", text: viva ? "Teaching and exam scheme" : "Course" },
    ...(viva
      ? [
          { id: "objectives", text: "Course Objectives" },
          { id: "outcomes", text: "Course Outcomes" },
          ...(s.prerequisite
            ? [{ id: "prerequisite", text: "Prerequisite" }]
            : []),
        ]
      : [
          { id: "prerequisite", text: "Prerequisite" },
          { id: "objectives", text: "Course Objectives" },
          { id: "outcomes", text: "Course Outcomes" },
        ]),
    { id: "detailed-syllabus", text: "Detailed Syllabus" },
    ...(s.textbooks.length ? [{ id: "textbooks", text: "Text Books" }] : []),
    { id: "references", text: "References" },
    { id: "links", text: viva ? "Online References" : "Useful Links" },
    { id: "assessment", text: "Assessment" },
  ];

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-4 py-8 sm:px-6 sm:py-12">
      <article className="min-w-0 max-w-3xl flex-1">
        <SubjectTabs subject={s.slug} active="syllabus" progress />
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="font-mono">{s.code}</Badge>
            <Badge variant="secondary">{s.kind}</Badge>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {s.name}
          </h1>
        </header>

        <section aria-labelledby="scheme" className="mt-10">
          <h2 id="scheme" className={h2}>
            {viva ? "Teaching and examination scheme" : "Course"}
          </h2>
          <SchemeTables s={s} />
        </section>

        {intro}

        <section aria-labelledby="detailed-syllabus" className="mt-10">
          <h2 id="detailed-syllabus" className={h2}>
            Detailed Syllabus
          </h2>
          {viva ? (
            <p className="mt-2 text-muted-foreground">
              Total six module for each subject (13 Weeks)
            </p>
          ) : null}
          <DetailedSyllabus s={s} />
        </section>

        {s.textbooks.length ? (
          <section aria-labelledby="textbooks" className="mt-10">
            <h2 id="textbooks" className={h2}>
              Text Books
            </h2>
            <ol className={numbered}>
              {s.textbooks.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ol>
          </section>
        ) : null}

        <section aria-labelledby="references" className="mt-10">
          <h2 id="references" className={h2}>
            References
          </h2>
          <ol className={numbered}>
            {s.references.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="links" className="mt-10">
          <h2 id="links" className={h2}>
            {viva ? "Online References" : "Useful Links"}
          </h2>
          <div className="mt-4 overflow-hidden rounded-lg border">
            <table className={table}>
              <thead>
                <tr>
                  <th className={`${th} w-20`}>Sr. No.</th>
                  <th className={`${th} text-left`}>Website Name</th>
                </tr>
              </thead>
              <tbody>
                {s.links.map((l, i) => (
                  <tr key={l}>
                    <td className={`${td} font-semibold`}>{i + 1}.</td>
                    <td className="border px-3 py-2 [overflow-wrap:anywhere]">
                      <LinkOrText text={l} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="assessment" className="mt-10">
          <h2 id="assessment" className={h2}>
            Assessment
          </h2>
          <h3 className="mt-4 font-semibold">
            {viva
              ? "Internal Assessment (IA) for 20 marks:"
              : "Internal Assessment:"}
          </h3>
          {s.assessment.internal.map((p) => (
            <p key={p} className="mt-2 leading-relaxed">
              {p}
            </p>
          ))}
          <h3 className="mt-5 font-semibold">{s.assessment.paperTitle}:</h3>
          <ol
            className={`mt-3 space-y-2 pl-6 leading-relaxed ${viva ? "list-disc" : "list-decimal"}`}
          >
            {s.assessment.paper.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
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
