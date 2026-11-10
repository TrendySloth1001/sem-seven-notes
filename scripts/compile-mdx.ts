// Compiles MDX with the same plugins as the site, so syntax errors fail validation instead of the production build.

import { serialize } from "next-mdx-remote/serialize";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export async function compileError(source: string): Promise<string | null> {
  try {
    const out = await serialize(source, {
      parseFrontmatter: true,
      blockJS: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeSlug, rehypeKatex],
      },
    });
    // KaTeX draws a red error span instead of throwing; treat that as a failure too.
    const bad = /className: "katex-error",\s*title: "((?:[^"\\]|\\.)*)"/.exec(
      out.compiledSource,
    );
    return bad ? `maths does not parse: ${bad[1]}` : null;
  } catch (e) {
    return (e instanceof Error ? e.message : String(e))
      .split("\n")
      .slice(0, 3)
      .join(" ");
  }
}
