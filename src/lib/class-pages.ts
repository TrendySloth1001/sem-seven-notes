// Pictures of the teachers' class pages and slides, so a class citation can show its source.
// Client-safe: no fs, so the dialog and the server share the parsing.

export type ClassPage = {
  n: number;
  src?: string;
  width?: number;
  height?: number;
  /** Slides that are only text have their text instead of a picture. */
  text?: string;
};

export type ClassPages = Record<
  string,
  {
    kind: "page" | "slide";
    items: Record<string, Omit<ClassPage, "n">>;
  }
>;

/** "p. 23", "pp. 17 and 19", "slides 64 to 67", "slides 6, 10 and 11" → kind and page numbers. */
export function parseLoc(loc: string): {
  kind: "page" | "slide" | null;
  numbers: number[];
} {
  const m = /^(pp?|slides?)\.?\s+(.*)$/.exec(loc.trim());
  if (!m?.[1] || m[2] === undefined) return { kind: null, numbers: [] };
  const kind = m[1].startsWith("p") ? "page" : "slide";
  const numbers = m[2].split(/,|\band\b/).flatMap((part) => {
    const r = part.match(/\d+/g)?.map(Number) ?? [];
    const [a, b] = r;
    return /\bto\b|[-–]/.test(part) && a !== undefined && b !== undefined
      ? Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i)
      : r;
  });
  return { kind, numbers };
}

/** The pictures (or slide text) a citation points at; empty when none were published. */
export function pagesFor(
  pages: ClassPages,
  id: string,
  loc: string | undefined,
): ClassPage[] {
  const file = pages[id];
  if (!file || !loc) return [];
  const { kind, numbers } = parseLoc(loc);
  if (kind !== file.kind) return [];
  return numbers.flatMap((n) => {
    const item = file.items[String(n)];
    return item ? [{ n, ...item }] : [];
  });
}
