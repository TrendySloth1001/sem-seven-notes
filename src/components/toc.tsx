"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; text: string };

// Highlights the last heading that has scrolled past the top, like the LLM docs "On this page".
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((e): e is HTMLElement => e !== null);
    const onScroll = () => {
      let current: string | null = null;
      for (const el of els) {
        if (el.getBoundingClientRect().top < 120) current = el.id;
      }
      setActive(current ?? els[0]?.id ?? null);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <nav aria-label="On this page" className="flex flex-col gap-0.5">
      <p className="font-mono-label mb-2 text-muted-foreground">On this page</p>
      {items.map((i) => (
        <a
          key={i.id}
          href={`#${i.id}`}
          aria-current={active === i.id ? "location" : undefined}
          className={`border-l-2 py-1.5 pl-3 text-sm leading-snug outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
            active === i.id
              ? "border-primary font-medium text-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {i.text}
        </a>
      ))}
    </nav>
  );
}
