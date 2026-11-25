/**
 * @fileoverview Facts about a module that decide whether 'use client' may be
 * added: metadata exports fail the build in a client file, and route segment
 * config is ignored there.
 * @implements ADR-004
 */

'use strict';

const { METADATA_EXPORTS, ROUTE_SEGMENT_CONFIG } = require('../data/client-apis');

/**
 * Names a module exports (`export const x`, `export function x`, `export { x }`).
 * @param {object} program
 * @returns {Set<string>}
 */
function exportedNames(program) {
  const names = new Set();
  for (const statement of program.body) {
    if (statement.type !== 'ExportNamedDeclaration') continue;
    const decl = statement.declaration;
    if (decl && decl.type === 'VariableDeclaration') {
      decl.declarations.forEach((d) => d.id.type === 'Identifier' && names.add(d.id.name));
    } else if (decl && decl.id) {
      names.add(decl.id.name);
    }
    for (const spec of statement.specifiers || []) {
      names.add(spec.exported.type === 'Identifier' ? spec.exported.name : String(spec.exported.value));
    }
  }
  return names;
}

/**
 * Exports that only work in a Server Component, or [] when none.
 * @param {object} program
 * @returns {string[]}
 */
function serverOnlyExports(program) {
  return [...exportedNames(program)].filter((name) => ROUTE_SEGMENT_CONFIG.has(name) || METADATA_EXPORTS.has(name));
}

module.exports = { exportedNames, serverOnlyExports };
