/**
 * @fileoverview Unit tests for the shared helpers (file classification,
 * directives, server-only exports).
 * @proves ADR-003.entry-files ADR-003.directive-prologue ADR-004
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { Linter } = require('eslint');
const { appRouterBasename, isClientEntryFile, isServerEntryFile } = require('../lib/utils/files');
const { getDirectives } = require('../lib/utils/directives');
const { exportedNames, serverOnlyExports } = require('../lib/utils/server-file');

/** Parse with ESLint's default parser and return the Program. */
function parse(code) {
  let program = null;
  new Linter().verify(code, {
    languageOptions: { sourceType: 'module' },
    plugins: {
      t: {
        rules: {
          p: {
            create: () => ({
              Program: (n) => {
                program = n;
              },
            }),
          },
        },
      },
    },
    rules: { 't/p': 'error' },
  });
  return program;
}

describe('App Router files', () => {
  it('classifies entry files under any app/ directory', () => {
    for (const f of [
      '/r/app/page.tsx',
      'app/x/layout.js',
      '/r/src/app/(g)/[id]/loading.jsx',
      'C:\\r\\app\\not-found.mjs'.replace(/\\/g, '/'),
    ]) {
      assert.ok(isServerEntryFile(f), f);
    }
    assert.ok(isClientEntryFile('/r/app/global-error.tsx'));
  });
  it('ignores other files, extensions and directories', () => {
    for (const f of [
      '/r/pages/page.tsx',
      '/r/app/page.css',
      '/r/application/page.tsx',
      '/r/app/Page.tsx',
      '/r/app/page.test.tsx',
    ]) {
      assert.ok(!isServerEntryFile(f), f);
    }
    assert.equal(appRouterBasename('/r/lib/x.ts'), null);
  });
});

describe('directive prologue', () => {
  it('reads only leading directives', () => {
    assert.deepEqual(getDirectives(parse("// c\n'use client';\n'use strict';\nimport x from 'y';\n'use server';")), [
      'use client',
      'use strict',
    ]);
    assert.deepEqual(getDirectives(parse("import x from 'y';\n'use client';")), []);
  });
});

describe('server-only exports', () => {
  it('finds variable, function, class, specifier and destructured exports', () => {
    const p = parse(
      "export const metadata = {}, a = 1;\nexport function generateMetadata() {}\nexport class C {}\nconst r = 1;\nexport { r as dynamic, r as 'runtime' };\nexport default 1;\nexport * from 'x';\nexport const { d, e: f, ...g } = {};\nexport const [h, , [i], j = 1, ...k] = [];",
    );
    assert.deepEqual([...exportedNames(p)].sort(), [
      'C',
      'a',
      'd',
      'dynamic',
      'f',
      'g',
      'generateMetadata',
      'h',
      'i',
      'j',
      'k',
      'metadata',
      'r',
      'runtime',
    ]);
    // `r` is the original name of `r as dynamic`: Next.js validates original names too
    // runtime works in a client file, so it is not a blocker
    assert.deepEqual(serverOnlyExports(p).sort(), ['dynamic', 'generateMetadata', 'metadata']);
    // only page and layout files are validated by Next.js
    assert.deepEqual(serverOnlyExports(p, 'app/loading.jsx'), []);
    assert.deepEqual(serverOnlyExports(p, 'app/x/page.tsx').sort(), ['dynamic', 'generateMetadata', 'metadata']);
  });
});
