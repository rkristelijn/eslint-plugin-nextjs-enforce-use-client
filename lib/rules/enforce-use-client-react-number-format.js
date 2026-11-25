/**
 * @fileoverview react-number-format ships no 'use client', so a Server
 * Component that renders it needs the directive (or a client wrapper).
 * @implements euc-enforce-use-client-react-number-format
 */

'use strict';

const { clientApiRule } = require('../utils/client-api-rule');

const COMPONENTS = new Set([
  'NumericFormat',
  'PatternFormat',
  'NumberFormatBase',
  'useNumericFormat',
  'usePatternFormat',
]);

module.exports = clientApiRule({
  name: 'enforce-use-client-react-number-format',
  description: "Require 'use client' in Server Component files that use react-number-format",
  subject: 'react-number-format has no client directive of its own',
  apisFor: (source) => (source === 'react-number-format' ? COMPONENTS : null),
});
