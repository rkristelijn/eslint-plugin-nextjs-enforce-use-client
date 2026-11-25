# ADR-001 — Project initialization with cpm

@id ADR-001 **Status**: superseded by ADR-005 · **Coverage**: none

## Context

The project needed a quality baseline.

## Decision

Use cpm (code project maturity) for format, lint and test hooks.

## Superseded

cpm was succeeded by keur. ADR-005 replaces the cpm setup (`cpm.toml`, `checks/`, a Makefile) with keur hooks, a CI
gate, a coverage threshold and annotrace traceability.
