import { basename } from 'path';

import { declare } from '@babel/helper-plugin-utils';
import template from '@babel/template';
import * as t from '@babel/types';
import jsxSyntax from '@babel/plugin-syntax-jsx';
import { unique } from '@compiled/utils';

import { visitClassNamesPath } from './class-names';
import { visitCssPropPath } from './css-prop';
import { visitStyledPath } from './styled';
import type { State } from './types';
import { appendRuntimeImports } from './utils/append-runtime-imports';
import {
  isCompiledCSSCallExpression,
  isCompiledCSSTaggedTemplateExpression,
  isCompiledKeyframesCallExpression,
  isCompiledKeyframesTaggedTemplateExpression,
  isCompiledStyledCallExpression,
  isCompiledStyledTaggedTemplateExpression,
} from './utils/ast';
import { Cache } from './utils/cache';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../package.json');

let globalCache: Cache | undefined;

export default declare<State>((api) => {
  api.assertVersion(7);

  return {
    name: packageJson.name,
    inherits: jsxSyntax,
    pre() {
      this.sheets = {};
      let cache: Cache;

      if (this.opts.cache === true) {
        globalCache = new Cache();
        cache = globalCache;
      } else {
        cache = new Cache();
      }

      cache.initialize({ ...this.opts, cache: !!this.opts.cache });

      this.cache = cache;
      this.includedFiles = [];
      this.pathsToCleanup = [];
    },
    visitor: {
      Program: {
        exit(path, state) {
          if (!state.compiledImports) {
            return;
          }

          const {
            opts: { importReact: shouldImportReact = true },
          } = state;

          if (shouldImportReact && !path.scope.getBinding('React')) {
            // React is missing - add it in at the last moment!
            path.unshiftContainer('body', template.ast(`import * as React from 'react'`));
          }

          if (state.compiledImports.styled && !path.scope.getBinding('forwardRef')) {
            // forwardRef is missing - add it in at the last moment!
            path.unshiftContainer('body', template.ast(`import { forwardRef } from 'react'`));
          }

          const filename = basename(state.filename ?? '') || 'File';
          const version = process.env.TEST_PKG_VERSION || packageJson.version;

          path.addComment('leading', ` ${filename} generated by ${packageJson.name} v${version} `);

          // Add a line break the comment
          path.unshiftContainer('body', t.noop());

          // Callback when included files have been added.
          if (this.includedFiles.length && this.opts.onIncludedFiles) {
            this.opts.onIncludedFiles(unique(this.includedFiles));
          }

          // Cleanup paths that have been marked.
          state.pathsToCleanup.forEach((clean) => {
            switch (clean.action) {
              case 'remove': {
                clean.path.remove();
                return;
              }

              case 'replace': {
                clean.path.replaceWith(t.nullLiteral());
                return;
              }

              default:
                return;
            }
          });
        },
      },
      ImportDeclaration(path, state) {
        if (path.node.source.value !== '@compiled/react') {
          return;
        }

        // The presence of the module enables CSS prop
        state.compiledImports = {};

        // Go through each import and enable each found API
        path.get('specifiers').forEach((specifier) => {
          if (!state.compiledImports || !specifier.isImportSpecifier()) {
            // Bail out early
            return;
          }

          (['styled', 'ClassNames', 'css', 'keyframes'] as const).forEach((apiName) => {
            if (
              state.compiledImports &&
              t.isIdentifier(specifier.node?.imported) &&
              specifier.node?.imported.name === apiName
            ) {
              // Enable the API with the local name
              state.compiledImports[apiName] = specifier.node.local.name;
            }
          });
        });

        appendRuntimeImports(path);
        path.remove();
      },
      TaggedTemplateExpression(path, state) {
        if (
          isCompiledCSSTaggedTemplateExpression(path.node, state) ||
          isCompiledKeyframesTaggedTemplateExpression(path.node, state)
        ) {
          state.pathsToCleanup.push({ path, action: 'replace' });
          return;
        }

        if (isCompiledStyledTaggedTemplateExpression(path.node, state)) {
          visitStyledPath(path, { context: 'root', state, parentPath: path });
          return;
        }
      },
      CallExpression(path, state) {
        if (
          isCompiledCSSCallExpression(path.node, state) ||
          isCompiledKeyframesCallExpression(path.node, state)
        ) {
          state.pathsToCleanup.push({ path, action: 'replace' });
          return;
        }

        if (isCompiledStyledCallExpression(path.node, state)) {
          visitStyledPath(path, { context: 'root', state, parentPath: path });
          return;
        }
      },
      JSXElement(path, state) {
        if (!state.compiledImports?.ClassNames) {
          return;
        }

        visitClassNamesPath(path, { context: 'root', state, parentPath: path });
      },
      JSXOpeningElement(path, state) {
        if (!state.compiledImports) {
          return;
        }

        visitCssPropPath(path, { context: 'root', state, parentPath: path });
      },
    },
  };
});
