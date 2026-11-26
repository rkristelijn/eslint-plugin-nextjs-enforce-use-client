/**
 * @fileoverview Next.js requires error.tsx and global-error.tsx to be Client
 * Components (error boundaries need state and reset()).
 * @implements euc-require-use-client-in-error
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */

'use strict';

const path = require('node:path');
const { docsUrl } = require('../utils/meta');
const { hasUseClient, insertUseClient } = require('../utils/directives');
const { isClientEntryFile } = require('../utils/files');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: "Require 'use client' in App Router error.tsx and global-error.tsx",
      recommended: true,
      url: docsUrl('require-use-client-in-error'),
    },
    fixable: 'code',
    schema: [],
    messages: {
      missing: "'{{file}}' must be a Client Component: Next.js error boundaries need 'use client' at the top.",
    },
  },

  create(context) {
    if (!isClientEntryFile(context.filename)) return {};
    return {
      Program(node) {
        if (hasUseClient(node) || node.body.length === 0) return;
        context.report({
          node: node.body[0],
          messageId: 'missing',
          data: { file: path.basename(context.filename) },
          fix: (fixer) => insertUseClient(fixer, node),
        });
      },
    };
  },
};
