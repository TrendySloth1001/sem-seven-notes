"use client";

import { School } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ClassPage } from "@/lib/class-pages";

// A class citation that opens the cited page or slide, so the student sees exactly what the teacher wrote.
export function ClassPageChip({
  label,
  source,
  kind,
  pages,
  className,
}: {
  label: string;
  source: string;
  kind: "page" | "slide";
  pages: ClassPage[];
  className: string;
}) {
  const noun = kind === "page" ? "Page" : "Slide";
  return (
    <Dialog>
      <DialogTrigger
        className={`${className} cursor-pointer hover:bg-accent`}
        title={`${source} Click to see the ${kind}.`}
      >
        <School aria-hidden className="size-3 shrink-0" />
        {label}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{source}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          {pages.map((p) => (
            <figure key={p.n} className="flex flex-col gap-2">
              {p.src && p.width && p.height ? (
                <a
                  href={p.src}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${noun.toLowerCase()} ${p.n} full size`}
                  className="block cursor-zoom-in overflow-hidden rounded-lg border bg-paper outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Image
                    src={p.src}
                    alt={`${source} ${noun} ${p.n}.`}
                    width={p.width}
                    height={p.height}
                    sizes="(min-width: 768px) 720px, 100vw"
                    className="h-auto w-full"
                  />
                </a>
              ) : (
                <div className="whitespace-pre-line rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
                  {p.text}
                </div>
              )}
              <figcaption className="text-xs text-muted-foreground">
                {noun} {p.n}
                {p.src ? " · tap the picture to open it full size" : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
