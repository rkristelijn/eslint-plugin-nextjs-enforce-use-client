/**
 * @fileoverview Directive prologue helpers: 'use client' / 'use server' only
 * count as the first statements of a module (comments may come before).
 * @implements ADR-003.directive-prologue
 */

'use strict';

/**
 * Directives of the program's directive prologue.
 * @param {object} program Program
 * @returns {string[]}
 */
function getDirectives(program) {
  const directives = [];
  for (const statement of program.body) {
    if (statement.type !== 'ExpressionStatement' || typeof statement.directive !== 'string') break;
    directives.push(statement.directive);
  }
  return directives;
}

/**
 * @param {object} program
 * @returns {boolean}
 */
function hasUseClient(program) {
  return getDirectives(program).includes('use client');
}

/**
 * @param {object} program
 * @returns {boolean}
 */
function hasUseServer(program) {
  return getDirectives(program).includes('use server');
}

/**
 * Fix that inserts the directive above the first statement (after leading comments).
 * @param {object} fixer
 * @param {object} program
 * @returns {object}
 */
function insertUseClient(fixer, program) {
  return fixer.insertTextBefore(program.body[0], "'use client';\n\n");
}

module.exports = { getDirectives, hasUseClient, hasUseServer, insertUseClient };
