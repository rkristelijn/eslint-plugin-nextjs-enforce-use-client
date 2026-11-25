/**
 * @fileoverview Server-only exports in a 'use client' file: `metadata`,
 * `generateMetadata`, `viewport` fail the build; route segment config
 * (`dynamic`, `revalidate`, `runtime`, …) is silently ignored (verified: a
 * 'use client' page with `dynamic = 'force-dynamic'` builds as static).
 * @implements euc-no-metadata-in-client
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */

'use strict';

const { docsUrl } = require('../utils/meta');
const { hasUseClient } = require('../utils/directives');
const { serverOnlyExports } = require('../utils/server-file');
const { METADATA_EXPORTS } = require('../data/client-apis');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: "Disallow metadata (build error) and route segment config (ignored) exports in 'use client' files",
      recommended: true,
      url: docsUrl('no-metadata-in-client'),
    },
    schema: [],
    messages: {
      metadata:
        "'{{name}}' in a 'use client' file fails the build: Next.js only reads metadata from Server Components. Keep this file a Server Component and move the client part into its own component.",
      segmentConfig:
        "'{{name}}' has no effect in a 'use client' file: Next.js ignores route segment config there. Keep this file a Server Component and move the client part into its own component.",
    },
  },

  create(context) {
    return {
      Program(node) {
        if (!hasUseClient(node)) return;
        const names = new Set(serverOnlyExports(node));
        if (names.size === 0) return;
        for (const statement of node.body) {
          if (statement.type !== 'ExportNamedDeclaration') continue;
          const decl = statement.declaration;
          const ids =
            decl && decl.type === 'VariableDeclaration'
              ? decl.declarations.map((d) => d.id)
              : decl && decl.id
                ? [decl.id]
                : [];
          const specs = (statement.specifiers || []).map((s) => s.exported);
          for (const id of [...ids, ...specs]) {
            const name = id.type === 'Identifier' ? id.name : String(id.value);
            if (!names.has(name)) continue;
            const messageId = METADATA_EXPORTS.has(name) ? 'metadata' : 'segmentConfig';
            context.report({ node: id, messageId, data: { name } });
          }
        }
      },
    };
  },
};
