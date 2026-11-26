/**
 * @fileoverview Flat-config plugin: rules, meta and the `recommended` config.
 * @implements ADR-002
 */

'use strict';

const { name, version } = require('./package.json');

const NAMESPACE = 'nextjs-enforce-use-client';

/** Explicit registry: the published API is reviewable in one place. */
const rules = {
  'enforce-use-client-mui': require('./lib/rules/enforce-use-client-mui'),
  'enforce-use-client-react': require('./lib/rules/enforce-use-client-react'),
  'enforce-use-client-react-number-format': require('./lib/rules/enforce-use-client-react-number-format'),
  'no-metadata-in-client': require('./lib/rules/no-metadata-in-client'),
  'require-use-client-in-error': require('./lib/rules/require-use-client-in-error'),
};

const plugin = { meta: { name, version, namespace: NAMESPACE }, rules, configs: {} };

/** recommended: every non-deprecated rule as an error. */
plugin.configs.recommended = {
  name: `${NAMESPACE}/recommended`,
  plugins: { [NAMESPACE]: plugin },
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  rules: Object.fromEntries(
    Object.entries(rules)
      .filter(([, rule]) => !rule.meta.deprecated)
      .map(([ruleName]) => [`${NAMESPACE}/${ruleName}`, 'error']),
  ),
};

module.exports = plugin;
