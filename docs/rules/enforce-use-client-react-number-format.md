# enforce-use-client-react-number-format

<!-- @id euc-enforce-use-client-react-number-format -->

Require `'use client'` in Server Component files that use react-number-format.

|         |                                                                 |
| ------- | --------------------------------------------------------------- |
| Config  | `recommended` (error)                                           |
| Autofix | Yes, unless the file exports `metadata` or route segment config |
| Options | `files: 'route'` (default) or `'all'`                           |

## Why

react-number-format (checked on 5.4.5) ships no `'use client'` directive, and its components use React state. Rendering
`NumericFormat` or `PatternFormat` from a Server Component therefore needs a client boundary. The formatter functions
(`numericFormatter`, …) are plain functions and are not reported.

## Incorrect

```jsx
// app/invoices/page.tsx
import { NumericFormat } from 'react-number-format';
```

## Correct

```jsx
// app/invoices/page.tsx
'use client';

import { NumericFormat } from 'react-number-format';
```

Or wrap it once in a `'use client'` component and use that wrapper from Server Components.
