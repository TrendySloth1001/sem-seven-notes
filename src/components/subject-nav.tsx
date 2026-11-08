"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavGroup } from "@/lib/nav";

const item =
  "flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";
const idle = "text-muted-foreground hover:bg-muted hover:text-foreground";
const on = "bg-secondary text-secondary-foreground";

export function SubjectNav({
  groups,
  onNavigate = () => {},
}: {
  groups: NavGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Site" className="flex flex-col gap-1">
      {groups.map((g, gi) => (
        <div key={g.heading} className="flex flex-col gap-0.5">
          <p
            className={`font-mono-label px-4 pb-1 text-muted-foreground ${gi === 0 ? "" : "mt-5"}`}
          >
            {g.heading}
          </p>
          {g.links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`${item} ${active ? on : idle} ${l.muted && !active ? "opacity-60" : ""}`}
              >
                {l.num ? (
                  <span className="w-6 shrink-0 font-mono text-xs tabular-nums">
                    {l.num}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1 leading-tight">{l.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
