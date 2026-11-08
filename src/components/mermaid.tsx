"use client";

import { useEffect, useId, useState } from "react";

// Renders a Mermaid diagram in the browser, re-rendering when the site theme changes.
export function Mermaid({ chart, label }: { chart: string; label: string }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const dark = document.documentElement.classList.contains("dark");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: dark ? "dark" : "neutral",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
        });
        const { svg: out } = await mermaid.render(
          `m${id}${dark ? "d" : "l"}`,
          chart,
        );
        if (!cancelled) setSvg(out);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    render();
    const observer = new MutationObserver(render);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [chart, id]);

  if (failed) {
    return (
      <pre className="w-full text-sm" aria-label={label}>
        {chart}
      </pre>
    );
  }
  return svg ? (
    <div
      role="img"
      aria-label={label}
      className="w-full overflow-x-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      // Mermaid output with securityLevel "strict" is sanitized.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  ) : (
    <p className="py-8 text-sm text-muted-foreground">Drawing diagram…</p>
  );
}
