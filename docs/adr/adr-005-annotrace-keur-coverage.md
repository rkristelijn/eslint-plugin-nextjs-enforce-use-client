# ADR-005 — annotrace, keur and a coverage gate

@id ADR-005 **Status**: accepted · **Date**: 2026-11-25 · **Coverage**: code · **Supersedes**: ADR-001

## Context

1.x had tests for one of four rules, no CI on supported Node versions, and no way to tell whether a rule had a doc or a
test. The cpm setup (ADR-001) is retired in favour of keur.

## Decision

The same pattern as eslint-plugin-mui:

- **annotrace:** rule docs declare `@id euc-<rule>`, ADRs declare `@id ADR-NNN` and sub-IDs, code says `@implements`,
  tests say `@proves`. `scripts/trace.js --strict` fails on duplicate IDs, dead links, decisions without code, and rules
  without a proving test.
- **Coverage:** `npm run coverage` runs the test suite with Node's coverage and fails below 95% lines, 90% branches and
  95% functions for `index.js` and `lib/`.
- **keur** runs as a git hook and in CI on the whole tree, and fails the job if it scanned nothing.

### The gate

@id ADR-005.gate

`npm run check` = prettier + eslint + coverage + `trace --strict`. CI runs it on Node 20.19, 22 and 24, with actions
pinned to commit SHAs. Publishing happens only from a GitHub release, after the same check, with npm provenance via
trusted publishing.

## Consequences

- A rule is done when it has a doc with `@id`, an `@implements` header and a `@proves` test, and the coverage thresholds
  still hold. `tests/plugin.test.js` and `tests/gate.test.js` enforce this.
