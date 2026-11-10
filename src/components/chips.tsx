import {
  BookOpen,
  FileText,
  Globe,
  GraduationCap,
  Newspaper,
  School,
  Tag,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Paper, PaperQuestion, Reference, Topic } from "@/lib/content";

// Question text for a preview: markdown and TeX markers removed, as one plain line.
export function plainQuestion(text: string): string {
  return text
    .replace(/\$\$?([^$]*)\$\$?/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// Inline pills. Chips in running text stay compact; chips in a list get a larger touch target.
const base =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 align-baseline text-[0.8em] leading-5 font-medium no-underline outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";
const touch = "[@media(pointer:coarse)]:min-h-11";

const KIND_ICON = {
  book: BookOpen,
  paper: FileText,
  course: GraduationCap,
  notes: Newspaper,
  docs: Terminal,
  tutorial: Globe,
  wiki: Globe,
  class: School,
} as const;

export function CiteChip({
  reference,
  loc,
  list = false,
}: {
  reference: Reference;
  loc?: string;
  list?: boolean;
}) {
  const Icon = KIND_ICON[reference.kind];
  const title = `${reference.authors}. ${reference.title}. ${reference.venue}${reference.year ? `, ${reference.year}` : ""}.`;
  const body = (
    <>
      <Icon aria-hidden className="size-3 shrink-0" />
      {reference.short}
      {loc ? ` · ${loc}` : ""}
    </>
  );
  // Class files are shared only inside the college, so their chip names the file without linking.
  if (!reference.url)
    return (
      <span
        title={title}
        className={`${base} bg-secondary text-secondary-foreground`}
      >
        {body}
      </span>
    );
  return (
    <a
      href={reference.url}
      target="_blank"
      rel="noreferrer"
      title={title}
      className={`${base} bg-secondary text-secondary-foreground hover:bg-accent ${list ? touch : ""}`}
    >
      {body}
    </a>
  );
}

export function PaperChip({
  subject,
  paper,
  question,
  list = false,
}: {
  subject: string;
  paper: Paper;
  question: PaperQuestion;
  list?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={`/pyq/${subject}/${paper.slug}#${question.id}`}
          aria-description={plainQuestion(question.text)}
          className={`${base} border border-border bg-background text-primary hover:bg-accent ${list ? touch : ""}`}
        >
          <FileText aria-hidden className="size-3 shrink-0" />
          {paper.session}
          {paper.branch ? " (CE)" : ""} · Q{question.label}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm px-3.5 py-2.5 text-sm">
        <span className="flex flex-col gap-1">
          <span className="font-mono text-[0.7rem] uppercase tracking-wide opacity-70">
            {paper.session}
            {paper.branch ? " (CE)" : ""} · Q{question.label} · {question.marks}{" "}
            marks
          </span>
          <span className="leading-relaxed">
            {plainQuestion(question.text)}
          </span>
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

export function SyllabusChip({
  subject,
  module,
}: {
  subject: string;
  module: number;
}) {
  return (
    <Link
      href={`/syllabus/${subject}#module-${module}`}
      className={`${base} bg-muted text-muted-foreground hover:bg-accent hover:text-foreground`}
    >
      <GraduationCap aria-hidden className="size-3 shrink-0" />
      Syllabus · Module {module}
    </Link>
  );
}

export function TopicChip({
  subject,
  topic,
}: {
  subject: string;
  topic: Topic;
}) {
  return (
    <Link
      href={`/notes/${subject}/${topic.slug}`}
      className={`${base} bg-muted text-foreground hover:bg-accent ${touch}`}
    >
      <Tag aria-hidden className="size-3 shrink-0" />
      {topic.title}
    </Link>
  );
}
