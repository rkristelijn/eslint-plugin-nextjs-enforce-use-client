const { RuleTester } = require('@typescript-eslint/rule-tester');
const rule = require('../../../lib/rules/enforce-use-client-mui');

const jsxLanguageOptions = {
  ecmaVersion: 2020,
  sourceType: 'module',
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
};

const ruleTester = new RuleTester();

ruleTester.run('enforce-use-client-mui', rule, {
  valid: [
    {
      code: `import { ThemeProvider } from '@mui/material';\n'use client';\nexport default function App() { return <ThemeProvider />; }`,
      languageOptions: jsxLanguageOptions,
    },
    {
      code: `import { useTheme } from '@mui/material/styles';\n'use client';\nfunction useCustomTheme() { return useTheme(); }`,
      languageOptions: jsxLanguageOptions,
    },
    {
      code: `// No MUI imports\nexport default function App() { return <div />; }`,
      languageOptions: jsxLanguageOptions,
    },
    {
      code: `import { somethingElse } from 'other-lib';\nexport default function App() { return <div />; }`,
      languageOptions: jsxLanguageOptions,
    },
  ],
  invalid: [
    {
      code: `import { ThemeProvider } from '@mui/material';\nexport default function App() { return <ThemeProvider />; }`,
      errors: [{ messageId: 'enforceUseClient' }],
      output: `'use client';\n\nimport { ThemeProvider } from '@mui/material';\nexport default function App() { return <ThemeProvider />; }`,
      languageOptions: jsxLanguageOptions,
    },
    {
      code: `import { useTheme } from '@mui/material/styles';\nfunction useCustomTheme() { return useTheme(); }`,
      errors: [{ messageId: 'enforceUseClient' }],
      output: `'use client';\n\nimport { useTheme } from '@mui/material/styles';\nfunction useCustomTheme() { return useTheme(); }`,
      languageOptions: jsxLanguageOptions,
    },
    {
      code: `import { useMediaQuery } from '@mui/material';\nfunction useQuery() { return useMediaQuery(); }`,
      errors: [{ messageId: 'enforceUseClient' }],
      output: `'use client';\n\nimport { useMediaQuery } from '@mui/material';\nfunction useQuery() { return useMediaQuery(); }`,
      languageOptions: jsxLanguageOptions,
    },
    {
      code: `import { useColorScheme } from '@mui/material/styles';\nfunction useScheme() { return useColorScheme(); }`,
      errors: [{ messageId: 'enforceUseClient' }],
      output: `'use client';\n\nimport { useColorScheme } from '@mui/material/styles';\nfunction useScheme() { return useColorScheme(); }`,
      languageOptions: jsxLanguageOptions,
    },
  ],
}); 