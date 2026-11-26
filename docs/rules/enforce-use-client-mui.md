# enforce-use-client-mui

<!-- @id euc-enforce-use-client-mui -->

Require `'use client'` in Server Component files that use MUI hooks or create a theme.

|         |                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------ |
| Config  | `recommended` (error)                                                                            |
| Autofix | Yes, unless the file exports `metadata`, `generateMetadata`, `generateStaticParams` or `dynamic` |
| Options | `files: 'route'` (default) or `'all'`                                                            |

## Why

MUI components ship their own `'use client'`. MUI's official App Router setup renders `AppRouterCacheProvider` and
`ThemeProvider` in a **server** `layout.tsx`, so this rule does not report MUI components. 1.x did, and its autofix
turned the root layout into a Client Component, which breaks `export const metadata`.

What does need a client file:

- the hooks `useTheme`, `useMediaQuery`, `useColorScheme` and `useThemeProps`;
- `createTheme`, `extendTheme` and `responsiveFontSizes`. A theme with functions cannot cross the server/client
  boundary, so MUI puts it in its own `'use client'` `theme.ts`. Use `files: 'all'` to check theme files as well.

## Incorrect

```jsx
// app/layout.tsx
import { useMediaQuery } from '@mui/material';
```

## Correct

```jsx
// app/layout.tsx: MUI components are fine in a Server Component
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; // theme.ts starts with 'use client'

export const metadata = { title: 'App' };

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

## Source

- https://mui.com/material-ui/integrations/nextjs/
