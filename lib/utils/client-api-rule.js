/**
 * @fileoverview Factory: "this server file uses a client-only API" rules.
 * One behaviour for every API family, so the rules only differ in data.
 * @implements ADR-003 ADR-004
 */

'use strict';

const { docsUrl } = require('./meta');
const { hasUseClient, hasUseServer, insertUseClient } = require('./directives');
const { isServerEntryFile } = require('./files');
const { collectImports, isInlineEventHandler, namespacedApi } = require('./usage');
const { serverOnlyExports } = require('./server-file');

const OPTIONS_SCHEMA = [
  {
    type: 'object',
    properties: {
      files: {
        description:
          "Which files to check: 'route' (default) = App Router entry files that are Server Components (page, layout, template, loading, not-found, default); 'all' = every file that is not already a client module.",
        enum: ['route', 'all'],
      },
    },
    additionalProperties: false,
  },
];

/**
 * @param {object} spec
 * @param {string} spec.name rule name
 * @param {string} spec.description
 * @param {string} spec.subject what was found, for the message ("React client hooks")
 * @param {(source: string) => Set<string> | null} spec.apisFor client API names per import source
 * @param {boolean} [spec.eventHandlers] also report inline event handlers
 * @returns {object} ESLint rule
 */
function clientApiRule({ name, description, subject, apisFor, eventHandlers = false }) {
  return {
    meta: {
      type: 'problem',
      docs: { description, recommended: true, url: docsUrl(name) },
      fixable: 'code',
      schema: OPTIONS_SCHEMA,
      defaultOptions: [{ files: 'route' }],
      messages: {
        missingUseClient: `'{{api}}' only works in a Client Component, but this file has no 'use client' directive (${subject}).`,
        eventHandler:
          "Inline '{{api}}' handler in a Server Component: functions cannot be passed from the server. Add 'use client', or move the interactive part into a Client Component.",
        cannotAddUseClient:
          "'{{api}}' only works in a Client Component, but this file exports '{{exports}}', which only works in a Server Component ('use client' would fail the build for metadata, and make route segment config silently ignored). Move the client part into its own 'use client' component.",
      },
    },

    create(context) {
      const [{ files }] = context.options;
      const isInScope = files === 'all' || isServerEntryFile(context.filename);
      if (!isInScope) return {};

      const found = [];
      let namespaces = new Map();
      let program = null;

      return {
        Program(node) {
          program = node;
          if (hasUseClient(node) || hasUseServer(node)) {
            program = null;
            return;
          }
          const imports = collectImports(node, apisFor);
          namespaces = imports.namespaces;
          imports.named.forEach(({ name: api, node: spec }) =>
            found.push({ api, node: spec, messageId: 'missingUseClient' }),
          );
        },
        MemberExpression(node) {
          if (!program) return;
          const api = namespacedApi(node, namespaces);
          if (api) found.push({ api: `${node.object.name}.${api}`, node, messageId: 'missingUseClient' });
        },
        JSXAttribute(node) {
          if (program && eventHandlers && isInlineEventHandler(node))
            found.push({ api: node.name.name, node, messageId: 'eventHandler' });
        },
        'Program:exit'() {
          if (!program || found.length === 0) return;
          const blockers = serverOnlyExports(program);
          const [first] = found;
          if (blockers.length > 0) {
            context.report({
              node: first.node,
              messageId: 'cannotAddUseClient',
              data: { api: first.api, exports: blockers.join("', '") },
            });
            return;
          }
          // One report per file: the fix (one directive) resolves every usage.
          context.report({
            node: first.node,
            messageId: first.messageId,
            data: { api: first.api },
            fix: (fixer) => insertUseClient(fixer, program),
          });
        },
      };
    },
  };
}

module.exports = { clientApiRule };
