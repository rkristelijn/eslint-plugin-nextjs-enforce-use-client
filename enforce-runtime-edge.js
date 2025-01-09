module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce export const runtime = "edge"; in app folder to avoid build warnings https://app.clickup.com/t/86973rq7n',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code', // Indicates this rule is autofixable
    messages: {
      enforceRuntimeEdge: 'Expected export const runtime = "edge"; in app folder',
    },
    schema: [], // No options
  },
  create(context) {
    return {
      Program(node) {
        const filename = context.getFilename();
        const isAppFile = filename.includes('/src/app/'); // Customize as needed
        if (!isAppFile) return;

        // Check if runtime is already declared as "edge"
        const hasRuntimeEdge = node.body.some((statement) => {
          return (
            statement.type === 'ExportNamedDeclaration' &&
            statement.declaration &&
            statement.declaration.type === 'VariableDeclaration' &&
            statement.declaration.declarations[0].id.name === 'runtime' &&
            statement.declaration.declarations[0].init.value === 'edge'
          );
        });

        if (!hasRuntimeEdge) {
          context.report({
            node,
            messageId: 'enforceRuntimeEdge',
            fix(fixer) {
              const sourceCode = context.getSourceCode();
              const body = sourceCode.ast.body;

              // Find imports at the top of the file
              const importStatements = body.filter((statement) => statement.type === 'ImportDeclaration');
              const lastImport = importStatements[importStatements.length - 1];

              // Check if the runtime variable is already declared at the correct position
              const hasRuntimeDeclarationAtTop = body.find(
                (statement, idx) =>
                  idx > (lastImport ? lastImport.range[1] : 0) &&
                  statement.type === 'ExportNamedDeclaration' &&
                  statement.declaration?.declarations[0]?.id?.name === 'runtime' &&
                  statement.declaration?.declarations[0]?.init?.value === 'edge'
              );

              if (hasRuntimeDeclarationAtTop) {
                return null; // Already correct placement, no fix needed
              }

              // Create the export declaration to insert
              const runtimeExport = `export const runtime = "edge";\n\n`;

              // Insert at the correct position based on imports
              if (lastImport) {
                return fixer.insertTextAfter(lastImport, runtimeExport);
              }
              return fixer.insertTextBefore(body[0], runtimeExport);
            },
          });
        }
      },
    };
  },
};
