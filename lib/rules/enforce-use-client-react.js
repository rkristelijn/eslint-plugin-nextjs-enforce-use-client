module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce "use client" directive for files using React client-side hooks.',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      enforceUseClient: 'Expected "use client" directive at the top of this file since it imports React client-side hooks.',
    },
    schema: [],
  },
  create(context) {
    const clientHooks = ['useState', 'useEffect', 'useContext', 'useReducer', 'useMemo', 'useTransition', 'useId', 'useRef'];

    function hasReactClientHooks(node) {
      if (node.type === 'ImportDeclaration') {
        return node.specifiers.some((specifier) => specifier.type === 'ImportSpecifier' && clientHooks.includes(specifier.imported.name));
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

        const usesReactClientHooks = body.some((node) => hasReactClientHooks(node));

        if (usesReactClientHooks) {
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
