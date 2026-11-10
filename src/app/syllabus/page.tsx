import { ArrowRight, Clock, Layers } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { subjects, totalHours } from "@/lib/syllabus";

export const metadata: Metadata = {
  title: "Syllabus",
  description: "Semester VII theory syllabus, all subjects.",
};

export default function SyllabusOverview() {
  return (
    <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <p className="font-mono-label text-primary">Semester VII</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        Syllabus
      </h1>
      <p className="mt-3 max-w-4xl text-lg leading-relaxed text-muted-foreground">
        Five theory subjects. Open one to see every module, its topics and the
        hours it gets. Press <kbd className="font-mono">⌘K</kbd> to search
        across all of them.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {subjects.map((s, i) => (
          <li key={s.slug}>
            <Link
              href={`/syllabus/${s.slug}`}
              className="group flex h-full flex-col gap-3 rounded-2xl border bg-card p-5 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Badge variant="outline" className="font-mono">
                  {s.code}
                </Badge>
              </div>
              <h2 className="text-xl font-semibold leading-snug">{s.name}</h2>
              <p className="text-sm text-muted-foreground">{s.kind}</p>
              <div className="mt-auto flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock aria-hidden className="size-4" />
                  {totalHours(s)} hrs
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers aria-hidden className="size-4" />
                  {s.modules.length} modules
                </span>
                <ArrowRight
                  aria-hidden
                  className="ml-auto size-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
