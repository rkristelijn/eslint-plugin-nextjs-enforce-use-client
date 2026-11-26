/**
 * @fileoverview App Router file classification.
 * @implements ADR-003.entry-files
 */

'use strict';

const path = require('node:path');

const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs']);

/** App Router files that are Server Components unless marked otherwise. */
const SERVER_ENTRY_NAMES = new Set([
  'page',
  'layout',
  'template',
  'loading',
  'not-found',
  'default',
  'forbidden',
  'unauthorized',
]);

/** App Router files that must be Client Components. */
const CLIENT_ENTRY_NAMES = new Set(['error', 'global-error']);

/**
 * Split a filename into its App Router basename, or null when the file is not
 * under an `app/` directory or has another extension.
 * @param {string} filename
 * @returns {string | null}
 */
function appRouterBasename(filename) {
  const normalized = filename.split(path.sep).join('/');
  if (!/(^|\/)app\//.test(normalized)) return null;
  const ext = path.extname(normalized);
  if (!EXTENSIONS.has(ext)) return null;
  return path.basename(normalized, ext);
}

/**
 * @param {string} filename
 * @returns {boolean}
 */
function isServerEntryFile(filename) {
  return SERVER_ENTRY_NAMES.has(appRouterBasename(filename));
}

/**
 * @param {string} filename
 * @returns {boolean}
 */
function isClientEntryFile(filename) {
  return CLIENT_ENTRY_NAMES.has(appRouterBasename(filename));
}

module.exports = { CLIENT_ENTRY_NAMES, SERVER_ENTRY_NAMES, appRouterBasename, isClientEntryFile, isServerEntryFile };
