'use strict';

const js = require('@eslint/js');
const eslintPlugin = require('eslint-plugin-eslint-plugin').default;
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/', 'coverage/'] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals: { ...globals.node } },
  },
  { files: ['lib/rules/**/*.js', 'lib/utils/client-api-rule.js'], ...eslintPlugin.configs['rules-recommended'] },
  { files: ['tests/rules/**/*.js'], ...eslintPlugin.configs['tests-recommended'] },
  { files: ['tests/**/*.js'], languageOptions: { globals: { ...globals.node } } },
];
