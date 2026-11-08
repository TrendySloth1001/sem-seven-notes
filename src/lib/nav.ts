import { getTopics, listPapers, listWrittenNotes } from "./content";
import { subjects } from "./syllabus";

export type NavLink = {
  href: string;
  label: string;
  num?: string;
  muted?: boolean;
};
export type NavGroup = { heading: string; links: NavLink[] };

export function getNavGroups(): NavGroup[] {
  const groups: NavGroup[] = [
    {
      heading: "Syllabus",
      links: [
        { href: "/syllabus", label: "Overview" },
        ...subjects.map((s, i) => ({
          href: `/syllabus/${s.slug}`,
          label: s.name,
          num: String(i + 1).padStart(2, "0"),
        })),
      ],
    },
  ];

  for (const s of subjects) {
    const topics = getTopics(s.slug);
    if (topics.length === 0) continue;
    const written = listWrittenNotes(s.slug);
    groups.push({
      heading: `${s.shortName} · Notes`,
      links: [
        { href: `/notes/${s.slug}`, label: "All topics" },
        ...topics.map((t) => ({
          href: `/notes/${s.slug}/${t.slug}`,
          label: t.title,
          num: `M${t.module}`,
          muted: !written.has(t.slug),
        })),
      ],
    });
    groups.push({
      heading: `${s.shortName} · Past papers`,
      links: [
        { href: `/pyq/${s.slug}`, label: "All papers" },
        ...listPapers(s.slug).map((p) => ({
          href: `/pyq/${s.slug}/${p.slug}`,
          label: p.branch ? `${p.session} (${p.branch})` : p.session,
        })),
      ],
    });
  }
  return groups;
}
