# Thin aliases for the npm scripts; failures propagate (no `|| true`).
# @implements ADR-005.gate
.PHONY: install test lint format trace check

install:
	npm ci

test:
	npm test

lint:
	npm run lint

format:
	npm run format

trace:
	npm run trace:strict

check:
	npm run check
	keur check --tier pre-push
