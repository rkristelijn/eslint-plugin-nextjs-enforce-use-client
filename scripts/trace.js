#!/usr/bin/env node
/**
 * @fileoverview annotrace coverage for this repo: harvests `@id`,
 * `@implements` and `@proves` and reports duplicate IDs, dead links, decisions
 * without code and rules without a proving test. `--strict` exits 1 on any error.
 * `--json` prints the machine-readable report.
 * @implements ADR-005
 * @see https://github.com/rkristelijn/keur/blob/main/docs/design/traceability.md
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** Concept IDs of rule docs (`@id euc-<rule>`): each needs a proving test. */
const RULE_ID_PREFIX = 'euc-';
/** Tag patterns (literal regexes: no runtime-built RegExp). IDs: [A-Za-z0-9][A-Za-z0-9._:-]* */
const ID_RE = /@id[ \t]+([A-Za-z0-9][A-Za-z0-9._:-]*)/g;
const REF_RE = {
  implements: /@implements((?:[ \t]+[A-Za-z0-9][A-Za-z0-9._:-]*)+)/g,
  proves: /@proves((?:[ \t]+[A-Za-z0-9][A-Za-z0-9._:-]*)+)/g,
};

/** Where each kind of tag is harvested from. */
const SCAN = {
  declare: ['docs'],
  implement: ['index.js', 'lib', 'scripts', '.github', 'eslint.config.js', 'Makefile'],
  prove: ['tests'],
};

/**
 * All files under the given roots (relative to `root`), skipping node_modules and .git.
 * @param {string} root
 * @param {string[]} roots
 * @returns {string[]}
 */
function listFiles(root, roots) {
  const files = [];
  const walk = (abs) => {
    if (!fs.existsSync(abs)) return;
    const stat = fs.statSync(abs);
    if (stat.isFile()) {
      files.push(abs);
      return;
    }
    for (const entry of fs.readdirSync(abs)) {
      if (entry === 'node_modules' || entry === '.git') continue;
      walk(path.join(abs, entry));
    }
  };
  roots.forEach((r) => walk(path.join(root, r)));
  return files;
}

/**
 * Code in markdown (fenced blocks and inline spans) holds examples, not tags.
 * @param {string} text
 * @returns {string}
 */
function stripCode(text) {
  return stripFences(text).replace(/`[^`\n]*`/g, '');
}

/**
 * Drop fenced code blocks with CommonMark fence rules: a fence is 3+ backticks
 * or tildes (up to 3 spaces indent); it closes only on a line of the same
 * character, at least as long, with nothing else after it. An unclosed fence
 * runs to the end of the document.
 * @param {string} text
 * @returns {string}
 */
function stripFences(text) {
  const kept = [];
  let fence = null;
  for (const line of text.split('\n')) {
    if (fence === null) {
      const open = /^ {0,3}(`{3,}|~{3,})/.exec(line);
      if (open && !(open[1][0] === '`' && line.slice(open[0].length).includes('`'))) fence = open[1];
      else kept.push(line);
      continue;
    }
    const close = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(line);
    if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
  }
  return kept.join('\n');
}

/**
 * Harvest every annotation in the repo.
 * @param {string} [root] repository root (overridable for tests)
 * @returns {{ ids: Map<string, { file: string, coverage: string }[]>, implements: Map<string, string[]>, proves: Map<string, string[]> }}
 */
function harvest(root = ROOT) {
  const rel = (file) => path.relative(root, file);
  const ids = new Map();
  const implementsMap = new Map();
  const provesMap = new Map();
  const add = (map, key, value) => map.set(key, [...(map.get(key) || []), value]);

  for (const file of listFiles(root, SCAN.declare).filter((f) => f.endsWith('.md'))) {
    const text = stripCode(fs.readFileSync(file, 'utf8'));
    const coverage = (/\*\*Coverage\*\*:\s*([a-z]+)/.exec(text) || [])[1] || 'code';
    for (const [, id] of text.matchAll(ID_RE)) add(ids, id, { file: rel(file), coverage });
  }
  const collect = (roots, verb, map) => {
    for (const file of listFiles(root, roots)) {
      const text = fs.readFileSync(file, 'utf8');
      for (const [, list] of text.matchAll(REF_RE[verb])) {
        list
          .trim()
          .split(/\s+/)
          .forEach((id) => add(map, id, rel(file)));
      }
    }
  };
  collect(SCAN.implement, 'implements', implementsMap);
  collect(SCAN.prove, 'proves', provesMap);
  return { ids, implements: implementsMap, proves: provesMap };
}

/**
 * Turn harvested tags into findings.
 * @param {ReturnType<typeof harvest>} tags
 * @returns {{ errors: string[], warnings: string[], concepts: object[] }}
 */
function analyse(tags) {
  const errors = [];
  const warnings = [];
  const concepts = [];

  for (const [id, decls] of tags.ids) {
    if (decls.length > 1) errors.push(`duplicate @id ${id} in ${decls.map((d) => d.file).join(', ')}`);
    const { file, coverage } = decls[0];
    const impl = tags.implements.get(id) || [];
    const proof = tags.proves.get(id) || [];
    const isRule = id.startsWith(RULE_ID_PREFIX);
    const needsCode = coverage !== 'none';
    concepts.push({ id, file, coverage, implements: impl.length, proves: proof.length });

    if (needsCode && impl.length === 0) errors.push(`orphan decision ${id} (${file}): no @implements`);
    if (isRule && proof.length === 0) errors.push(`untested rule ${id} (${file}): no @proves`);
    if (!isRule && needsCode && proof.length === 0) warnings.push(`unproven concept ${id} (${file}): no @proves`);
  }
  for (const [verb, map] of [
    ['implements', tags.implements],
    ['proves', tags.proves],
  ]) {
    for (const [id, files] of map) {
      if (!tags.ids.has(id)) errors.push(`dead link @${verb} ${id} in ${[...new Set(files)].join(', ')}`);
    }
  }
  return { errors, warnings, concepts };
}

/**
 * Human-readable report.
 * @param {ReturnType<typeof analyse>} report
 * @returns {string}
 */
function format(report) {
  const rows = report.concepts
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(
      (c) =>
        `  ${c.id.padEnd(34)} impl ${String(c.implements).padStart(2)}  proves ${String(c.proves).padStart(2)}${c.coverage === 'none' ? '  (coverage: none)' : ''}`,
    );
  const lines = ['annotrace coverage', ...rows, ''];
  report.warnings.forEach((w) => lines.push(`warn  ${w}`));
  report.errors.forEach((e) => lines.push(`error ${e}`));
  lines.push(`${report.concepts.length} concepts, ${report.errors.length} errors, ${report.warnings.length} warnings`);
  return lines.join('\n');
}

if (require.main === module) {
  const args = new Set(process.argv.slice(2));
  const report = analyse(harvest());
  process.stdout.write(`${args.has('--json') ? JSON.stringify(report, null, 2) : format(report)}\n`);
  if (args.has('--strict') && report.errors.length > 0) process.exitCode = 1;
}

module.exports = { analyse, format, harvest, stripFences };
