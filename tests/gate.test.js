/**
 * @fileoverview The quality gate cannot be silently weakened: every step is
 * wired, nothing swallows failures, CI actions are pinned to commit SHAs.
 * @proves ADR-005.gate
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const pkg = require('../package.json');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('quality gate', () => {
  it('npm run check runs format, lint, coverage and trace --strict', () => {
    for (const step of ['format:check', 'lint', 'coverage', 'trace:strict']) {
      assert.match(pkg.scripts.check, new RegExp(`npm (run )?${step}\\b`), step);
    }
    assert.match(pkg.scripts['trace:strict'], /--strict/);
    // coverage is a gate, not a report: thresholds must stay in the script
    for (const t of ['lines=95', 'branches=90', 'functions=95'])
      assert.ok(pkg.scripts.coverage.includes(`--test-coverage-${t}`), t);
  });

  it('no script or Makefile target swallows failures', () => {
    const sources = [...Object.values(pkg.scripts), read('Makefile')];
    const code = (text) => text.replace(/^\s*#.*$/gm, ''); // comments may explain the rule
    for (const text of sources) assert.doesNotMatch(code(text), /\|\|\s*true|2>\/dev\/null/);
  });

  it('CI runs the check on every supported Node and runs keur', () => {
    const ci = read('.github/workflows/ci.yml');
    assert.match(ci, /run: npm run check/);
    assert.match(ci, /uses: rkristelijn\/keur@/);
    // the keur gate must see files: orphan staging + a non-empty assertion
    assert.match(ci, /git checkout --orphan/);
    // a BLOCK must fail the job through the `| tee` pipe
    assert.match(ci, /set -euo pipefail\n\s+git checkout --orphan/);
    assert.match(ci, /grep -qE 'scanning \[1-9\]/);
    assert.doesNotMatch(ci, /read-tree --empty/);
    for (const node of ['20.19', '22', '24']) assert.ok(ci.includes(`'${node}'`), node);
  });

  it('pins every action to a full commit SHA and declares permissions', () => {
    for (const file of fs.readdirSync(path.join(ROOT, '.github/workflows'))) {
      const text = read(`.github/workflows/${file}`);
      assert.match(text, /^permissions:/m, file);
      for (const [, ref] of text.matchAll(/uses:\s*\S+@(\S+)/g)) assert.match(ref, /^[0-9a-f]{40}$/, `${file}: ${ref}`);
    }
  });

  it('publishes only after the gate, with provenance', () => {
    const publish = read('.github/workflows/publish.yml');
    assert.ok(publish.indexOf('npm run check') < publish.indexOf('npm publish'));
    assert.match(publish, /npm publish --provenance/);
    assert.match(publish, /id-token: write/);
  });
});
