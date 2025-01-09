module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce the use of "use client" directive when client-side hooks (useState, useEffect, etc.), MUI components, or react-number-format are imported.',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      enforceUseClient:
        'Expected "use client" directive at the top of this file since it imports client-side hooks, MUI components, or react-number-format.',
    },
    schema: [],
  },
  create(context) {
    const clientHooks = ['useState', 'useEffect', 'useContext', 'useReducer', 'useMemo', 'useTransition', 'useId'];

    const muiClientComponents = [
      'ThemeProvider',
      'CssBaseline',
      'InitColorSchemeScript',
      'AppRouterCacheProvider',
      // Add other MUI client-side components that require use client
    ];

    const reactNumberFormat = 'NumericFormat'; // react-number-format component to track

    // Check for imported client-side hooks, MUI components, or react-number-format
    function hasClientSideImports(node) {
      if (node.type === 'ImportDeclaration') {
        // Check for client-side React hooks
        const hasReactHook = node.specifiers.some(
          (specifier) => specifier.type === 'ImportSpecifier' && clientHooks.includes(specifier.imported.name)
        );
        // Check for MUI components that require client-side rendering
        const hasMUIComponent = node.specifiers.some(
          (specifier) => specifier.type === 'ImportSpecifier' && muiClientComponents.includes(specifier.imported.name)
        );
        // Check for react-number-format (NumericFormat)
        const hasReactNumberFormat = node.specifiers.some(
          (specifier) => specifier.type === 'ImportSpecifier' && specifier.imported.name === reactNumberFormat
        );

        return hasReactHook || hasMUIComponent || hasReactNumberFormat;
      }
      return false;
    }

    return {
      Program(programNode) {
        const sourceCode = context.getSourceCode();
        const body = sourceCode.ast.body;

        // Check if there's a "use client" directive already at the top
        const hasUseClientDirective = body.some(
          (statement) =>
            statement.type === 'ExpressionStatement' &&
            statement.expression.type === 'Literal' &&
            statement.expression.value === 'use client'
        );

        if (hasUseClientDirective) return; // Skip if "use client" is already there

        // Check if any import statements include client-side hooks, MUI components, or react-number-format
        const usesClientHooksOrMUIComponents = body.some((node) => hasClientSideImports(node));

        if (usesClientHooksOrMUIComponents) {
          // Report and autofix by adding 'use client' at the top of the file
          context.report({
            node: programNode,
            messageId: 'enforceUseClient',
            fix(fixer) {
              return fixer.insertTextBefore(body[0], `'use client';\n\n`);
            },
          });
        }
      },
    };
  },
};
