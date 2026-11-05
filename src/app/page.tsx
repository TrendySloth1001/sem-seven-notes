import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-start justify-center gap-4 px-4">
      <h1 className="text-3xl font-semibold tracking-tight">sem</h1>
      <p className="text-muted-foreground">
        A platform to prepare for end semester exams.
      </p>
      <Button size="lg" className="min-h-11">
        Get started
      </Button>
    </main>
  );
}
