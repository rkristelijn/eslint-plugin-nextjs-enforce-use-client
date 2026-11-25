/**
 * @fileoverview Facts about a module that decide whether 'use client' may be
 * added: some exports fail the build in a client page/layout, others are
 * silently ignored there (see lib/data/client-apis.js for the evidence).
 * @implements ADR-004
 */

'use strict';

const { BUILD_ERROR_EXPORTS, IGNORED_EXPORTS } = require('../data/client-apis');

/**
 * Identifiers bound by a declaration pattern (`a`, `{ a, b: c }`, `[d, ...e]`).
 * @param {object} pattern
 * @returns {object[]} Identifier nodes
 */
function bindingIdentifiers(pattern) {
  if (!pattern) return [];
  switch (pattern.type) {
    case 'Identifier':
      return [pattern];
    case 'ObjectPattern':
      return pattern.properties.flatMap((p) => bindingIdentifiers(p.type === 'RestElement' ? p.argument : p.value));
    case 'ArrayPattern':
      return pattern.elements.flatMap((el) => bindingIdentifiers(el));
    case 'RestElement':
      return bindingIdentifiers(pattern.argument);
    case 'AssignmentPattern':
      return bindingIdentifiers(pattern.left);
    default:
      return [];
  }
}

/**
 * Exported value bindings of a module: name + node to report on. Type-only
 * exports are skipped, they do not exist at runtime.
 * @param {object} program
 * @returns {{ name: string, node: object }[]}
 */
function exportedBindings(program) {
  const bindings = [];
  for (const statement of program.body) {
    if (statement.type !== 'ExportNamedDeclaration' || statement.exportKind === 'type') continue;
    const decl = statement.declaration;
    if (decl && decl.type === 'VariableDeclaration') {
      decl.declarations
        .flatMap((d) => bindingIdentifiers(d.id))
        .forEach((id) => bindings.push({ name: id.name, node: id }));
    } else if (decl && decl.id) {
      bindings.push({ name: decl.id.name, node: decl.id });
    }
    for (const spec of statement.specifiers || []) {
      if (spec.exportKind === 'type') continue;
      const exported = spec.exported;
      bindings.push({ name: exported.type === 'Identifier' ? exported.name : String(exported.value), node: exported });
    }
  }
  return bindings;
}

/**
 * @param {object} program
 * @returns {Set<string>}
 */
function exportedNames(program) {
  return new Set(exportedBindings(program).map((b) => b.name));
}

/**
 * Exports that only work in a Server Component, or [] when none.
 * @param {object} program
 * @returns {string[]}
 */
function serverOnlyExports(program) {
  return [...exportedNames(program)].filter((name) => BUILD_ERROR_EXPORTS.has(name) || IGNORED_EXPORTS.has(name));
}

module.exports = { bindingIdentifiers, exportedBindings, exportedNames, serverOnlyExports };
