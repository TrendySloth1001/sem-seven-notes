"use client";

import { useId, useSyncExternalStore } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import type { SubjectItems } from "@/lib/done";

// Ticks live in this browser only (localStorage), so progress needs no account and survives reloads.
const KEY = "sem:done";
const EVENT = "sem:done-change";

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function useDoneSet(): Set<string> {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  try {
    const list: unknown = JSON.parse(raw);
    return new Set(
      Array.isArray(list)
        ? list.filter((x): x is string => typeof x === "string")
        : [],
    );
  } catch {
    return new Set();
  }
}

function toggle(ids: string[], on: boolean) {
  const set = new Set<string>(JSON.parse(read()) as string[]);
  for (const id of ids) {
    if (on) set.add(id);
    else set.delete(id);
  }
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    // Storage blocked: the tick shows until reload but cannot persist.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function DoneCheck({
  id,
  label,
  showLabel = false,
}: {
  /** Several ids tick together, e.g. every paper's copy of one repeated question. */
  id: string | string[];
  label: string;
  showLabel?: boolean;
}) {
  const ids = Array.isArray(id) ? id : [id];
  const set = useDoneSet();
  const done = ids.length > 0 && ids.every((x) => set.has(x));
  const htmlId = useId();
  return (
    <span className="inline-flex min-h-8 min-w-8 items-center justify-center gap-2 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11">
      <Checkbox
        id={htmlId}
        checked={done}
        onCheckedChange={(v) => toggle(ids, v === true)}
        aria-label={showLabel ? undefined : `Mark done: ${label}`}
        className="size-5"
      />
      {showLabel ? (
        <label
          htmlFor={htmlId}
          className="cursor-pointer text-sm font-medium select-none"
        >
          {done ? "Done" : "Mark as done"}
        </label>
      ) : null}
    </span>
  );
}

export function SubjectProgress({
  items,
  compact = false,
}: {
  items: SubjectItems;
  compact?: boolean;
}) {
  return (
    <DoneProgress
      title="Your progress"
      compact={compact}
      rows={[
        { label: "Syllabus", ids: items.units },
        { label: "Notes", ids: items.notes },
        { label: "Questions", ids: items.questions },
        { label: "Themes", ids: items.themes },
      ]}
    />
  );
}

// Progress bars for any groups of tickable ids, with an overall percentage.
export function DoneProgress({
  title,
  rows: all,
  compact = false,
}: {
  title: string;
  rows: { label: string; ids: string[] }[];
  compact?: boolean;
}) {
  const done = useDoneSet();
  const rows = all.filter((r) => r.ids.length > 0);
  const ids = [...new Set(rows.flatMap((r) => r.ids))];
  const total = ids.filter((id) => done.has(id)).length;
  const pct = ids.length ? Math.round((total / ids.length) * 100) : 0;
  return (
    <div
      className={
        compact
          ? "flex flex-col gap-2"
          : "flex flex-col gap-3 rounded-2xl border bg-card p-4"
      }
    >
      <p className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{title}</span>
        <span className="font-mono text-muted-foreground">{pct}%</span>
      </p>
      {rows.map((r) => {
        const n = r.ids.filter((id) => done.has(id)).length;
        return (
          <div
            key={r.label}
            className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 text-xs"
          >
            <span className="text-muted-foreground">{r.label}</span>
            <Progress
              value={(n / r.ids.length) * 100}
              aria-label={`${r.label}: ${n} of ${r.ids.length} done`}
            />
            <span className="font-mono tabular-nums text-muted-foreground">
              {n}/{r.ids.length}
            </span>
          </div>
        );
      })}
    </div>
  );
}
