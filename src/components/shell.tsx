"use client";

import { GraduationCap, Menu, Moon, Search, Sun, SunMoon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { NavGroup } from "@/lib/nav";
import type { SearchItem } from "@/lib/search";
import { SubjectNav } from "./subject-nav";

type Theme = "system" | "light" | "dark";

function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      // Storage can be blocked; the system theme still works.
    }
  }, []);

  const cycle = () => {
    const next: Theme =
      theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
    setTheme(next);
    try {
      if (next === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch {
      // Ignore: the choice just won't persist.
    }
    applyTheme(next);
  };

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : SunMoon;
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-11 rounded-full"
      onClick={cycle}
      aria-label={`Theme: ${theme}. Click to change.`}
    >
      <Icon aria-hidden className="size-5" />
    </Button>
  );
}

// Two-option switch between English and Hinglish study content; the choice lives on <html data-lang>.
function LangToggle() {
  const [lang, setLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    if (document.documentElement.dataset.lang === "hi") setLang("hi");
  }, []);

  const choose = (next: "en" | "hi") => {
    setLang(next);
    if (next === "hi") document.documentElement.dataset.lang = "hi";
    else delete document.documentElement.dataset.lang;
    try {
      localStorage.setItem("lang", next);
    } catch {
      // Ignore: the choice just won't persist.
    }
  };

  return (
    <fieldset className="flex rounded-full bg-muted p-0.5">
      <legend className="sr-only">Language of notes and solutions</legend>
      {(
        [
          ["en", "EN", "English"],
          ["hi", "HI", "Hinglish"],
        ] as const
      ).map(([value, short, long]) => (
        <button
          key={value}
          type="button"
          aria-pressed={lang === value}
          onClick={() => choose(value)}
          className={`min-h-10 rounded-full px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring [@media(pointer:coarse)]:min-h-11 ${
            lang === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="sm:hidden" aria-hidden>
            {short}
          </span>
          <span className="sr-only sm:not-sr-only">{long}</span>
        </button>
      ))}
    </fieldset>
  );
}

export function Shell({
  groups,
  searchItems,
  children,
}: {
  groups: NavGroup[];
  searchItems: SearchItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);

  useEffect(() => setDrawer(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /input|textarea/i.test(
        (e.target as HTMLElement | null)?.tagName ?? "",
      );
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !typing)
      ) {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (item: SearchItem) => {
    setSearch(false);
    router.push(item.href);
  };

  return (
    <TooltipProvider delayDuration={250}>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          className="size-11 rounded-full lg:hidden"
          aria-label="Open navigation"
          onClick={() => setDrawer(true)}
        >
          <Menu aria-hidden className="size-5" />
        </Button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full p-1 pr-3 font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <GraduationCap aria-hidden className="size-5" />
          </span>
          sem
        </Link>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setSearch(true)}
          aria-label="Search modules and topics"
          className="flex min-h-11 items-center gap-2 rounded-full bg-muted px-4 text-sm text-muted-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search aria-hidden className="size-4" />
          <span className="hidden sm:inline">Search modules, topics…</span>
          <kbd className="hidden rounded border bg-background px-1.5 font-mono text-[0.7rem] sm:inline">
            ⌘K
          </kbd>
        </button>
        <LangToggle />
        <ThemeToggle />
      </header>

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-72 shrink-0 overflow-y-auto border-r p-3 lg:block">
          <SubjectNav groups={groups} />
        </aside>
        <div id="main" className="min-w-0 flex-1">
          {children}
        </div>
      </div>

      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" className="w-80 p-3">
          <SheetHeader>
            <SheetTitle>Subjects</SheetTitle>
          </SheetHeader>
          <SubjectNav groups={groups} onNavigate={() => setDrawer(false)} />
        </SheetContent>
      </Sheet>

      <CommandDialog
        open={search}
        onOpenChange={setSearch}
        title="Search the syllabus"
        description="Find a module or topic across all subjects."
      >
        <Command>
          <CommandInput placeholder="Search modules, topics…" />
          <CommandList>
            <CommandEmpty>Nothing matches that.</CommandEmpty>
            {[...new Set(searchItems.map((i) => i.group))].map((group) => (
              <CommandGroup key={group} heading={group}>
                {searchItems
                  .filter((i) => i.group === group)
                  .map((i) => (
                    <CommandItem
                      key={i.href}
                      value={`${i.group} ${i.hint} ${i.label} ${i.keywords}`}
                      onSelect={() => go(i)}
                      className="min-h-11"
                    >
                      <span className="font-mono text-xs text-muted-foreground">
                        {i.hint}
                      </span>
                      <span>{i.label}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </TooltipProvider>
  );
}
