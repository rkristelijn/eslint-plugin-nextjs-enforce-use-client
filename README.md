# ESLint Plugin for Next.js to Enforce Use Client

This ESLint plugin enforces the inclusion of `'use client';` for whenever there are things used that need it.

The rule helps to:

- Warn or error when the declaration is missing.
- Automatically fix the issue (if configured to run with --fix).

## Installation

Install the plugin via npm:

`npm install -D eslint-plugin-nextjs-enforce-use-client`

## Usage

### Configuration for .cjs

1. Import the plugin in your eslint.config.cjs file:

```js
const enforceUseClient = require('eslint-plugin-nextjs-enforce-use-client');
```

2. Add the configuration to your ESLint rules:

```js
module.exports = [
  // Other rules or base configurations...

  // Enforce "'use client';" in files that use react stuff and need use client
  {
    files: ['src/app/**/*.ts', 'src/app/**/*.tsx'],
    ignores: ['src/app/**/*.test.ts', 'src/app/**/*.test.tsx'],
    plugins: {
      'eslint-plugin-nextjs-enforce-use-client': enforceUseClient,
    },
    rules: {
      'nextjs-enforce-use-client/enforce-use-client': 'error',
    },
  },

  // Other rules...
];
```

### Configuration for .mjs

If you’re using an .mjs setup for your ESLint configuration:

1. Import the plugin dynamically:

```ts
import enforceUseClient from 'eslint-plugin-nextjs-enforce-use-client';
```

2. Add the configuration to your ESLint rules:

```ts
  // .eslintrc.js or .eslintrc.cjs
const enforceUseClient = require('eslint-plugin-nextjs-enforce-use-client');

 module.exports = [
   {
     files: ['**/*.tsx', '**/*.jsx'], // remove the backspace, it is only here to let jsDoc work
     ignores: ['**/*.test.ts', '**/*.test.tsx'], // remove the backspace, it is only here to let jsDoc work
     plugins: { 'eslint-plugin-nextjs-enforce-use-client': enforceUseClient },
     rules: {
      'eslint-plugin-nextjs-enforce-use-client/enforce-use-client-react': 'error',
      'eslint-plugin-nextjs-enforce-use-client/enforce-use-client-mui': 'error',
      'eslint-plugin-nextjs-enforce-use-client/enforce-use-client-react-number-format': 'error',
      'eslint-plugin-nextjs-enforce-use-client/no-flupke': 'error',
      },
    },
  ],
```

or use the mjs version:

```ts
// .eslintrc.mjs
import enforceUseClient from 'eslint-plugin-nextjs-enforce-use-client';

export default [
  {
    files: ['**/*.tsx', '**/*.jsx'],
    ignores: ['**/*.test.ts', '**/*.test.tsx'],
    plugins: { 'eslint-plugin-nextjs-enforce-use-client': enforceUseClient },
    rules: {
      'eslint-plugin-nextjs-enforce-use-client/enforce-use-client-react': 'error',
      'eslint-plugin-nextjs-enforce-use-client/enforce-use-client-mui': 'error',
      'eslint-plugin-nextjs-enforce-use-client/enforce-use-client-react-number-format': 'error',
      'eslint-plugin-nextjs-enforce-use-client/no-flupke': 'error',
    },
  },
];
```

## Running ESLint

After configuring ESLint with the plugin, run the linter as usual:

`npx eslint . --fix`

## Auto-Fix Behavior

When used with the --fix flag, the plugin automatically adds:

`export const runtime = 'edge';`

at the appropriate location in the file if it’s missing.

Rule Details

- Rule name: nextjs-enforce-use-client/enforce-use-client
- Fixable: Yes, it can automatically add the missing export.

## Contribution

If you’d like to contribute or report issues, feel free to open an issue or PR on the GitHub repository. Contributions are welcome! See the [dev docs](./docs/README.md)
