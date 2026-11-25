# enforce-use-client-react

<!-- @id euc-enforce-use-client-react -->

Require `'use client'` in Server Component files that use React client hooks, `next/navigation` hooks or inline event
handlers.

|         |                                                                                    |
| ------- | ---------------------------------------------------------------------------------- |
| Config  | `recommended` (error)                                                              |
| Autofix | Yes, unless the file exports `metadata` or route segment config (then report only) |
| Options | `files: 'route'` (default) or `'all'`                                              |

## Why

In the App Router, `page`, `layout`, `template`, `loading`, `not-found` and `default` files are Server Components. React
hooks (except `use` and `useId`), `react-dom`'s `useFormStatus`, and the `next/navigation` hooks (`usePathname`,
`useRouter`, `useSearchParams`, `useParams`, …) only run in Client Components. Neither can an inline `onClick={() => …}`
handler, because a function cannot be passed from the server unless it is a Server Function.

`'use client'` marks a **boundary**. Files imported from a client module are client code already, so this rule checks
the route entry files by default and not every file that uses a hook. Use `files: 'all'` for the strict style.

## Incorrect

```jsx
// app/dashboard/page.tsx
import { usePathname } from 'next/navigation';

export default function Page() {
  return <p>{usePathname()}</p>;
}
```

## Correct

```jsx
// app/dashboard/page.tsx
'use client';

import { usePathname } from 'next/navigation';

export default function Page() {
  return <p>{usePathname()}</p>;
}
```

Or keep the page a Server Component and move the interactive part into its own `'use client'` component.

## Not reported

- `use`, `useId`, `cache`, `Suspense`: these work in Server Components.
- `redirect`, `notFound` from `next/navigation`: these are server APIs.
- Type-only imports, files with `'use server'`, Pages Router files (`pages/`).
- `onClick={save}` (a reference that may be a Server Function), or an inline handler that starts with `'use server'`.

## Autofix

The fix adds `'use client';` above the first statement (leading comments stay on top). There is **no** fix when the file
exports `metadata`, `generateMetadata`, `viewport` or route segment config (`runtime`, `revalidate`, `dynamic`, …).
Those exports only work in Server Components: with the directive, metadata fails the build and route segment config is
silently ignored. The rule then names the export and asks you to move the client part out.

## Source

- https://react.dev/reference/rsc/use-client
- https://nextjs.org/docs/app/getting-started/server-and-client-components
