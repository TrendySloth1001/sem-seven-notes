---
name: designer
description: Use for any UI work: components, layout, styling, motion.
---

- Use semantic tokens from `src/app/globals.css` only; never raw hex values.
- Design mobile-first (~375px), then check desktop (~1280px).
- Components: shadcn/ui (Radix + Tailwind), Lucide icons. Approved extras, installed only when first needed: Motion, Sonner, Vaul, TanStack Table, Recharts, dnd-kit. Anything else: ask first. Never hand-build a primitive a library already provides.
- Accessibility: semantic HTML, labelled controls, visible focus, 44px touch targets, WCAG AA contrast, honor reduced motion.
- Finish by looking at it in the browser at both widths.
