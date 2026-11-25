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
const { exportedBindings } = require('../utils/server-file');
const { BUILD_ERROR_EXPORTS, IGNORED_EXPORTS } = require('../data/client-apis');

/** Next.js validates these exports in page and layout files only. */
const CHECKED_FILES = new Set(['page', 'layout']);

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
    const file = appRouterBasename(context.filename);
    if (!CHECKED_FILES.has(file)) return {};
    return {
      Program(node) {
        if (!hasUseClient(node)) return;
        for (const { name, node: id } of exportedBindings(node)) {
          if (BUILD_ERROR_EXPORTS.has(name))
            context.report({ node: id, messageId: 'buildError', data: { name, file } });
          else if (IGNORED_EXPORTS.has(name)) context.report({ node: id, messageId: 'ignored', data: { name, file } });
        }
      },
    };
  },
};
