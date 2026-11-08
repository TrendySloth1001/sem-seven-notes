import type { ReactNode } from "react";

// Both languages are rendered on the server; a class on <html> (set before paint) hides one.
// With no Hinglish version, the English one shows in both modes with a short notice.
export function Bilingual({ en, hi }: { en: ReactNode; hi: ReactNode }) {
  if (!hi)
    return (
      <>
        <p className="lang-hi mb-4 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
          Hinglish version abhi likha nahi gaya. Neeche English version hai.
        </p>
        {en}
      </>
    );
  return (
    <>
      <div className="lang-en">{en}</div>
      <div className="lang-hi">{hi}</div>
    </>
  );
}
