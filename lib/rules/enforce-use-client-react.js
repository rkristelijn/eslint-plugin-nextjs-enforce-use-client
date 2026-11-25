/**
 * @fileoverview A Server Component file that uses React / react-dom /
 * next/navigation client hooks or inline event handlers needs 'use client'.
 * @implements euc-enforce-use-client-react
 * @see https://react.dev/reference/rsc/use-client
 */

'use strict';

const { MODULE_CLIENT_HOOKS, REACT_CLIENT_HOOKS } = require('../data/client-apis');
const { clientApiRule } = require('../utils/client-api-rule');

/**
 * @param {string} source import source
 * @returns {Set<string> | null}
 */
function apisFor(source) {
  if (source === 'react') return REACT_CLIENT_HOOKS;
  return MODULE_CLIENT_HOOKS.get(source) || null;
}

module.exports = clientApiRule({
  name: 'enforce-use-client-react',
  description:
    "Require 'use client' in Server Component files that use React client hooks, next/navigation hooks or inline event handlers",
  subject: 'React, react-dom or next/navigation client hook',
  apisFor,
  eventHandlers: true,
});
