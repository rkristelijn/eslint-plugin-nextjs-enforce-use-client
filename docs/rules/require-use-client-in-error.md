# require-use-client-in-error

<!-- @id euc-require-use-client-in-error -->

Require `'use client'` in App Router `error` and `global-error` files.

|         |                       |
| ------- | --------------------- |
| Config  | `recommended` (error) |
| Autofix | Yes                   |

## Why

Next.js requires error boundaries to be Client Components: they receive `reset()` and need client state. Without the
directive, the build fails.

## Incorrect

```jsx
// app/dashboard/error.tsx
export default function Error({ reset }) {
  return <button onClick={() => reset()}>Try again</button>;
}
```

## Correct

```jsx
// app/dashboard/error.tsx
'use client';

export default function Error({ reset }) {
  return <button onClick={() => reset()}>Try again</button>;
}
```

## Source

- https://nextjs.org/docs/app/api-reference/file-conventions/error
