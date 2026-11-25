# no-metadata-in-client

<!-- @id euc-no-metadata-in-client -->

Disallow `metadata` (build error) and route segment config (silently ignored) exports in `'use client'` files.

|         |                                                                   |
| ------- | ----------------------------------------------------------------- |
| Config  | `recommended` (error)                                             |
| Autofix | No: only you can decide what moves to a separate Client Component |

## Why

Both only work in Server Components, but they fail differently:

- **`metadata`, `generateMetadata`, `viewport`, `generateViewport`**: the build fails ("You are attempting to export
  metadata from a component marked with use client").
- **Route segment config** (`dynamic`, `revalidate`, `runtime`, `fetchCache`, …): **silently ignored**. Verified on
  Next.js 15.5.29: a `'use client'` page with `export const dynamic = 'force-dynamic'` builds as a static route (○).
  This is the more dangerous case, because nothing tells you.

## Incorrect

```jsx
'use client';

export const metadata = { title: 'Dashboard' };
export default function Layout({ children }) {}
```

## Correct

```jsx
// layout.tsx stays a Server Component
import Shell from './Shell'; // Shell.tsx has 'use client'

export const metadata = { title: 'Dashboard' };
export default function Layout({ children }) {
  return <Shell>{children}</Shell>;
}
```

## Source

- https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
