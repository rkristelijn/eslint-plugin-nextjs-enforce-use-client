/**
 * @fileoverview Tests for `enforce-use-client-react`
 * @proves euc-enforce-use-client-react ADR-003.entry-files ADR-003.directive-prologue ADR-003.usage ADR-004
 */

'use strict';

const { createRuleTester, tsx } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/enforce-use-client-react');

const PAGE = '/repo/src/app/dashboard/page.tsx';
const LAYOUT = '/repo/app/layout.jsx';
const err = (api, messageId = 'missingUseClient') => ({ messageId, data: { api } });
const fixed = (code) => `'use client';\n\n${code}`;

createRuleTester().run('enforce-use-client-react', rule, {
  valid: [
    // has the directive (comments may precede it)
    { code: "'use client';\nimport { useState } from 'react';", filename: PAGE },
    { code: '// header\n"use client";\nimport { useEffect } from \'react\';', filename: PAGE },
    // use and useId work in Server Components
    { code: "import { use, useId, Suspense, cache } from 'react';", filename: PAGE },
    // not an App Router entry file: a custom hook / component file is not a boundary by default
    { code: "import { useState } from 'react';", filename: '/repo/src/hooks/useCounter.ts' },
    { code: "import { useState } from 'react';", filename: '/repo/src/app/dashboard/Counter.tsx' },
    // Pages Router has no Server Components
    { code: "import { useState } from 'react';", filename: '/repo/pages/index.tsx' },
    // a Server Functions file is never told to become a client file
    { code: "'use server';\nimport { useState } from 'react';", filename: PAGE },
    // type-only imports do not run
    {
      code: "import type { Dispatch } from 'react';\nimport { type SetStateAction } from 'react';",
      filename: PAGE,
      languageOptions: tsx,
    },
    // server-safe next/navigation APIs
    { code: "import { redirect, notFound } from 'next/navigation';", filename: PAGE },
    // event handler that is a Server Function, or passed by reference
    {
      code: "export default () => <form><button onClick={async () => { 'use server'; await save(); }} /></form>;",
      filename: LAYOUT,
    },
    { code: 'import { save } from "./actions";\nexport default () => <button onClick={save} />;', filename: LAYOUT },
    // not on* attribute
    { code: 'export default () => <Item render={() => null} />;', filename: LAYOUT },
    // other module's member access is not React
    { code: 'import * as utils from "./utils";\nutils.useState();', filename: PAGE },
    { code: 'import React from "react";\nReact["useState"]();\nconst x = obj.useState;', filename: PAGE },
    // empty file
    { code: '', filename: PAGE },
  ],
  invalid: [
    {
      name: 'named hook import in a page',
      code: "import { useState } from 'react';\nexport default function Page() { const [n] = useState(0); return n; }",
      filename: PAGE,
      output: fixed(
        "import { useState } from 'react';\nexport default function Page() { const [n] = useState(0); return n; }",
      ),
      errors: [err('useState')],
    },
    {
      name: 'hooks the 1.x list missed',
      code: "import { useCallback, useLayoutEffect, useOptimistic } from 'react';",
      filename: PAGE,
      output: fixed("import { useCallback, useLayoutEffect, useOptimistic } from 'react';"),
      errors: [err('useCallback')],
    },
    {
      name: 'next/navigation client hook in a layout',
      code: "import { usePathname } from 'next/navigation';",
      filename: LAYOUT,
      output: fixed("import { usePathname } from 'next/navigation';"),
      errors: [err('usePathname')],
    },
    {
      name: 'react-dom useFormStatus',
      code: "import { useFormStatus } from 'react-dom';",
      filename: '/repo/app/(shop)/checkout/loading.js',
      output: fixed("import { useFormStatus } from 'react-dom';"),
      errors: [err('useFormStatus')],
    },
    {
      name: 'namespace and default member calls',
      code: "import * as React from 'react';\nReact.useEffect(() => {});",
      filename: PAGE,
      output: fixed("import * as React from 'react';\nReact.useEffect(() => {});"),
      errors: [err('React.useEffect')],
    },
    {
      code: "import R from 'react';\nconst [a] = R.useState(1);",
      filename: PAGE,
      output: fixed("import R from 'react';\nconst [a] = R.useState(1);"),
      errors: [err('R.useState')],
    },
    {
      name: 'a directive after an import is not a directive',
      code: "import { useState } from 'react';\n'use client';",
      filename: PAGE,
      output: fixed("import { useState } from 'react';\n'use client';"),
      errors: [err('useState')],
    },
    {
      name: 'inline event handler in a Server Component',
      code: 'export default function Layout() { return <button onClick={() => alert(1)}>x</button>; }',
      filename: LAYOUT,
      output: fixed('export default function Layout() { return <button onClick={() => alert(1)}>x</button>; }'),
      errors: [err('onClick', 'eventHandler')],
    },
    {
      name: 'one report per file, the first usage',
      code: "import { useRef } from 'react';\nimport { useRouter } from 'next/navigation';\nconst f = () => <a onClick={function () {}} />;",
      filename: PAGE,
      output: fixed(
        "import { useRef } from 'react';\nimport { useRouter } from 'next/navigation';\nconst f = () => <a onClick={function () {}} />;",
      ),
      errors: [err('useRef')],
    },
    {
      name: 'leading comment stays above the directive',
      code: "/** Dashboard */\nimport { useState } from 'react';",
      filename: PAGE,
      output: "/** Dashboard */\n'use client';\n\nimport { useState } from 'react';",
      errors: [err('useState')],
    },
    {
      name: "files: 'all' checks any file",
      code: "import { useState } from 'react';",
      filename: '/repo/src/components/Counter.tsx',
      options: [{ files: 'all' }],
      output: fixed("import { useState } from 'react';"),
      errors: [err('useState')],
    },
    {
      name: 'metadata export blocks the autofix (ADR-004)',
      code: "import { useState } from 'react';\nexport const metadata = { title: 'x' };",
      filename: LAYOUT,
      output: null,
      errors: [{ messageId: 'cannotAddUseClient', data: { api: 'useState', exports: 'metadata' } }],
    },
    {
      name: 'route segment config blocks the autofix (1.x skipped these silently)',
      code: "import { usePathname } from 'next/navigation';\nexport const runtime = 'edge';\nexport async function generateMetadata() { return {}; }",
      filename: PAGE,
      output: null,
      errors: [
        { messageId: 'cannotAddUseClient', data: { api: 'usePathname', exports: "runtime', 'generateMetadata" } },
      ],
    },
    {
      name: 'string-literal import name',
      code: "import { 'useState' as useS } from 'react';",
      filename: PAGE,
      output: fixed("import { 'useState' as useS } from 'react';"),
      errors: [err('useState')],
    },
  ],
});
