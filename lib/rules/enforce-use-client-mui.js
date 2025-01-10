const hasEdgeRuntimeExport = require('./has-edge-runtime')

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce "use client" directive for files importing MUI client-side components.',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      enforceUseClient: 'Expected "use client" directive at the top of this file since it imports MUI client-side components.',
    },
    schema: [],
  },
  create(context) {
    const muiClientComponents = ['ThemeProvider', 'CssBaseline', 'InitColorSchemeScript', 'AppRouterCacheProvider', 'MuiThemeProvider'];

    function hasMUIClientComponents(node) {
      if (node.type === 'ImportDeclaration') {
        return node.specifiers.some(
          (specifier) => specifier.type === 'ImportSpecifier' && muiClientComponents.includes(specifier.imported.name)
        );
      }
      return false;
    }

    return {
      Program(programNode) {
        const sourceCode = context.getSourceCode();
        const body = sourceCode.ast.body;

        const hasUseClientDirective = body.some(
          (statement) =>
            statement.type === 'ExpressionStatement' &&
            statement.expression.type === 'Literal' &&
            statement.expression.value === 'use client'
        );

        if (hasUseClientDirective) return;

        const usesMUIComponents = body.some((node) => hasMUIClientComponents(node));

        if (!usesMUIComponents) return;

        if (hasEdgeRuntimeExport(body)) return;

        if (hasEdgeRuntimeExport) return;

        context.report({
          node: programNode,
          messageId: 'enforceUseClient',
          fix(fixer) {
            return fixer.insertTextBefore(body[0], `'use client';\n\n`);
          },
        });
      },
    };
  },
};