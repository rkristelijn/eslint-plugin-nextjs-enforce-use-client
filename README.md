# eslint-plugin-nextjs-enforce-use-client

![CI](https://github.com/rkristelijn/eslint-plugin-nextjs-enforce-use-client/actions/workflows/ci.yml/badge.svg)
[![npm version](https://img.shields.io/npm/v/eslint-plugin-nextjs-enforce-use-client)](https://www.npmjs.com/package/eslint-plugin-nextjs-enforce-use-client)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-nextjs-enforce-use-client)](https://www.npmjs.com/package/eslint-plugin-nextjs-enforce-use-client)
![license](https://img.shields.io/badge/license-MIT-green)

ESLint rules for the Next.js App Router server/client boundary: `'use client'` where React, Next.js and MUI client APIs
need it, and never where it breaks the build.

- Checks the files where the boundary is decided: `page`, `layout`, `template`, `loading`, `not-found`, `default`
  (Server Components by default), plus `error` and `global-error` (must be Client Components).
- Follows the React and Next.js rules: `use` and `useId` work on the server, MUI components ship their own directive,
  and a directive only counts as the first statement.
- Autofix only when it is safe. A file that exports `metadata` or route segment config is reported, not rewritten.
- ESLint 9.15+ and 10, flat config, zero runtime dependencies.

## Installation

```sh
npm install --save-dev eslint eslint-plugin-nextjs-enforce-use-client
```

## Usage

```js
// eslint.config.js
import enforceUseClient from 'eslint-plugin-nextjs-enforce-use-client';

export default [{ files: ['**/*.{js,jsx,ts,tsx}'], ...enforceUseClient.configs.recommended }];
```

For `.ts` / `.tsx`, add a TypeScript parser. Spread the preset first so its JSX parser options stay:

```js
import tsParser from '@typescript-eslint/parser';
import enforceUseClient from 'eslint-plugin-nextjs-enforce-use-client';

export default [
  {
    ...enforceUseClient.configs.recommended,
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: { ...enforceUseClient.configs.recommended.languageOptions, parser: tsParser },
  },
];
```

Rules are prefixed with `nextjs-enforce-use-client/`. Registering the plugin under its full name, as in 1.x, works too.

## Rules

🔧 = autofix · ✅ = in `recommended`

| Rule                                                                                           | Description                                                                                      |       |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----- |
| [enforce-use-client-react](docs/rules/enforce-use-client-react.md)                             | React / react-dom / `next/navigation` client hooks and inline event handlers need `'use client'` | ✅ 🔧 |
| [enforce-use-client-mui](docs/rules/enforce-use-client-mui.md)                                 | MUI hooks and `createTheme` need `'use client'` (MUI components do not)                          | ✅ 🔧 |
| [enforce-use-client-react-number-format](docs/rules/enforce-use-client-react-number-format.md) | react-number-format ships no directive                                                           | ✅ 🔧 |
| [require-use-client-in-error](docs/rules/require-use-client-in-error.md)                       | `error` and `global-error` must be Client Components                                             | ✅ 🔧 |
| [no-metadata-in-client](docs/rules/no-metadata-in-client.md)                                   | No `metadata` (build error) or route segment config (ignored) in a `'use client'` file           | ✅    |

The three `enforce-*` rules take `{ files: 'route' | 'all' }`. `'route'` (default) checks only App Router entry files,
because `'use client'` marks a boundary and files imported from a client module are client code already. `'all'` checks
every file.

Upgrading from 1.x? See the [changelog](CHANGELOG.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the decisions in [docs/adr](docs/adr).

## License

[MIT](LICENSE)
