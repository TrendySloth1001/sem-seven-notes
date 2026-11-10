import { getTopics, listPapers, listWrittenNotes } from "./content";
import { subjects } from "./syllabus";

export type NavLink = {
  href: string;
  label: string;
  num?: string;
  muted?: boolean;
  /** Marks this link active anywhere inside that subject, not only on its own URL. */
  subject?: string;
};
/** Groups with a subject are shown only while the reader is inside that subject. */
export type NavGroup = { heading: string; links: NavLink[]; subject?: string };

export function getNavGroups(): NavGroup[] {
  const groups: NavGroup[] = [
    {
      heading: "Subjects",
      links: [
        { href: "/", label: "Home" },
        { href: "/syllabus", label: "Syllabus overview" },
        ...subjects.map((s, i) => ({
          href: `/syllabus/${s.slug}`,
          label: s.name,
          num: String(i + 1).padStart(2, "0"),
          subject: s.slug,
        })),
      ],
    },
  ];

  for (const s of subjects) {
    const topics = getTopics(s.slug);
    if (topics.length === 0) continue;
    const written = listWrittenNotes(s.slug);
    groups.push({
      heading: "Notes",
      subject: s.slug,
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
    const papers = listPapers(s.slug);
    const own = papers.filter((p) => !p.branch);
    const other = papers.filter((p) => p.branch);
    groups.push({
      heading: "Past papers",
      subject: s.slug,
      links: [
        { href: `/pyq/${s.slug}`, label: "All papers" },
        { href: `/patterns/${s.slug}`, label: "Exam patterns" },
        ...own.map((p) => ({
          href: `/pyq/${s.slug}/${p.slug}`,
          label: p.session,
        })),
      ],
    });
    if (other.length > 0)
      groups.push({
        heading: "Computer Engg. papers (practice)",
        subject: s.slug,
        links: other.map((p) => ({
          href: `/pyq/${s.slug}/${p.slug}`,
          label: p.session,
        })),
      });
  }
  return groups;
}
