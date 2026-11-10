import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { isValidElement, type ReactNode } from "react";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import {
  type ImageRef,
  imageSite,
  type Paper,
  type Reference,
} from "@/lib/content";
import { CiteChip, PaperChip, SyllabusChip } from "./chips";
import { CurvePlot, Figure, NetworkFigure, NormBalls } from "./figures";
import { Mermaid } from "./mermaid";

export type DocContext = {
  subject: string;
  refs: Record<string, Reference>;
  papers: Paper[];
  images: Record<string, ImageRef>;
};

// A credited, openly licensed diagram (Wikimedia Commons or d2l.ai), on a white panel so it reads in dark mode.
function Img({ image, caption }: { image: ImageRef; caption: string }) {
  return (
    <figure className="my-8">
      <div className="overflow-hidden rounded-lg border bg-paper p-3">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 768px) 720px, 100vw"
          className="mx-auto h-auto max-h-[28rem] w-auto max-w-full object-contain"
        />
      </div>
      <figcaption className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {caption}{" "}
        <span className="text-xs">
          Image:{" "}
          <a
            href={image.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {image.author}
          </a>
          ,{" "}
          {image.licenseUrl ? (
            <a
              href={image.licenseUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              {image.license}
            </a>
          ) : (
            image.license
          )}
          , via {imageSite(image)}.
        </span>
      </figcaption>
    </figure>
  );
}

const BOX_LABEL = {
  definition: "Definition",
  key: "Key idea",
  intuition: "Intuition",
  pitfall: "Common mistake",
  exam: "How to write it in the exam",
  verify: "Check the answer",
} as const;

type HastNode = {
  type: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

// Runs after rehype-slug: prefixes heading ids so the Hinglish copy never clashes with the English one.
function rehypePrefixIds(prefix: string) {
  const walk = (node: HastNode) => {
    const id = node.properties?.id;
    if (node.type === "element" && typeof id === "string" && node.properties)
      node.properties.id = prefix + id;
    for (const c of node.children ?? []) walk(c);
  };
  return () => walk;
}

// Flat labelled block: a small mono label above the content, no side stripes or icons.
function Box({
  kind,
  children,
}: {
  kind: keyof typeof BOX_LABEL;
  children: ReactNode;
}) {
  return (
    <aside className="my-6 rounded-lg border bg-card px-4 py-3">
      <p className="font-mono-label mb-1 text-muted-foreground">
        {BOX_LABEL[kind]}
      </p>
      <div className="[&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}

// A worked sum: labelled rows (Given, To find, Steps, Answer) and the check, so the working reads top to bottom.
function Sum({ children }: { children: ReactNode }) {
  return (
    <section className="sum my-8 overflow-hidden rounded-xl border bg-card">
      <p className="font-mono-label border-b px-4 py-2.5 text-muted-foreground">
        Worked sum
      </p>
      <div className="divide-y">{children}</div>
    </section>
  );
}

function SumRow({
  label,
  tone = "plain",
  children,
}: {
  label: string;
  tone?: "plain" | "answer";
  children: ReactNode;
}) {
  return (
    <div
      className={`grid gap-1 px-4 py-3.5 sm:grid-cols-[6.5rem_1fr] sm:gap-4 ${
        tone === "answer" ? "bg-secondary text-secondary-foreground" : ""
      }`}
    >
      <p className="font-mono-label pt-1 text-muted-foreground">{label}</p>
      <div
        className={`min-w-0 [&>:first-child]:mt-0 [&>:last-child]:mb-0 ${
          tone === "answer" ? "font-semibold" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function components(ctx: DocContext) {
  return {
    // A missing id throws, so a typo fails the build instead of printing a dead chip.
    Cite: ({ id, loc }: { id: string; loc?: string }) => {
      const reference = ctx.refs[id];
      if (!reference) throw new Error(`Unknown reference id "${id}"`);
      return loc ? (
        <CiteChip reference={reference} loc={loc} />
      ) : (
        <CiteChip reference={reference} />
      );
    },
    PYQ: ({ id }: { id: string }) => {
      const [slug, qid] = id.split("/");
      const paper = ctx.papers.find((p) => p.slug === slug);
      const question = paper?.questions.find((q) => q.id === qid);
      if (!paper || !question) throw new Error(`Unknown PYQ "${id}"`);
      return (
        <PaperChip subject={ctx.subject} paper={paper} question={question} />
      );
    },
    Img: ({ id, caption }: { id: string; caption: string }) => {
      const image = ctx.images[id];
      if (!image) throw new Error(`Unknown image id "${id}"`);
      return <Img image={image} caption={caption} />;
    },
    Syl: ({ m }: { m: string }) => (
      <SyllabusChip subject={ctx.subject} module={Number(m)} />
    ),
    Box,
    Sum,
    Given: ({ children }: { children: ReactNode }) => (
      <SumRow label="Given">{children}</SumRow>
    ),
    Find: ({ children }: { children: ReactNode }) => (
      <SumRow label="To find">{children}</SumRow>
    ),
    Steps: ({ children }: { children: ReactNode }) => (
      <SumRow label="Steps">
        <div className="sum-steps">{children}</div>
      </SumRow>
    ),
    Answer: ({ children }: { children: ReactNode }) => (
      <SumRow label="Answer" tone="answer">
        {children}
      </SumRow>
    ),
    Figure,
    CurvePlot,
    NetworkFigure,
    NormBalls,
    // ```mermaid fences become diagrams. A first line "%% caption: ..." becomes the caption.
    pre: (props: React.ComponentProps<"pre">) => {
      const child = props.children;
      if (
        isValidElement<{ className?: string; children?: ReactNode }>(child) &&
        child.props.className?.includes("language-mermaid")
      ) {
        const raw = String(child.props.children ?? "").trim();
        const first = raw.split("\n")[0] ?? "";
        const caption = first.startsWith("%% caption:")
          ? first.replace("%% caption:", "").trim()
          : "";
        if (!caption)
          throw new Error(
            "Mermaid diagrams need a first line: %% caption: ...",
          );
        return (
          <Figure caption={caption}>
            <Mermaid chart={raw} label={caption} />
          </Figure>
        );
      }
      return <pre {...props} />;
    },
    table: (props: React.ComponentProps<"table">) => (
      <div className="my-6 overflow-x-auto rounded-lg border">
        <table {...props} />
      </div>
    ),
  };
}

export function Doc({
  source,
  ctx,
  idPrefix = "",
}: {
  source: string;
  ctx: DocContext;
  idPrefix?: string;
}) {
  return (
    <div className="doc">
      <MDXRemote
        source={source}
        components={components(ctx)}
        options={{
          blockJS: false,
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkMath],
            rehypePlugins: idPrefix
              ? [rehypeSlug, rehypePrefixIds(idPrefix), rehypeKatex]
              : [rehypeSlug, rehypeKatex],
          },
        }}
      />
    </div>
  );
}
