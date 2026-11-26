#!/usr/bin/env bash
# Smoke test of the published artifact (ADR-005.gate): pack the package, install it
# in a clean project on each supported ESLint major, and lint a fixture app with
# `recommended`. This is the "build" check: it proves the tarball loads and works
# outside this repo (exports field, files field, no dev dependency leaks).
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd -P)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

tarball="$(cd "$root" && npm pack --silent --pack-destination "$work")"

for eslint in 9.15.0 10.15.0; do
  app="$work/app-$eslint"
  mkdir -p "$app/app/dashboard"
  (cd "$app" && npm init -y >/dev/null && npm install --silent --no-audit --no-fund -D "eslint@$eslint" "$work/$tarball" >/dev/null)

  cat > "$app/eslint.config.mjs" <<'CFG'
import plugin from 'eslint-plugin-nextjs-enforce-use-client';
export default [{ files: ['**/*.{js,jsx}'], ...plugin.configs.recommended }];
CFG
  # needs 'use client' (autofixable)
  printf "import { usePathname } from 'next/navigation';\nexport default () => usePathname();\n" > "$app/app/dashboard/page.jsx"
  # MUI server layout with metadata: must stay untouched
  printf "import { ThemeProvider } from '@mui/material/styles';\nexport const metadata = { title: 'x' };\nexport default ({ children }) => <ThemeProvider theme={{}}>{children}</ThemeProvider>;\n" > "$app/app/layout.jsx"
  # error boundary without the directive (autofixable)
  printf "export default function Error() { return null; }\n" > "$app/app/error.jsx"
  cp "$app/app/layout.jsx" "$work/layout.before"

  (cd "$app" && npx eslint --fix app)

  head -1 "$app/app/dashboard/page.jsx" | grep -qx "'use client';" || { echo "smoke: page.jsx was not fixed (eslint $eslint)"; exit 1; }
  head -1 "$app/app/error.jsx" | grep -qx "'use client';" || { echo "smoke: error.jsx was not fixed (eslint $eslint)"; exit 1; }
  cmp -s "$work/layout.before" "$app/app/layout.jsx" || { echo "smoke: the MUI server layout was changed (eslint $eslint)"; exit 1; }
  echo "smoke: eslint $eslint ok"
done
