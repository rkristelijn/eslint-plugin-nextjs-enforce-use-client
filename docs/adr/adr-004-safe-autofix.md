# ADR-004 — Add 'use client' only when the file can become a Client Component

@id ADR-004 **Status**: accepted · **Date**: 2026-11-25 · **Coverage**: code

## Context

Adding `'use client'` is not always a fix. Some exports only work in a Server Component (checked against the Next.js
15.5.29 source and a build):

- `metadata`, `generateMetadata` in a `'use client'` page or layout: **the build fails** (`react_server_components.rs`
  checks `[\\/](page|layout)` files).
- `generateStaticParams` with `'use client'`: **the build fails** (`get-page-static-info.ts`).
- `dynamic`: **silently ignored**. A `'use client'` page with `export const dynamic = 'force-dynamic'` builds as a
  static route (○).
- `runtime`, `preferredRegion`, `maxDuration` are read statically from the file and **do** work with `'use client'`.
  They do not block the fix. `revalidate`, `fetchCache` and `dynamicParams` are not verified, so the rules do not treat
  them either way.

1.x skipped files with `export const runtime = 'edge'` silently and fixed all others, including layouts with `metadata`.

## Decision

- If the file exports any server-only name, the rule reports `cannotAddUseClient` with no autofix and names the export.
  The right change is to move the client part into its own component; only a human can draw that line.
- Otherwise there is **one report per file** with one fix (the directive), because one directive resolves every usage.
- `no-metadata-in-client` reports the opposite mistake: a server-only export in a file that already has `'use client'`.

## Consequences

- `eslint --fix` never turns a working Server Component into a broken one, or silently drops its `dynamic` setting.
- A field run on a real Next.js monorepo found 27 `'use client'` pages with `dynamic = 'force-dynamic'` that has no
  effect.
