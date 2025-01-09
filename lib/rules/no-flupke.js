/** This is just a rule as an example to get to understand the concepts */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow usage of the string "flupke" and replace it with "bolleke"',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code', // Indicates this rule is autofixable
    messages: {
      avoidFlupke: 'The use of the string "flupke" is disallowed. It has been replaced with "bolleke".',
    },
    schema: [], // No options
  },
  create(context) {
    return {
      // Check literals (strings)
      Literal(node) {
        if (typeof node.value === 'string' && node.value.toLowerCase().includes('flupke')) {
          context.report({
            node,
            messageId: 'avoidFlupke',
            fix(fixer) {
              return fixer.replaceText(node, `"bolleke"`);
            },
          });
        }
      },
      // Check variable names
      Identifier(node) {
        if (node.name.toLowerCase() === 'flupke') {
          context.report({
            node,
            messageId: 'avoidFlupke',
            fix(fixer) {
              return fixer.replaceText(node, 'bolleke');
            },
          });
        }
      },
    };
  },
};
