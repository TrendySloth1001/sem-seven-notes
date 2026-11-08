import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-2xl flex-col items-start justify-center gap-4 px-4">
      <h1 className="text-4xl font-bold tracking-tight">sem</h1>
      <p className="text-lg text-muted-foreground">
        A platform to prepare for end semester exams.
      </p>
      <Button asChild size="lg" className="min-h-11 rounded-full px-6">
        <Link href="/syllabus">Open the syllabus</Link>
      </Button>
    </main>
  );
}
