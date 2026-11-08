# sem

A platform to prepare for end semester exams.

Next.js (App Router) + React + TypeScript + Tailwind CSS, managed with pnpm. All code lives in `src/`: routes in `src/app/`, shared UI in `src/components/`, logic in `src/lib/`; scripts go in `scripts/`. Import with `@/*`.

Commands:

- `pnpm dev`: start the dev server.
- `pnpm check`: typecheck (tsc) plus Biome lint and format check; silent on success.
- `pnpm test`: unit tests with the built-in `node --test` runner.
- `pnpm build`: full production build.
- `pnpm validate`: checks study content (references, past-paper ids, topic tags).

## How to work

- Make the smallest complete change and reuse before adding.
- No speculative options or abstractions.
- Comments are one line and explain why, not what.
- New non-trivial logic gets a small test.
- Run `pnpm check` before calling work done, and `pnpm build` when routes, config or caching change.
- Read the Next.js docs in `node_modules/next/dist/docs` before writing framework code; do not rely on memory of older versions.
- UI is done only once checked in the browser at phone width (~375px) and desktop width (~1280px). Measure positions when precision matters.
- Show big changes before they spread across the app.
- Never remove or merge a page section on your own reading; ask first.
- Commit only when asked: one commit per piece of work, in order, each building on its own, with messages that say what and why. Branch when on the default branch. Never push unless asked.
- Replies are short and plain: what changed, what you checked, what you did not check, any risk.

## Code rules

- Server-side by default; client code only at the smallest leaf that needs it.
- No `any`, no non-null `!`, no casts to silence errors.
- Validate everything at trust boundaries (requests, params, env, third-party data). Add a schema library only when the first boundary needs it.
- Never expose secrets to client code. Every env var the app reads goes in `.env.example` with a placeholder.

## UI

- shadcn/ui (Radix + Tailwind) is the only component kit; Lucide for icons. Add components with `pnpm dlx shadcn@latest add <name>` when first needed.
- Approved extras, installed only when first needed: Motion (animation), Sonner (toasts), Vaul (mobile drawers), TanStack Table (tables), Recharts (charts), dnd-kit (drag and drop). Anything else: ask first. Never hand-build a primitive a library already provides.
- Use semantic tokens from `src/app/globals.css` (background, foreground, muted, border, accent...), never raw hex values.
- Semantic HTML, labelled controls, visible focus, 44px touch targets, WCAG AA contrast, respect reduced motion.

## Files never to read

Build output (`.next/`), lockfiles (`pnpm-lock.yaml`), env files (`.env*`, except `.env.example`).

## Third-party content

If the project uses others' content or data: record source, author and license for every item, keep an allowlist of accepted licenses, and provide a takedown route.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Study content

Notes, past-paper solutions and references live in `content/<subject>/`. Read `CONTENT_GUIDE.md` before writing any: it sets the beginner-first style, the citation rules and the file layout. Run `pnpm validate` after content changes.
