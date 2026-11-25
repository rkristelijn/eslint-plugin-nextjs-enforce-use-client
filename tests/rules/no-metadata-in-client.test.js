/**
 * @fileoverview Tests for `no-metadata-in-client`
 * @proves euc-no-metadata-in-client
 */

'use strict';

const { createRuleTester, tsx } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/no-metadata-in-client');

const PAGE = '/repo/app/dashboard/page.tsx';
const LAYOUT = '/repo/src/app/layout.jsx';
const build = (name, file = 'page') => ({ messageId: 'buildError', data: { name, file } });
const ignored = (name, file = 'page') => ({ messageId: 'ignored', data: { name, file } });

createRuleTester().run('no-metadata-in-client', rule, {
  valid: [
    // a re-export from another module has no local binding here
    { code: "'use client';\nexport { title as default } from './meta';", filename: PAGE },
    // Server Components may export all of these
    { code: "export const metadata = { title: 'x' };\nexport const dynamic = 'force-dynamic';", filename: PAGE },
    { code: "'use client';\nexport const title = 'x';\nexport default function Page() {}", filename: PAGE },
    // runtime / preferredRegion / maxDuration are read statically and work in a client page
    { code: "'use client';\nexport const runtime = 'edge';\nexport const maxDuration = 30;", filename: PAGE },
    // not verified to be ignored, so not reported
    { code: "'use client';\nexport const revalidate = 60;", filename: PAGE },
    // Next.js only checks page and layout files: other client modules may export these names
    { code: "'use client';\nexport const metadata = { owner: 'team' };", filename: '/repo/src/components/Widget.jsx' },
    { code: "'use client';\nexport const metadata = {};", filename: '/repo/app/dashboard/Widget.tsx' },
    // type-only exports are erased
    { code: "'use client';\nexport type { Metadata as metadata } from 'next';", filename: PAGE, languageOptions: tsx },
    {
      code: "'use client';\nexport { type Metadata as generateMetadata } from 'next';",
      filename: PAGE,
      languageOptions: tsx,
    },
    // not the prologue: the string after code is not a directive
    { code: "export const metadata = {};\n'use client';", filename: PAGE },
  ],
  invalid: [
    {
      name: 'Next.js checks the original name: export { metadata as default }',
      code: "'use client';\nconst metadata = () => null;\nexport { metadata as default };",
      filename: PAGE,
      errors: [build('metadata')],
    },
    { code: "'use client';\nexport const metadata = { title: 'x' };", filename: PAGE, errors: [build('metadata')] },
    {
      code: "'use client';\nexport async function generateMetadata() { return {}; }",
      filename: LAYOUT,
      errors: [build('generateMetadata', 'layout')],
    },
    {
      name: "generateStaticParams with 'use client' is rejected by Next.js",
      code: "'use client';\nexport function generateStaticParams() { return []; }",
      filename: PAGE,
      errors: [build('generateStaticParams')],
    },
    {
      name: 'force-dynamic in a client page is ignored (the route built as static)',
      code: "'use client';\nexport const dynamic = 'force-dynamic';\nexport default function Page() {}",
      filename: PAGE,
      errors: [ignored('dynamic')],
    },
    {
      name: 'destructured and renamed exports',
      code: "'use client';\nexport const { metadata } = { metadata: {} };\nconst d = 'force-dynamic';\nexport { d as dynamic };\nconst g = () => [];\nexport { g as 'generateStaticParams' };",
      filename: PAGE,
      errors: [build('metadata'), ignored('dynamic'), build('generateStaticParams')],
    },
  ],
});
