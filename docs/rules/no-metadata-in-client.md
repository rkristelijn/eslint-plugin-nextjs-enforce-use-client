# no-metadata-in-client

<!-- @id euc-no-metadata-in-client -->

Disallow exports that fail the build (`metadata`, `generateMetadata`, `generateStaticParams`) or are silently ignored
(`dynamic`) in a `'use client'` page or layout.

|         |                                                                   |
| ------- | ----------------------------------------------------------------- |
| Config  | `recommended` (error)                                             |
| Autofix | No: only you can decide what moves to a separate Client Component |

## Why

These exports only work in Server Components. In a `'use client'` page or layout they fail differently:

- **`metadata`, `generateMetadata`**: the build fails ("You are attempting to export metadata from a component marked
  with use client"). Next.js checks this in `page` and `layout` files only, so other client modules may export these
  names.
- **`generateStaticParams`**: the build fails ("cannot use both 'use client' and export function
  'generateStaticParams()'").
- **`dynamic`**: **silently ignored**. Verified on Next.js 15.5.29: a `'use client'` page with
  `export const dynamic = 'force-dynamic'` builds as a static route (○). Nothing tells you, so this is the more
  dangerous case.

Not reported on purpose: `runtime`, `preferredRegion` and `maxDuration` are read statically and **do** work in a client
file. `revalidate`, `fetchCache` and `dynamicParams` have not been verified, so the rule does not claim anything about
them. Type-only exports are ignored.

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
