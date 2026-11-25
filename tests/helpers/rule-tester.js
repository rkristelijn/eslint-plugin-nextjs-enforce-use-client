/**
 * @fileoverview RuleTester wired to node:test, with JSX + ESM enabled.
 */

'use strict';

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

/** @returns {RuleTester} */
function createRuleTester() {
  return new RuleTester({
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });
}

/** Language options for TypeScript/TSX cases (`import type`, generics). */
const tsx = {
  parser: require('@typescript-eslint/parser'),
  parserOptions: { ecmaFeatures: { jsx: true } },
};

module.exports = { createRuleTester, tsx };
