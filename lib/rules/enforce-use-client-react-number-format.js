module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce "use client" directive for files importing react-number-format.',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      enforceUseClient: 'Expected "use client" directive at the top of this file since it imports react-number-format.',
    },
    schema: [],
  },
  create(context) {
    const reactNumberFormat = 'NumericFormat';

    function hasReactNumberFormat(node) {
      if (node.type === 'ImportDeclaration') {
        return node.specifiers.some((specifier) => specifier.type === 'ImportSpecifier' && specifier.imported.name === reactNumberFormat);
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

        const usesReactNumberFormat = body.some((node) => hasReactNumberFormat(node));

        if (usesReactNumberFormat) {
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
