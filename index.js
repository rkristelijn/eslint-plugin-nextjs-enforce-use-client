/**
 * ESLint plugin to enforce specific coding rules.
 * 
 * @module eslint-plugin-nextjs-enforce-use-client
 * @see {@link https://github.com/rkristelijn/eslint-plugin-nextjs-enforce-use-client}
 * 
 * @example
 * ```js
 * // .eslintrc.js
 * 
 * const enforceUseClient = require('eslint-plugin-nextjs-enforce-use-client');
 * 
 * module.exports = [
 *  {
 *    files: ['**\/*.tsx', '**\/*.jsx'], // remove the backspace, it is only here to let jsDoc work
 *    ignores: ['**\/*.test.ts', '**\/*.test.tsx'], // remove the backspace, it is only here to let jsDoc work
 *    plugins: { 'eslint-plugin-nextjs-enforce-use-client': enforceUseClient,},
 *    rules: {
 *     'eslint-plugin-nextjs-enforce-use-client/enforce-use-client-react': 'error',
 *     'eslint-plugin-nextjs-enforce-use-client/enforce-use-client-mui': 'error',
 *     'eslint-plugin-nextjs-enforce-use-client/enforce-use-client-react-number-format': 'error',
 *     'eslint-plugin-nextjs-enforce-use-client/no-flupke': 'error',
 *     },
 *   },
 * ],
 * ```
 */

module.exports = {
  rules: {
    /**
     * Rule to enforce the "use client" directive for React components.
     * @see {@link ./lib/rules/enforce-use-client-react}
     */
    'enforce-use-client-react': require('./lib/rules/enforce-use-client-react'),

    /**
     * Rule to enforce the "use client" directive for MUI components.
     * @see {@link ./lib/rules/enforce-use-client-mui}
     */
    'enforce-use-client-mui': require('./lib/rules/enforce-use-client-mui'),

    /**
     * Rule to enforce the "use client" directive for react-number-format components.
     * @see {@link ./lib/rules/enforce-use-client-react-number-format}
     */
    'enforce-use-client-react-number-format': require('./lib/rules/enforce-use-client-react-number-format'),

    /**
     * Rule to disallow the usage of the string "flupke".
     * @see {@link ./lib/rules/no-flupke}
     */
    'no-flupke': require('./lib/rules/no-flupke'),
  },
};