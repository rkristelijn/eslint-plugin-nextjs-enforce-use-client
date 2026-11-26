/**
 * @fileoverview Docs must not drift from the data: every server-only export,
 * every entry file and the statically-read config the rules treat as safe are
 * named where users read them, and claims the rules no longer make are gone.
 * @proves ADR-004 ADR-003.entry-files
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { BUILD_ERROR_EXPORTS, IGNORED_EXPORTS } = require('../lib/data/client-apis');
const { SERVER_ENTRY_NAMES, CLIENT_ENTRY_NAMES } = require('../lib/utils/files');

const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
const DOCS = {
  readme: read('README.md'),
  rule: read('docs/rules/no-metadata-in-client.md'),
  react: read('docs/rules/enforce-use-client-react.md'),
  adr: read('docs/adr/adr-004-safe-autofix.md'),
  changelog: read('CHANGELOG.md'),
};

describe('docs match the data', () => {
  it('name every server-only export where the behaviour is explained', () => {
    for (const name of [...BUILD_ERROR_EXPORTS, ...IGNORED_EXPORTS]) {
      for (const doc of ['readme', 'rule', 'react', 'adr', 'changelog'])
        assert.ok(DOCS[doc].includes(`\`${name}\``), `${doc}: ${name}`);
    }
  });

  it('say that runtime / preferredRegion / maxDuration work in client files', () => {
    for (const doc of ['readme', 'rule', 'react', 'adr']) {
      for (const name of ['runtime', 'preferredRegion', 'maxDuration'])
        assert.ok(DOCS[doc].includes(`\`${name}\``), `${doc}: ${name}`);
    }
  });

  it('do not repeat claims the rules no longer make', () => {
    for (const [doc, text] of Object.entries(DOCS)) {
      assert.ok(!/viewport/i.test(text), `${doc} mentions viewport`);
      assert.ok(
        !/route segment config \(ignored\)|or route segment config\b/.test(text),
        `${doc}: blanket route segment config claim`,
      );
    }
  });

  it('list every App Router entry file in the README', () => {
    for (const name of [...SERVER_ENTRY_NAMES, ...CLIENT_ENTRY_NAMES])
      assert.ok(DOCS.readme.includes(`\`${name}\``), name);
  });
});
