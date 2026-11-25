# Security policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 2.x     | yes       |
| 1.x     | no        |

## Scope

In scope: vulnerabilities in the plugin itself, for example a rule or autofix that executes or injects code, a ReDoS in
a rule, or a compromised release artifact.

Out of scope: findings the rules emit about _your_ code (open a normal issue if a rule is wrong), and vulnerabilities in
ESLint or MUI (report those upstream).

## Reporting a vulnerability

Please do **not** open a public issue. Report it privately through
[GitHub security advisories](https://github.com/rkristelijn/eslint-plugin-nextjs-enforce-use-client/security/advisories/new).
You get an answer within 7 days.

This package has no runtime dependencies. It is published from CI with npm provenance, so you can verify that a release
was built from this repository (`npm audit signatures`).
