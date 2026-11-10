import { getTopics, listPapers } from "./content";
import { moduleId, subjects } from "./syllabus";

export type SearchItem = {
  href: string;
  group: string;
  label: string;
  hint: string;
  keywords: string;
};

// One flat index for the ⌘K dialog: syllabus modules, notes and every past-paper question.
export function getSearchItems(): SearchItem[] {
  const items: SearchItem[] = [];
  for (const s of subjects) {
    for (const m of s.modules) {
      items.push({
        href: `/syllabus/${s.slug}#${moduleId(m.number)}`,
        group: s.name,
        label: `${m.number}. ${m.title}`,
        hint: "Syllabus",
        keywords: m.units.map((u) => `${u.heading ?? ""} ${u.text}`).join(" "),
      });
    }
    for (const t of getTopics(s.slug)) {
      items.push({
        href: `/notes/${s.slug}/${t.slug}`,
        group: s.name,
        label: t.title,
        hint: "Notes",
        keywords: "",
      });
    }
    for (const p of listPapers(s.slug)) {
      for (const q of p.questions) {
        items.push({
          href: `/pyq/${s.slug}/${p.slug}#${q.id}`,
          group: s.name,
          label: `${p.session}${p.branch ? " (CE)" : ""} · Q${q.label}`,
          hint: "Question",
          keywords: q.text,
        });
      }
    }
  }
  return items;
}
