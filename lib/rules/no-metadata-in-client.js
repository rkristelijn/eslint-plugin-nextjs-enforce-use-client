/**
 * @fileoverview Server-only exports in a 'use client' page or layout:
 * `metadata`, `generateMetadata` and `generateStaticParams` fail the build;
 * `dynamic` is silently ignored (a 'use client' page with
 * `dynamic = 'force-dynamic'` builds as static). Next.js only checks page and
 * layout files, so other client modules may export these names freely.
 * @implements euc-no-metadata-in-client
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */

'use strict';

const { docsUrl } = require('../utils/meta');
const { hasUseClient } = require('../utils/directives');
const { appRouterBasename } = require('../utils/files');
const { exportedBindings, isValidatedFile } = require('../utils/server-file');
const { BUILD_ERROR_EXPORTS, IGNORED_EXPORTS } = require('../data/client-apis');

/**
 * @param {string} name exported or original name
 * @returns {'buildError' | 'ignored' | null}
 */
function messageIdFor(name) {
  if (BUILD_ERROR_EXPORTS.has(name)) return 'buildError';
  return IGNORED_EXPORTS.has(name) ? 'ignored' : null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Disallow exports that fail the build (metadata, generateStaticParams) or are ignored (dynamic) in a 'use client' page or layout",
      recommended: true,
      url: docsUrl('no-metadata-in-client'),
    },
    schema: [],
    messages: {
      buildError:
        "'{{name}}' in a 'use client' {{file}} fails the build: Next.js only allows it in Server Components. Keep this file a Server Component and move the client part into its own component.",
      ignored:
        "'{{name}}' has no effect in a 'use client' {{file}}: Next.js ignores it there (the route builds as if it were not set). Keep this file a Server Component and move the client part into its own component.",
    },
  },

  create(context) {
    if (!isValidatedFile(context.filename)) return {};
    const file = appRouterBasename(context.filename);
    return {
      Program(node) {
        if (!hasUseClient(node)) return;
        // One report per export node, even when both its exported and original name match.
        const reported = new Set();
        for (const { name, node: id } of exportedBindings(node)) {
          const messageId = messageIdFor(name);
          if (!messageId || reported.has(id)) continue;
          reported.add(id);
          context.report({ node: id, messageId, data: { name, file } });
        }
      },
    };
  },
};
