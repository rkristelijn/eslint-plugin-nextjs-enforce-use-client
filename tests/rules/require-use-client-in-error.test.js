/**
 * @fileoverview Tests for `require-use-client-in-error`
 * @proves euc-require-use-client-in-error
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/require-use-client-in-error');

const ERROR = '/repo/src/app/dashboard/error.tsx';
const body = 'export default function Error({ reset }) { return <button onClick={() => reset()}>retry</button>; }';

createRuleTester().run('require-use-client-in-error', rule, {
  valid: [
    { code: `'use client';\n${body}`, filename: ERROR },
    { code: `"use client";\n${body}`, filename: '/repo/app/global-error.jsx' },
    // only error / global-error under app/
    { code: body, filename: '/repo/src/components/error.tsx' },
    { code: body, filename: '/repo/app/errors.tsx' },
    { code: '', filename: ERROR },
  ],
  invalid: [
    {
      code: body,
      filename: ERROR,
      output: `'use client';\n\n${body}`,
      errors: [{ messageId: 'missing', data: { file: 'error.tsx' } }],
    },
    {
      code: `// boundary\n${body}`,
      filename: '/repo/app/global-error.tsx',
      output: `// boundary\n'use client';\n\n${body}`,
      errors: [{ messageId: 'missing', data: { file: 'global-error.tsx' } }],
    },
  ],
});
