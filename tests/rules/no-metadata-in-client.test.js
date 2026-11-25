/**
 * @fileoverview Tests for `no-metadata-in-client`
 * @proves euc-no-metadata-in-client
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/no-metadata-in-client');

const meta = (name) => ({ messageId: 'metadata', data: { name } });
const seg = (name) => ({ messageId: 'segmentConfig', data: { name } });

createRuleTester().run('no-metadata-in-client', rule, {
  valid: [
    "export const metadata = { title: 'x' };\nexport const runtime = 'edge';",
    "'use client';\nexport const title = 'x';\nexport default function Page() {}",
    "'use client';\nexport { Button } from './Button';",
    // not the prologue: the string after code is not a directive
    "export const metadata = {};\n'use client';",
  ],
  invalid: [
    {
      name: 'force-dynamic in a client page is ignored (seen in a real app: the route built as static)',
      code: "'use client';\nexport const dynamic = 'force-dynamic';\nexport default function Page() {}",
      errors: [seg('dynamic')],
    },
    { code: "'use client';\nexport const metadata = { title: 'x' };", errors: [meta('metadata')] },
    {
      code: "'use client';\nexport async function generateMetadata() { return {}; }",
      errors: [meta('generateMetadata')],
    },
    {
      code: "'use client';\nexport const revalidate = 60, dynamic = 'force-static';\nconst viewport = {};\nexport { viewport };",
      errors: [seg('revalidate'), seg('dynamic'), meta('viewport')],
    },
    { code: "'use client';\nconst v = {};\nexport { v as 'generateViewport' };", errors: [meta('generateViewport')] },
  ],
});
