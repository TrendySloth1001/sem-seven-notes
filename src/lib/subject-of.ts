// Client-safe: no server imports, because the sidebar uses it in the browser.
// The subject a URL belongs to: /syllabus/<s>, /notes/<s>/..., /pyq/<s>/..., /patterns/<s>
export function subjectOf(pathname: string): string | undefined {
  const [, section, slug] = pathname.split("/");
  return section && ["syllabus", "notes", "pyq", "patterns"].includes(section)
    ? slug || undefined
    : undefined;
}
