/**
 * @fileoverview Find client-only API usage in a module: named imports,
 * namespace/default member calls (`React.useState`) and inline event handlers.
 * @implements ADR-003.usage
 */

'use strict';

/**
 * Imported name of a specifier.
 * @param {object} spec ImportSpecifier
 * @returns {string}
 */
function importedName(spec) {
  return spec.imported.type === 'Identifier' ? spec.imported.name : String(spec.imported.value);
}

/**
 * Collect client APIs imported by name, and local names of namespace/default imports.
 * @param {object} program Program
 * @param {(source: string) => Set<string> | null} apisFor client API names per module (barrel)
 * @param {(source: string) => string | null} [defaultApiFor] API that a module's default export is
 *   (`@mui/material/useMediaQuery` → 'useMediaQuery')
 * @returns {{ named: { name: string, node: object }[], namespaces: Map<string, Set<string>> }}
 */
function collectImports(program, apisFor, defaultApiFor = () => null) {
  const named = [];
  const namespaces = new Map();
  for (const statement of program.body) {
    if (statement.type !== 'ImportDeclaration' || statement.importKind === 'type') continue;
    const source = statement.source.value;
    const defaultApi = defaultApiFor(source);
    if (defaultApi) {
      statement.specifiers
        .filter((spec) => spec.type === 'ImportDefaultSpecifier')
        .forEach((spec) => named.push({ name: defaultApi, node: spec }));
      continue;
    }
    const apis = apisFor(source);
    if (!apis) continue;
    for (const spec of statement.specifiers) {
      if (spec.importKind === 'type') continue;
      if (spec.type === 'ImportSpecifier' && apis.has(importedName(spec)))
        named.push({ name: importedName(spec), node: spec });
      if (spec.type === 'ImportNamespaceSpecifier' || spec.type === 'ImportDefaultSpecifier')
        namespaces.set(spec.local.name, apis);
    }
  }
  return { named, namespaces };
}

/**
 * Static property name of a member access: `a.b`, `a['b']`, `a[\`b\`]`; null when dynamic.
 * @param {object} node MemberExpression
 * @returns {string | null}
 */
function staticPropertyName(node) {
  const prop = node.property;
  if (!node.computed) return prop.type === 'Identifier' ? prop.name : null;
  if (prop.type === 'Literal' && typeof prop.value === 'string') return prop.value;
  if (prop.type === 'TemplateLiteral' && prop.expressions.length === 0) return prop.quasis[0].value.cooked;
  return null;
}

/**
 * Is `node` a member access `<namespace>.<clientApi>` (e.g. `React.useState`)?
 * @param {object} node MemberExpression
 * @param {Map<string, Set<string>>} namespaces
 * @returns {string | null} API name
 */
function namespacedApi(node, namespaces) {
  if (node.object.type !== 'Identifier') return null;
  const apis = namespaces.get(node.object.name);
  const name = staticPropertyName(node);
  return apis && name !== null && apis.has(name) ? name : null;
}

/**
 * Does the identifier resolve (scope-aware) to an import binding? A parameter
 * or local named `React` that shadows the import does not count.
 * @param {object} identifier
 * @param {object} sourceCode
 * @returns {boolean}
 */
function resolvesToImport(identifier, sourceCode) {
  for (let scope = sourceCode.getScope(identifier); scope; scope = scope.upper) {
    const variable = scope.set.get(identifier.name);
    if (variable) return variable.defs.some((def) => def.type === 'ImportBinding');
  }
  return false;
}

/**
 * Does a function body declare 'use server' (an inline Server Function)?
 * @param {object} fn function node
 * @returns {boolean}
 */
function isServerFunction(fn) {
  if (!fn.body || fn.body.type !== 'BlockStatement') return false;
  const first = fn.body.body[0];
  return Boolean(first && first.type === 'ExpressionStatement' && first.directive === 'use server');
}

/**
 * Inline event handler on a JSX element: `onClick={() => ...}`. A function
 * cannot be passed from a Server Component unless it is a Server Function.
 * @param {object} attr JSXAttribute
 * @returns {boolean}
 */
function isInlineEventHandler(attr) {
  if (attr.name.type !== 'JSXIdentifier' || !/^on[A-Z]/.test(attr.name.name)) return false;
  const expr = attr.value && attr.value.type === 'JSXExpressionContainer' ? attr.value.expression : null;
  const isFunction = expr && (expr.type === 'ArrowFunctionExpression' || expr.type === 'FunctionExpression');
  return Boolean(isFunction) && !isServerFunction(expr);
}

module.exports = {
  collectImports,
  importedName,
  isInlineEventHandler,
  isServerFunction,
  namespacedApi,
  resolvesToImport,
  staticPropertyName,
};
