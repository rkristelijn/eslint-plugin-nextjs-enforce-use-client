/**
 * @fileoverview Shared rule metadata helpers.
 */

'use strict';

const REPO = 'https://github.com/rkristelijn/eslint-plugin-nextjs-enforce-use-client';

/**
 * @param {string} ruleName
 * @returns {string}
 */
function docsUrl(ruleName) {
  return `${REPO}/blob/main/docs/rules/${ruleName}.md`;
}

module.exports = { docsUrl };
