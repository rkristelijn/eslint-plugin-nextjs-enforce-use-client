# ADR-003 — 'use client' marks a boundary, not every file that uses a hook

@id ADR-003 **Status**: accepted · **Date**: 2026-11-25 · **Coverage**: code

## Context

1.x required `'use client'` in every file that imported certain hooks or MUI components. Checked against the React and
MUI documentation, that was wrong in four ways:

1. **Boundary, not every file.** React: `'use client'` marks a module and its transitive imports as client code; "when a
   'use client' module is imported from another client-rendered module, the directive has no effect". A custom hook file
   (`useThing.ts`) only imported by client code does not need it. Marking every file makes each one a boundary entry,
   and the Next.js TypeScript plugin then warns about non-serializable props (`onClick`) on those components.
2. **MUI components ship their own 'use client'.** MUI's official App Router setup renders `ThemeProvider` and
   `AppRouterCacheProvider` in a **server** `layout.tsx`. 1.x reported them, and its autofix made the root layout a
   Client Component, which breaks `export const metadata`. What does need a client file is a theme built with
   `createTheme`, because a theme with functions cannot cross the boundary.
3. **Wrong hook list.** `useId` works in Server Components ("hooks excluding `use` and `useId`"). `useCallback`,
   `useLayoutEffect`, `useOptimistic`, `useActionState`, `useFormStatus` and the `next/navigation` hooks (`usePathname`,
   `useRouter`, `useSearchParams`, …) were missing. The `next/navigation` hooks are the most common reason for
   `'use client'` in practice.
4. **Directive anywhere.** A `'use client'` string after an import counted as the directive. It only works as the first
   statement.

## Decision

The rules ask one question: **is this file a Server Component that uses a client-only API?**

### Which files

@id ADR-003.entry-files

By default (`files: 'route'`), only App Router entry files are checked: `page`, `layout`, `template`, `loading`,
`not-found`, `default`, `forbidden` and `unauthorized` under an `app/` directory. These are Server Components unless
they say otherwise; the boundary decision lives there. `files: 'all'` checks every file for teams that want the strict
style. `error` and `global-error` must be Client Components: that is a separate rule.

### What counts as a directive

@id ADR-003.directive-prologue

Only the directive prologue counts: leading string statements, with comments allowed before them. A file with
`'use server'` is never told to add `'use client'`.

### What counts as client-only usage

@id ADR-003.usage

The data lives in `lib/data/client-apis.js`: React client hooks (the React list without `use` and `useId`),
`react-dom`'s `useFormStatus`, the `next/navigation` hooks, MUI hooks and theme factories, and react-number-format,
which ships no directive. Usage is found through named imports, namespace and default imports (`React.useState`), and
inline event handlers (`onClick={() => …}`), which cannot be passed from a Server Component unless they are Server
Functions. Type-only imports never count.

## Consequences

- Breaking: files outside the App Router entry files are no longer reported by default, and MUI components no longer
  trigger reports. Both were false positives.
- New: `require-use-client-in-error` and `no-metadata-in-client` catch the two boundary mistakes that fail a Next.js
  build.
