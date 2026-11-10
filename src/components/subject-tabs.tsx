import { BookOpen, FileText, ListTree, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getTopics, listPapers, subjectItems } from "@/lib/content";
import { subjects } from "@/lib/syllabus";
import { SubjectProgress } from "./done";

const TABS = [
  {
    key: "syllabus",
    label: "Syllabus",
    icon: ListTree,
    href: (s: string) => `/syllabus/${s}`,
  },
  {
    key: "notes",
    label: "Notes",
    icon: BookOpen,
    href: (s: string) => `/notes/${s}`,
  },
  {
    key: "pyq",
    label: "Past papers",
    icon: FileText,
    href: (s: string) => `/pyq/${s}`,
  },
  {
    key: "patterns",
    label: "Patterns",
    icon: TrendingUp,
    href: (s: string) => `/patterns/${s}`,
  },
] as const;

// The three views of one subject, so a student can move between them without the sidebar.
export function SubjectTabs({
  subject,
  active,
  progress = false,
}: {
  subject: string;
  active: (typeof TABS)[number]["key"];
  /** Show the subject's progress card under the tabs (index pages). */
  progress?: boolean;
}) {
  const has = {
    syllabus: true,
    notes: getTopics(subject).length > 0,
    pyq: listPapers(subject).length > 0,
    patterns: listPapers(subject).length > 0,
  };
  const tabs = TABS.filter((t) => has[t.key]);
  const units =
    subjects.find((x) => x.slug === subject)?.modules.flatMap((m) => m.units) ??
    [];
  return (
    <>
      <nav aria-label="Subject sections" className="mb-8">
        <ul
          className={`grid ${tabs.length === 4 ? "grid-cols-4" : tabs.length === 3 ? "grid-cols-3" : "grid-cols-2"} gap-1 rounded-full bg-muted p-1 sm:inline-grid sm:auto-cols-max sm:grid-flow-col sm:grid-cols-none`}
        >
          {tabs.map((t) => {
            const on = t.key === active;
            return (
              <li key={t.key}>
                <Link
                  href={t.href(subject)}
                  aria-current={on ? "page" : undefined}
                  className={`flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 text-sm sm:px-4 font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring [@media(pointer:coarse)]:min-h-11 ${
                    on
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <t.icon aria-hidden className="hidden size-4 sm:block" />
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {progress ? (
        <div className="-mt-4 mb-8">
          <SubjectProgress items={subjectItems(subject, units)} />
        </div>
      ) : null}
    </>
  );
}
