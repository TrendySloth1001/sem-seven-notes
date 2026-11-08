import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { Shell } from "@/components/shell";
import { getNavGroups } from "@/lib/nav";
import { getSearchItems } from "@/lib/search";
import "katex/dist/katex.min.css";
import "./globals.css";

const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: { default: "sem", template: "%s | sem" },
  description: "A platform to prepare for end semester exams.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fef7ff" },
    { media: "(prefers-color-scheme: dark)", color: "#141218" },
  ],
};

// Runs before first paint so a saved dark theme or Hinglish choice never flashes the default.
const themeScript = `try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);if(localStorage.getItem("lang")==="hi")document.documentElement.dataset.lang="hi"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} font-sans`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Shell groups={getNavGroups()} searchItems={getSearchItems()}>
          {children}
        </Shell>
      </body>
    </html>
  );
}
