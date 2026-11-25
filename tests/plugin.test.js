/**
 * @fileoverview Plugin shape, recommended config on real ESLint 10, and
 * registry completeness (every rule has a doc, a code tag and a proving test).
 * @proves ADR-002 ADR-003
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Linter } = require('eslint');
const plugin = require('..');
const pkg = require('../package.json');

const ROOT = path.resolve(__dirname, '..');
const ruleFiles = fs.readdirSync(path.join(ROOT, 'lib/rules')).map((f) => f.replace(/\.js$/, ''));
const NS = 'nextjs-enforce-use-client';

describe('plugin object', () => {
  it('exposes meta from package.json', () => {
    assert.deepEqual(plugin.meta, { name: pkg.name, version: pkg.version, namespace: NS });
  });
  it('registers exactly the files in lib/rules', () => {
    assert.deepEqual(Object.keys(plugin.rules).sort(), ruleFiles.sort());
  });
  it('gives every rule a docs URL, a description and messages', () => {
    for (const [name, rule] of Object.entries(plugin.rules)) {
      assert.equal(
        rule.meta.docs.url,
        `https://github.com/rkristelijn/eslint-plugin-nextjs-enforce-use-client/blob/main/docs/rules/${name}.md`,
      );
      assert.ok(rule.meta.docs.description && Object.keys(rule.meta.messages).length > 0, name);
    }
  });
  it('recommended enables every non-deprecated rule as error', () => {
    const live = ruleFiles.filter((n) => !plugin.rules[n].meta.deprecated).map((n) => `${NS}/${n}`);
    assert.deepEqual(Object.keys(plugin.configs.recommended.rules).sort(), live.sort());
  });
});

describe('recommended config on ESLint', () => {
  const lint = (code, filename) =>
    new Linter().verifyAndFix(code, [{ files: ['**/*.{js,jsx}'], ...plugin.configs.recommended }], { filename });

  it("adds 'use client' to a page that uses usePathname", () => {
    const { output, messages } = lint(
      "import { usePathname } from 'next/navigation';\nexport default () => usePathname();\n",
      'app/page.jsx',
    );
    assert.equal(output.split('\n')[0], "'use client';");
    assert.deepEqual(messages, []);
  });

  it("leaves MUI's own server layout alone (the 1.x false positive)", () => {
    const code =
      "import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';\nimport { ThemeProvider } from '@mui/material/styles';\nexport const metadata = { title: 'x' };\nexport default ({ children }) => <AppRouterCacheProvider><ThemeProvider theme={{}}>{children}</ThemeProvider></AppRouterCacheProvider>;\n";
    const { output, messages } = lint(code, 'app/layout.jsx');
    assert.equal(output, code);
    assert.deepEqual(messages, []);
  });

  it('error.jsx gets the directive; a client layout with metadata is reported', () => {
    assert.equal(
      lint('export default function E() { return null; }\n', 'app/error.jsx').output.split('\n')[0],
      "'use client';",
    );
    const { messages } = lint("'use client';\nexport const metadata = {};\n", 'app/layout.jsx');
    assert.deepEqual(
      messages.map((m) => m.ruleId),
      [`${NS}/no-metadata-in-client`],
    );
  });
});

describe('registry completeness (annotrace)', () => {
  for (const name of ruleFiles) {
    it(`${name}: @implements, doc with @id, test with @proves, README link`, () => {
      const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
      assert.match(read(`lib/rules/${name}.js`), new RegExp(`@implements[^\\n]*\\beuc-${name}\\b`));
      assert.match(read(`docs/rules/${name}.md`), new RegExp(`@id euc-${name}\\b`));
      assert.match(read(`tests/rules/${name}.test.js`), new RegExp(`@proves[^\\n]*\\beuc-${name}\\b`));
      assert.ok(read('README.md').includes(`docs/rules/${name}.md`), 'README');
    });
  }
});
