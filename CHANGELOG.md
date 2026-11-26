# Changelog

## 2.0.0

The rules now follow the React and Next.js server/client boundary rules (ADR-003), autofix only when it is safe
(ADR-004), and run on ESLint 9.15+ and 10 (ADR-002).

### Breaking

- **ESLint 10 support, ESLint < 9.15 dropped.** 1.x crashed on ESLint 10 (`context.getSourceCode is not a function`).
  Node `^20.19 || ^22.13 || >=24`.
- **Only App Router entry files are checked by default.** `page`, `layout`, `template`, `loading`, `not-found` and
  `default` under `app/`. `'use client'` marks a boundary, so files imported from a client module do not need it. Set
  `{ files: 'all' }` on a rule for the 1.x "every file" behaviour.
- **`enforce-use-client-mui` no longer reports MUI components** (`ThemeProvider`, `CssBaseline`,
  `AppRouterCacheProvider`, `InitColorSchemeScript`). They ship `'use client'` themselves, and MUI's own App Router
  setup uses them in a server layout. 1.x's autofix turned that layout into a Client Component, which breaks
  `export const metadata`. It now reports MUI hooks and `createTheme` / `extendTheme` / `responsiveFontSizes`.
- **`useId` is no longer reported**: it works in Server Components.
- **The directive must be the first statement.** A `'use client'` string after an import no longer counts.
- **No autofix when the file exports `metadata`, `generateMetadata`, `generateStaticParams` or `dynamic`**: with
  `'use client'` those fail the build or are ignored. 1.x skipped `export const runtime = 'edge'` files silently
  (`runtime` actually works in client files) and fixed the others, including layouts with `metadata`.
- **Removed the tutorial example rule** that replaced a fixed word. It was not a Next.js check; remove it from your
  config if you enabled it.
- Removed the unused `enforce-runtime-edge` code; it lives in `eslint-plugin-nextjs-enforce-runtime-edge`.
- License metadata is now MIT, matching the LICENSE file (it said ISC).

### Added

- `configs.recommended` and plugin `meta`.
- `require-use-client-in-error`: `error` and `global-error` must be Client Components.
- `no-metadata-in-client`: in a `'use client'` page or layout, `metadata`, `generateMetadata` and `generateStaticParams`
  fail the build, and `dynamic` is silently ignored (a `'use client'` page with `force-dynamic` builds as static).
- `enforce-use-client-react` reports `useCallback`, `useLayoutEffect`, `useOptimistic`, `useActionState`,
  `useSyncExternalStore` and the other client hooks, `react-dom`'s `useFormStatus`, the `next/navigation` hooks,
  `React.useState`-style member calls, and inline event handlers in Server Components.

### Internal

- Tests on `node:test` with ESLint's RuleTester for every rule, a coverage gate, annotrace traceability, keur, and CI on
  Node 20/22/24. The 24 vulnerable dev dependencies of the jest setup are gone.

### Upgrading from 1.x

1. Upgrade to ESLint 9.15+ (flat config).
2. Replace your rule list with `configs.recommended`, or keep it and drop the tutorial example rule.
3. If you want 1.x's "every file" behaviour, set `{ files: 'all' }` on the `enforce-*` rules.
4. Run `npx eslint --fix .` and review the diff. Reports without a fix name the server-only export that blocks the
   directive.

#### What the new reports mean

| Report                                | Meaning                                                                                                                                                       | What to do                                                                                                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enforce-use-client-*` with a fix     | A Server Component entry file uses a client-only API                                                                                                          | Accept the fix, or move the interactive part into its own `'use client'` component and keep the page on the server                                                              |
| `cannotAddUseClient` (no fix)         | The file needs `'use client'`, but it also exports `metadata`, `generateMetadata`, `generateStaticParams` or `dynamic`, which only work in a Server Component | Keep the file a Server Component and move the client part into its own component; the server-only export stays where it is                                                      |
| `no-metadata-in-client`: `buildError` | `metadata`, `generateMetadata` or `generateStaticParams` in a `'use client'` page or layout: the build fails                                                  | Same as above: split the client part out, or remove the export                                                                                                                  |
| `no-metadata-in-client`: `ignored`    | `dynamic` in a `'use client'` page or layout has no effect. A page with `force-dynamic` builds as static                                                      | Either remove the export (if the route is dynamic for another reason, e.g. a server layout sets `dynamic`), or make the page a Server Component again so `dynamic` takes effect |
| `require-use-client-in-error`         | `error` / `global-error` without `'use client'`                                                                                                               | Accept the fix                                                                                                                                                                  |

#### Reports that disappear

- **Component, hook and helper files** (`Counter.tsx`, `useCart.ts`): they are not a server/client boundary. When they
  are imported from a client module they are client code already. Use `{ files: 'all' }` if you want them checked.
- **MUI components** (`ThemeProvider`, `CssBaseline`, `AppRouterCacheProvider`): they ship `'use client'` themselves.
- **`useId`**: it works in Server Components.

#### Directives added by 1.x

1.x could add `'use client'` to a layout only because it imported MUI components. That layout cannot export `metadata`.
If it uses no client-only API (v2 reports nothing after you remove the directive), you can remove the directive and add
`metadata` again. Check this per file: v2 does not remove directives for you.

## 1.2.0 and earlier

See the git history.
