# Contributing

## Prerequisites

- Node.js `^20.19 || ^22.13 || >=24`
- [keur](https://github.com/rkristelijn/keur) as the git hook gate (`keur hook --install`)

## Build

No build step; `index.js` and `lib/` are published as is. Run `npm ci`.

## Test

```sh
npm test            # node:test + ESLint RuleTester
npm run coverage    # tests with coverage thresholds (95% lines, 90% branches, 95% functions)
npm run check       # format + lint + coverage + trace --strict (what CI runs)
```

To try a local build in a project: `npm link` here, then `npm link eslint-plugin-nextjs-enforce-use-client` there.

## Code style

- Prettier and ESLint (`eslint.config.js`, including `eslint-plugin-eslint-plugin`).
- **Data over code:** which APIs need a client is data in `lib/data/client-apis.js`, each entry with its source.
- **Autofix only when safe (ADR-004).** If the directive could break the build, report and explain instead.

### Adding a rule

1. `lib/rules/<name>.js` with `@implements euc-<name>`; for "client API in a server file", use
   `lib/utils/client-api-rule.js`.
2. Register it in `index.js`.
3. `docs/rules/<name>.md` declaring `<!-- @id euc-<name> -->`, and a row in the README table.
4. `tests/rules/<name>.test.js` with `@proves euc-<name>`: valid, invalid with `output`, and the cases where the rule
   must stay quiet.
5. `npm run check`. `tests/plugin.test.js` fails if a step is missing.

## Traceability

annotrace (ADR-005): concepts are declared with `@id`, code says `@implements`, and tests say `@proves`. Link to IDs,
never to `file:line`. `npm run trace:strict` is part of the gate.

## Commits and pull requests

Conventional Commits; one concern per PR; CI must be green. Never bypass hooks (`--no-verify`).

## Architecture decisions

See [`docs/adr/`](docs/adr).
