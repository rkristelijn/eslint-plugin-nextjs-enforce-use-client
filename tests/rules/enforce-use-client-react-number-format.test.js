/**
 * @fileoverview Tests for `enforce-use-client-react-number-format`
 * @proves euc-enforce-use-client-react-number-format
 */

'use strict';

const { createRuleTester } = require('../helpers/rule-tester');
const rule = require('../../lib/rules/enforce-use-client-react-number-format');

const PAGE = '/repo/app/invoices/page.tsx';

createRuleTester().run('enforce-use-client-react-number-format', rule, {
  valid: [
    { code: "'use client';\nimport { NumericFormat } from 'react-number-format';", filename: PAGE },
    { code: "import { NumericFormat } from 'react-number-format';", filename: '/repo/src/components/Amount.tsx' },
    { code: "import { numericFormatter } from 'react-number-format';", filename: PAGE },
  ],
  invalid: [
    {
      code: "import { NumericFormat, PatternFormat } from 'react-number-format';",
      filename: PAGE,
      output: "'use client';\n\nimport { NumericFormat, PatternFormat } from 'react-number-format';",
      errors: [{ messageId: 'missingUseClient', data: { api: 'NumericFormat' } }],
    },
  ],
});
