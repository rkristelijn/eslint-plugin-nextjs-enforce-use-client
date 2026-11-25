# ADR-004 — Add 'use client' only when the file can become a Client Component

@id ADR-004 **Status**: accepted · **Date**: 2026-11-25 · **Coverage**: code

## Context

Adding `'use client'` is not always a fix. Some exports only work in a Server Component:

- `metadata`, `generateMetadata`, `viewport`, `generateViewport`: in a `'use client'` file **the build fails**.
- Route segment config (`dynamic`, `revalidate`, `runtime`, `fetchCache`, …): in a `'use client'` file it is **silently
  ignored**. Verified on Next.js 15.5.29: a `'use client'` page with `export const dynamic = 'force-dynamic'` builds as
  a static route (○). The Next.js docs do not state this; the build does.

1.x skipped files with `export const runtime = 'edge'` silently and fixed all others, including layouts with `metadata`.

## Decision

- If the file exports any server-only name, the rule reports `cannotAddUseClient` with no autofix and names the export.
  The right change is to move the client part into its own component; only a human can draw that line.
- Otherwise there is **one report per file** with one fix (the directive), because one directive resolves every usage.
- `no-metadata-in-client` reports the opposite mistake: a server-only export in a file that already has `'use client'`.

## Consequences

- `eslint --fix` never turns a working Server Component into a broken one, or silently drops its route segment config.
- A field run on a real Next.js monorepo found 27 `'use client'` pages with `dynamic = 'force-dynamic'` that has no
  effect.
