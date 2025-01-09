module.exports = function hasEdgeRuntimeExport(body) {
  return body.some(
    (statement) =>
      statement.type === 'ExportNamedDeclaration' &&
      statement.declaration?.declarations?.some(
        (decl) => decl.id.name === 'runtime' && decl.init?.type === 'Literal' && decl.init.value === 'edge'
      )
  );
};
