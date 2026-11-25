/**
 * @fileoverview annotrace gate: the analyser catches every gap class on a
 * fixture repo, and this repo itself passes --strict.
 * @proves ADR-005
 */

'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { analyse, harvest, stripFences } = require('../scripts/trace');

/**
 * Write a file tree under `root`.
 * @param {string} root
 * @param {Record<string, string>} files
 */
function writeTree(root, files) {
  for (const [rel, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  }
}

/** Build a tag at runtime so the fixture text is not harvested from this file itself. */
const tag = (verb) => `@${verb}`;

describe('trace analyser', () => {
  let root;
  before(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'trace-'));
    writeTree(root, {
      'docs/rules/ok.md': '<!-- @id euc-ok -->',
      'docs/rules/untested.md': '<!-- @id euc-untested -->',
      'docs/rules/orphan.md': '<!-- @id euc-orphan -->',
      'docs/adr/adr-001.md': '@id ADR-001\n**Coverage**: none',
      'docs/adr/adr-002.md':
        '@id ADR-002\n@id ADR-002\nExample in code: `@id not-a-declaration` and\n```\n@id also-not\n```',
      'lib/rules/ok.js': `// ${tag('implements')} euc-ok ADR-002`,
      'lib/rules/untested.js': `// ${tag('implements')} euc-untested euc-ghost`,
      'tests/ok.test.js': `// ${tag('proves')} euc-ok euc-orphan euc-missing`,
    });
  });
  after(() => fs.rmSync(root, { recursive: true, force: true }));

  it('finds duplicates, dead links, orphans and untested rules, and ignores code examples', () => {
    const { errors, concepts } = analyse(harvest(root));
    assert.deepEqual(concepts.map((c) => c.id).sort(), ['ADR-001', 'ADR-002', 'euc-ok', 'euc-orphan', 'euc-untested']);
    const kinds = errors.map((e) => e.split(' (')[0].split(' in ')[0]);
    assert.deepEqual(kinds.sort(), [
      `dead link ${tag('implements')} euc-ghost`,
      `dead link ${tag('proves')} euc-missing`,
      'duplicate @id ADR-002',
      'orphan decision euc-orphan',
      'untested rule euc-untested',
    ]);
  });

  it('exempts Coverage: none from the code requirement', () => {
    const { errors } = analyse(harvest(root));
    assert.ok(!errors.some((e) => e.includes('ADR-001')));
  });
});

describe('fenced code blocks (CommonMark)', () => {
  const id = (name) => `${tag('id')} ${name}`;
  it('drops backtick, tilde and longer fences, keeps text after them', () => {
    const md = [
      'before',
      '```js',
      id('a'),
      '```',
      '~~~md',
      id('b'),
      '~~~',
      '````md',
      '```',
      id('c'),
      '```',
      '````',
      '~~~',
      id('d'),
      '```',
      '~~~~',
      'after',
    ].join('\n');
    assert.equal(stripFences(md), 'before\nafter');
  });
  it('does not close a fence on a line with trailing text or a shorter fence', () => {
    assert.equal(stripFences(['````', '``` not a close', '```', id('x')].join('\n')), '');
  });
  it('runs an unclosed fence to the end', () => {
    assert.equal(stripFences(['keep', '~~~', id('y')].join('\n')), 'keep');
  });
});

describe('this repository', () => {
  it('passes trace --strict with zero errors', () => {
    const out = execFileSync(process.execPath, [path.join(__dirname, '../scripts/trace.js'), '--strict', '--json'], {
      encoding: 'utf8',
    });
    const report = JSON.parse(out);
    assert.deepEqual(report.errors, []);
    assert.ok(report.concepts.length >= 12);
  });
});
