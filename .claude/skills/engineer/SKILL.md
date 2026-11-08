---

name: engineer
description: Use for routes, data, config, caching and any non-UI logic.
---

- Read the Next.js docs in `node_modules/next/dist/docs` first.
- Server components by default; client code only at the smallest leaf.
- Strict types: no `any`, no `!`, no casts to silence errors.
- Validate at trust boundaries: requests, params, env, third-party data.
- Never expose secrets to client code.
- Run `pnpm check` before done; run `pnpm build` too when routes, config or caching change.
