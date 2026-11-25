/**
 * @fileoverview Tests for `enforce-use-client-mui`
 * @proves euc-enforce-use-client-mui
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/enforce-use-client-mui');

const LAYOUT = '/repo/src/app/layout.tsx';
const err = (api) => ({ messageId: 'missingUseClient', data: { api } });

createRuleTester().run('enforce-use-client-mui', rule, {
  valid: [
    // a path import that is a component, not a hook
    { code: "import Button from '@mui/material/Button';", filename: LAYOUT },
    // MUI's own App Router setup: components in a server layout are fine (they ship 'use client')
    {
      code: "import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';\nimport { ThemeProvider } from '@mui/material/styles';\nimport { CssBaseline, Box } from '@mui/material';\nimport theme from './theme';\nexport const metadata = { title: 'x' };\nexport default ({ children }) => <AppRouterCacheProvider><ThemeProvider theme={theme}><CssBaseline />{children}</ThemeProvider></AppRouterCacheProvider>;",
      filename: LAYOUT,
    },
    { code: "'use client';\nimport { useTheme } from '@mui/material/styles';", filename: LAYOUT },
    // not an entry file (a theme.ts with createTheme is checked with files: 'all')
    { code: "import { createTheme } from '@mui/material/styles';", filename: '/repo/src/theme.ts' },
    { code: "import { useMediaQuery } from 'other-lib';", filename: LAYOUT },
  ],
  invalid: [
    {
      name: 'the named spelling of a default import: { default as useMediaQuery }',
      code: "import { default as useMediaQuery } from '@mui/material/useMediaQuery';",
      filename: LAYOUT,
      output: "'use client';\n\nimport { default as useMediaQuery } from '@mui/material/useMediaQuery';",
      errors: [err('useMediaQuery')],
    },
    {
      name: 'a metadata export in loading.jsx does not block the fix (Next.js only checks page and layout)',
      code: "import { useTheme } from '@mui/material/styles';\nexport const metadata = { owner: 'team' };",
      filename: '/repo/app/loading.jsx',
      output:
        "'use client';\n\nimport { useTheme } from '@mui/material/styles';\nexport const metadata = { owner: 'team' };",
      errors: [err('useTheme')],
    },
    {
      name: 'default import of an MUI hook by path, called directly',
      code: "import useMediaQuery from '@mui/material/useMediaQuery';\nexport default () => useMediaQuery('(min-width:600px)');",
      filename: LAYOUT,
      output:
        "'use client';\n\nimport useMediaQuery from '@mui/material/useMediaQuery';\nexport default () => useMediaQuery('(min-width:600px)');",
      errors: [err('useMediaQuery')],
    },
    {
      code: "import useTheme from '@mui/material/styles/useTheme';",
      filename: LAYOUT,
      output: "'use client';\n\nimport useTheme from '@mui/material/styles/useTheme';",
      errors: [err('useTheme')],
    },
    {
      code: "import { useTheme } from '@mui/material/styles';",
      filename: LAYOUT,
      output: "'use client';\n\nimport { useTheme } from '@mui/material/styles';",
      errors: [err('useTheme')],
    },
    {
      code: "import { useMediaQuery, useColorScheme } from '@mui/material';",
      filename: '/repo/app/page.jsx',
      output: "'use client';\n\nimport { useMediaQuery, useColorScheme } from '@mui/material';",
      errors: [err('useMediaQuery')],
    },
    {
      name: 'createTheme in a theme file (files: all): a theme with functions cannot cross the boundary',
      code: "import { createTheme } from '@mui/material/styles';\nexport default createTheme({});",
      filename: '/repo/src/theme.ts',
      options: [{ files: 'all' }],
      output: "'use client';\n\nimport { createTheme } from '@mui/material/styles';\nexport default createTheme({});",
      errors: [err('createTheme')],
    },
    {
      code: "import { useTheme } from '@mui/system';",
      filename: LAYOUT,
      output: "'use client';\n\nimport { useTheme } from '@mui/system';",
      errors: [err('useTheme')],
    },
  ],
});
