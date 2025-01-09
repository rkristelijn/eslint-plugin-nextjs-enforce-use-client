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
1.	Import the plugin in your eslint.config.cjs file:

```js
const enforceRuntimeEdgeRule = require('eslint-plugin-nextjs-enforce-runtime-edge');
```


2.	Add the configuration to your ESLint rules:
```js
module.exports = [
  // Other rules or base configurations...

  // Enforce "runtime = 'edge';" in src/app files
  {
    files: ['src/app/**/*.ts', 'src/app/**/*.tsx'],
    ignores: ['src/app/**/*.test.ts', 'src/app/**/*.test.tsx'],
    plugins: {
      'eslint-plugin-nextjs-enforce-runtime-edge': enforceRuntimeEdgeRule,
    },
    rules: {
      'nextjs-enforce-runtime-edge/enforce-runtime-edge': 'error',
    },
  },

  // Other rules...
];
```


### Configuration for .mjs

If you’re using an .mjs setup for your ESLint configuration:
1.	Import the plugin dynamically:

```ts
import enforceRuntimeEdgeRule from 'eslint-plugin-nextjs-enforce-runtime-edge';
```

2.	Add the configuration to your ESLint rules:

```ts
export default [
  // Other rules or base configurations...

  // Enforce "runtime = 'edge';" in src/app files
  {
    files: ['src/app/**/*.ts', 'src/app/**/*.tsx'],
    ignores: ['src/app/**/*.test.ts', 'src/app/**/*.test.tsx'],
    plugins: {
      'eslint-plugin-nextjs-enforce-runtime-edge': enforceRuntimeEdgeRule,
    },
    rules: {
      'nextjs-enforce-runtime-edge/enforce-runtime-edge': 'error',
    },
  },

  // Other rules...
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
- Rule name: nextjs-enforce-runtime-edge/enforce-runtime-edge
- Fixable: Yes, it can automatically add the missing export.

## Contribution

If you’d like to contribute or report issues, feel free to open an issue or PR on the GitHub repository. Contributions are welcome! See the [dev docs](./docs/README.md)
