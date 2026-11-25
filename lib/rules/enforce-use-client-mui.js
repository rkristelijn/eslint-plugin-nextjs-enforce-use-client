/**
 * @fileoverview A Server Component file that uses MUI hooks or creates a theme
 * needs 'use client'. MUI components themselves ship 'use client' and are fine
 * in Server Components (MUI's own App Router setup renders ThemeProvider and
 * AppRouterCacheProvider in a server layout).
 * @implements euc-enforce-use-client-mui
 * @see https://mui.com/material-ui/integrations/nextjs/
 */

'use strict';

const { MUI_CLIENT_HOOKS, MUI_THEME_FACTORIES } = require('../data/client-apis');
const { clientApiRule } = require('../utils/client-api-rule');

const MUI_APIS = new Set([...MUI_CLIENT_HOOKS, ...MUI_THEME_FACTORIES]);

const MUI_BARREL = /^@mui\/(material|system|joy)(\/styles)?$/;
const MUI_PATH = /^@mui\/(material|system|joy)(?:\/styles)?\/([A-Za-z]+)$/;

/**
 * @param {string} source
 * @returns {Set<string> | null}
 */
function apisFor(source) {
  return MUI_BARREL.test(source) ? MUI_APIS : null;
}

/**
 * Path import whose default export is an MUI hook (`@mui/material/useMediaQuery`).
 * @param {string} source
 * @returns {string | null}
 */
function defaultApiFor(source) {
  const match = MUI_PATH.exec(source);
  return match && MUI_APIS.has(match[2]) ? match[2] : null;
}

module.exports = clientApiRule({
  name: 'enforce-use-client-mui',
  description: "Require 'use client' in Server Component files that use MUI hooks or create a theme",
  subject: 'MUI hook or theme factory',
  apisFor,
  defaultApiFor,
});
