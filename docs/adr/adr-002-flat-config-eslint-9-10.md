# ADR-002 — Flat config plugin for ESLint 9 and 10, zero runtime dependencies

@id ADR-002 **Status**: accepted · **Date**: 2026-11-25 · **Coverage**: code

## Context

1.x exported only `rules` and called `context.getSourceCode()`, which ESLint 10 removed: every rule crashed on ESLint 10
with `TypeError: context.getSourceCode is not a function`. There was no `recommended` config, so every user wired the
rules by hand, and the README showed a rule name that does not exist.

## Decision

- The plugin object has `meta` (`name`, `version`, `namespace: nextjs-enforce-use-client`), an explicit `rules` registry
  and a flat `recommended` config that enables every non-deprecated rule.
- Rules use only APIs that exist in ESLint 9.15+ and 10 (`context.sourceCode`, `context.filename`,
  `meta.defaultOptions`). The peer range is `^9.15.0 || ^10.0.0`, and CI tests ESLint 10.
- No runtime dependencies. Tests use `node:test` with ESLint's own `RuleTester`. 1.x needed jest, esbuild-jest and two
  third-party rule testers, which brought 24 vulnerable dev dependencies.

## Consequences

- 2.0.0 is a major release (ADR-003 also changes which files are checked).
- Existing rule names stay, so 1.x configs keep loading.
