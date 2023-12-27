import { transformSync as babelTransformSync } from '@babel/core';
import type { BabelFileResult } from '@babel/core';
import compiledBabelPlugin from '@compiled/babel-plugin';
import { format } from 'prettier';

import stripRuntimeBabelPlugin from '../index';
import type { BabelFileMetadata } from '../types';

// Mock out FS to avoid writing to disk
// We aren't processing the result anyway, so no need for specifying the response
jest.mock('fs');

const testStyleSheetPath =
  '@compiled/webpack-loader/css-loader!@compiled/webpack-loader/css-loader/compiled-css.css';
const regexToFindRequireStatements =
  /(require\('@compiled\/webpack-loader\/css-loader!@compiled\/webpack-loader\/css-loader\/compiled-css\.css\?style=.*;)/g;
const testSSR = true;

const transformSync = (
  code: string,
  opts: {
    styleSheetPath?: string;
    compiledRequireExclude?: boolean;
    run: 'both' | 'bake' | 'extract';
    runtime: 'automatic' | 'classic';
    extractStylesToDirectory?: { source: string; dest: string };
    babelJSXPragma?: string;
  }
): BabelFileResult | null => {
  const { styleSheetPath, compiledRequireExclude, run, runtime, extractStylesToDirectory } = opts;
  const bake = run === 'both' || run === 'bake';
  const extract = run === 'both' || run === 'extract';

  return babelTransformSync(code, {
    babelrc: false,
    configFile: false,
    filename: '/base/src/app.tsx',
    generatorOpts: {
      sourceFileName: '../src/app.tsx',
    },
    plugins: [
      ...(bake
        ? [[compiledBabelPlugin, { importReact: runtime === 'classic', optimizeCss: false }]]
        : []),
      ...(extract
        ? [
            [
              stripRuntimeBabelPlugin,
              { styleSheetPath, compiledRequireExclude, extractStylesToDirectory },
            ],
          ]
        : []),
    ],
    presets: [
      [
        '@babel/preset-react',
        {
          runtime,
          ...(opts.babelJSXPragma ? { pragma: opts.babelJSXPragma } : {}),
        },
      ],
    ],
  });
};

const transform = (
  c: string,
  opts: {
    styleSheetPath?: string;
    compiledRequireExclude?: boolean;
    run: 'both' | 'bake' | 'extract';
    runtime: 'automatic' | 'classic';
    extractStylesToDirectory?: { source: string; dest: string };
    babelJSXPragma?: string;
  }
): string => {
  const fileResult = transformSync(c, opts);

  if (!fileResult || !fileResult.code) {
    throw new Error(`Missing fileResult: ${fileResult}`);
  }

  return format(fileResult.code, {
    parser: 'babel',
    singleQuote: true,
  });
};

// This test suite is designed to test source code, which is also known as first-party code
describe('babel-plugin-strip-runtime using source code', () => {
  const code = `
    import '@compiled/react';

    const Component = () => (
      <div css={{ fontSize: 12, color: 'blue' }}>
        hello world
      </div>
    );
  `;

  describe('when run in the same step', () => {
    describe('with the automatic runtime', () => {
      const runtime = 'automatic';

      it('removes the css prop runtime', () => {
        const actual = transform(code, { run: 'both', runtime });

        expect(actual).toMatchInlineSnapshot(`
          "/* app.tsx generated by @compiled/babel-plugin v0.0.0 */
          import { ax, ix } from '@compiled/react/runtime';
          import { jsxs as _jsxs } from 'react/jsx-runtime';
          import { jsx as _jsx } from 'react/jsx-runtime';
          const Component = () =>
            /*#__PURE__*/ _jsx('div', {
              className: ax(['_1wyb1fwx _syaz13q2']),
              children: 'hello world',
            });
          "
        `);
      });

      it('adds require statement for every found style', () => {
        const actual = transform(code, {
          styleSheetPath: testStyleSheetPath,
          run: 'both',
          runtime,
        });

        expect(actual.match(regexToFindRequireStatements)).toEqual([
          `require('${testStyleSheetPath}?style=._syaz13q2%7Bcolor%3Ablue%7D');`,
          `require('${testStyleSheetPath}?style=._1wyb1fwx%7Bfont-size%3A12px%7D');`,
        ]);
      });

      it('does not add require statement in a node environment', () => {
        const actual = transform(code, {
          styleSheetPath: testStyleSheetPath,
          compiledRequireExclude: testSSR,
          run: 'both',
          runtime,
        });

        expect(actual.match(regexToFindRequireStatements)).toEqual(null);
      });

      it('adds styleRules to metadata in a node environment', () => {
        const actual = transformSync(code, {
          styleSheetPath: testStyleSheetPath,
          compiledRequireExclude: testSSR,
          run: 'both',
          runtime,
        });

        const metadata = actual?.metadata as BabelFileMetadata;

        expect(metadata).toEqual({
          styleRules: ['._1wyb1fwx{font-size:12px}', '._syaz13q2{color:blue}'],
        });
      });
    });

    describe('with the classic runtime', () => {
      const runtime = 'classic';

      it('removes the css prop runtime', () => {
        const actual = transform(code, { run: 'both', runtime });

        expect(actual).toMatchInlineSnapshot(`
          "/* app.tsx generated by @compiled/babel-plugin v0.0.0 */
          import * as React from 'react';
          import { ax, ix } from '@compiled/react/runtime';
          const Component = () =>
            /*#__PURE__*/ React.createElement(
              'div',
              {
                className: ax(['_1wyb1fwx _syaz13q2']),
              },
              'hello world'
            );
          "
        `);
      });

      it('adds require statement for every found style', () => {
        const actual = transform(code, {
          styleSheetPath: testStyleSheetPath,
          run: 'both',
          runtime,
        });

        expect(actual.match(regexToFindRequireStatements)).toEqual([
          `require('${testStyleSheetPath}?style=._syaz13q2%7Bcolor%3Ablue%7D');`,
          `require('${testStyleSheetPath}?style=._1wyb1fwx%7Bfont-size%3A12px%7D');`,
        ]);
      });

      it('does not add require statement in a node environment', () => {
        const actual = transform(code, {
          styleSheetPath: testStyleSheetPath,
          compiledRequireExclude: testSSR,
          run: 'both',
          runtime,
        });

        expect(actual.match(regexToFindRequireStatements)).toEqual(null);
      });

      it('adds styleRules to metadata in a node environment', () => {
        const actual = transformSync(code, {
          styleSheetPath: testStyleSheetPath,
          compiledRequireExclude: testSSR,
          run: 'both',
          runtime,
        });

        const metadata = actual?.metadata as BabelFileMetadata;

        expect(metadata).toEqual({
          styleRules: ['._1wyb1fwx{font-size:12px}', '._syaz13q2{color:blue}'],
        });
      });

      it('adds styles to directory', () => {
        const actual = transform(code, {
          run: 'both',
          runtime,
          extractStylesToDirectory: { source: 'src/', dest: 'dist/' },
        });

        expect(actual).toMatchInlineSnapshot(`
          "/* app.tsx generated by @compiled/babel-plugin v0.0.0 */
          import './app.compiled.css';
          import * as React from 'react';
          import { ax, ix } from '@compiled/react/runtime';
          const Component = () =>
            /*#__PURE__*/ React.createElement(
              'div',
              {
                className: ax(['_1wyb1fwx _syaz13q2']),
              },
              'hello world'
            );
          "
        `);
      });

      it('error when source directory is not found', () => {
        expect(() =>
          transform(code, {
            run: 'both',
            runtime,
            extractStylesToDirectory: { source: 'not-existing-src/', dest: 'dist/' },
          })
        ).toThrowWithMessage(
          Error,
          `/base/src/app.tsx: Source directory 'not-existing-src/' was not found relative to source file ('../src/app.tsx')`
        );
      });
    });

    describe('with jsx pragma', () => {
      it('work with classic jsx pragma', () => {
        const codeWithPragma = `
          /** @jsx jsx */
          import { css, jsx } from '@compiled/react';

          const Component = () => (
            <div css={{ fontSize: 12, color: 'blue' }}>
              hello world 2
            </div>
          );

          const Component2 = () => (
            <div css={css({ fontSize: 12, color: 'pink' })}>
              hello world 2
            </div>
          );
        `;

        const actual = transform(codeWithPragma, {
          run: 'both',
          runtime: 'classic',
        });

        expect(actual).toMatchInlineSnapshot(`
          "/* app.tsx generated by @compiled/babel-plugin v0.0.0 */
          import * as React from 'react';
          import { ax, ix } from '@compiled/react/runtime';
          const Component = () =>
            /*#__PURE__*/ React.createElement(
              'div',
              {
                className: ax(['_1wyb1fwx _syaz13q2']),
              },
              'hello world 2'
            );
          const Component2 = () =>
            /*#__PURE__*/ React.createElement(
              'div',
              {
                className: ax(['_1wyb1fwx _syaz32ev']),
              },
              'hello world 2'
            );
          "
        `);
      });

      it('work with classic jsx pragma (custom import)', () => {
        const codeWithPragma = `
          /** @jsx myJsx */
          import { css, jsx as myJsx } from '@compiled/react';

          const Component = () => (
            <div css={{ fontSize: 12, color: 'blue' }}>
              hello world 2
            </div>
          );

          const Component2 = () => (
            <div css={css({ fontSize: 12, color: 'pink' })}>
              hello world 2
            </div>
          );
        `;

        const actual = transform(codeWithPragma, {
          run: 'both',
          runtime: 'classic',
        });

        expect(actual).toMatchInlineSnapshot(`
          "/* app.tsx generated by @compiled/babel-plugin v0.0.0 */
          import * as React from 'react';
          import { ax, ix } from '@compiled/react/runtime';
          const Component = () =>
            /*#__PURE__*/ React.createElement(
              'div',
              {
                className: ax(['_1wyb1fwx _syaz13q2']),
              },
              'hello world 2'
            );
          const Component2 = () =>
            /*#__PURE__*/ React.createElement(
              'div',
              {
                className: ax(['_1wyb1fwx _syaz32ev']),
              },
              'hello world 2'
            );
          "
        `);
      });

      it('throws if pragma is set in babel config', () => {
        const codeWithPragma = `
          /** @jsx jsx */
          import { css, jsx } from '@compiled/react';

          const Component = () => (
            <div css={{ fontSize: 12, color: 'blue' }}>
              hello world 2
            </div>
          );

          const Component2 = () => (
            <div css={css({ fontSize: 12, color: 'pink' })}>
              hello world 2
            </div>
          );
        `;

        expect(() =>
          transform(codeWithPragma, {
            run: 'both',
            runtime: 'classic',
            babelJSXPragma: 'jsx',
          })
        ).toThrow();
      });

      it('throws if pragma is set in babel config (custom import)', () => {
        const codeWithPragma = `
          /** @jsx myJsx */
          import { css, jsx as myJsx } from '@compiled/react';

          const Component = () => (
            <div css={{ fontSize: 12, color: 'blue' }}>
              hello world 2
            </div>
          );

          const Component2 = () => (
            <div css={css({ fontSize: 12, color: 'pink' })}>
              hello world 2
            </div>
          );
        `;

        expect(() =>
          transform(codeWithPragma, {
            run: 'both',
            runtime: 'classic',
            babelJSXPragma: 'myJsx',
          })
        ).toThrow();
      });

      it("doesn't do anything to emotion's classic jsx pragma", () => {
        const codeWithPragma = `
          /** @jsx jsx */
          import { css, jsx } from '@emotion/react';

          const Component = () => (
            <div css={{ fontSize: 12, color: 'blue' }}>
              hello world 2
            </div>
          );

          const Component2 = () => (
            <div css={css({ fontSize: 12, color: 'pink' })}>
              hello world 2
            </div>
          );
        `;

        const actual = transform(codeWithPragma, {
          run: 'both',
          runtime: 'classic',
        });

        expect(actual).toMatchInlineSnapshot(`
          "/** @jsx jsx */
          import { css, jsx } from '@emotion/react';
          const Component = () =>
            jsx(
              'div',
              {
                css: {
                  fontSize: 12,
                  color: 'blue',
                },
              },
              'hello world 2'
            );
          const Component2 = () =>
            jsx(
              'div',
              {
                css: css({
                  fontSize: 12,
                  color: 'pink',
                }),
              },
              'hello world 2'
            );
          "
        `);
      });

      it("doesn't do anything to emotion's classic jsx pragma (custom import)", () => {
        const codeWithPragma = `
          /** @jsx myJsx */
          import { css, jsx as myJsx } from '@emotion/react';

          const Component = () => (
            <div css={{ fontSize: 12, color: 'blue' }}>
              hello world 2
            </div>
          );

          const Component2 = () => (
            <div css={css({ fontSize: 12, color: 'pink' })}>
              hello world 2
            </div>
          );
        `;

        const actual = transform(codeWithPragma, {
          run: 'both',
          runtime: 'classic',
        });

        expect(actual).toMatchInlineSnapshot(`
          "/** @jsx myJsx */
          import { css, jsx as myJsx } from '@emotion/react';
          const Component = () =>
            myJsx(
              'div',
              {
                css: {
                  fontSize: 12,
                  color: 'blue',
                },
              },
              'hello world 2'
            );
          const Component2 = () =>
            myJsx(
              'div',
              {
                css: css({
                  fontSize: 12,
                  color: 'pink',
                }),
              },
              'hello world 2'
            );
          "
        `);
      });

      it('work with automatic jsx pragma', () => {
        const codeWithPragma = `
          /** @jsxImportSource @compiled/react */
          import { css } from '@compiled/react';

          const Component = () => (
            <div css={{ fontSize: 12, color: 'blue' }}>
              hello world 2
            </div>
          );

          const Component2 = () => (
            <div css={css({ fontSize: 12, color: 'pink' })}>
              hello world 2
            </div>
          );
        `;

        const actual = transform(codeWithPragma, {
          run: 'both',
          runtime: 'automatic',
        });

        expect(actual).toMatchInlineSnapshot(`
          "/* app.tsx generated by @compiled/babel-plugin v0.0.0 */
          import { ax, ix } from '@compiled/react/runtime';
          import { jsxs as _jsxs } from '@compiled/react/jsx-runtime';
          import { jsx as _jsx } from '@compiled/react/jsx-runtime';
          /** @jsxImportSource @compiled/react */

          const Component = () =>
            _jsx('div', {
              className: ax(['_1wyb1fwx _syaz13q2']),
              children: 'hello world 2',
            });
          const Component2 = () =>
            _jsx('div', {
              className: ax(['_1wyb1fwx _syaz32ev']),
              children: 'hello world 2',
            });
          "
        `);
      });

      it("doesn't do anything to emotion's automatic jsx pragma", () => {
        const codeWithPragma = `
          /** @jsxImportSource @emotion/react */
          import { css } from '@emotion/react';

          const Component = () => (
            <div css={{ fontSize: 12, color: 'blue' }}>
              hello world 2
            </div>
          );

          const Component2 = () => (
            <div css={css({ fontSize: 12, color: 'pink' })}>
              hello world 2
            </div>
          );
        `;

        const actual = transform(codeWithPragma, {
          run: 'both',
          runtime: 'automatic',
        });

        expect(actual).toMatchInlineSnapshot(`
          "/** @jsxImportSource @emotion/react */
          import { css } from '@emotion/react';
          import { jsx as _jsx } from '@emotion/react/jsx-runtime';
          const Component = () =>
            _jsx('div', {
              css: {
                fontSize: 12,
                color: 'blue',
              },
              children: 'hello world 2',
            });
          const Component2 = () =>
            _jsx('div', {
              css: css({
                fontSize: 12,
                color: 'pink',
              }),
              children: 'hello world 2',
            });
          "
        `);
      });

      it('work with classic jsx pragma with extractStylesToDirectory', () => {
        const codeWithPragma = `
          /** @jsx myJsx */
          import { css, jsx as myJsx } from '@compiled/react';

          const Component = () => (
            <div css={{ fontSize: 12, color: 'blue' }}>
              hello world 2
            </div>
          );

          const Component2 = () => (
            <div css={css({ fontSize: 12, color: 'pink' })}>
              hello world 2
            </div>
          );
        `;

        const actual = transform(codeWithPragma, {
          run: 'both',
          runtime: 'classic',
          extractStylesToDirectory: { source: 'src/', dest: 'dist/' },
        });

        expect(actual).toMatchInlineSnapshot(`
          "/* app.tsx generated by @compiled/babel-plugin v0.0.0 */
          import './app.compiled.css';
          import * as React from 'react';
          import { ax, ix } from '@compiled/react/runtime';
          const Component = () =>
            /*#__PURE__*/ React.createElement(
              'div',
              {
                className: ax(['_1wyb1fwx _syaz13q2']),
              },
              'hello world 2'
            );
          const Component2 = () =>
            /*#__PURE__*/ React.createElement(
              'div',
              {
                className: ax(['_1wyb1fwx _syaz32ev']),
              },
              'hello world 2'
            );
          "
        `);
      });

      it('work with automatic jsx pragma with extractStylesToDirectory', () => {
        const codeWithPragma = `
          /** @jsxImportSource @compiled/react */
          import { css } from '@compiled/react';

          const Component = () => (
            <div css={{ fontSize: 12, color: 'blue' }}>
              hello world 2
            </div>
          );

          const Component2 = () => (
            <div css={css({ fontSize: 12, color: 'pink' })}>
              hello world 2
            </div>
          );
        `;

        const actual = transform(codeWithPragma, {
          run: 'both',
          runtime: 'automatic',
          extractStylesToDirectory: { source: 'src/', dest: 'dist/' },
        });

        expect(actual).toMatchInlineSnapshot(`
          "/* app.tsx generated by @compiled/babel-plugin v0.0.0 */
          import './app.compiled.css';
          import { ax, ix } from '@compiled/react/runtime';
          import { jsxs as _jsxs } from '@compiled/react/jsx-runtime';
          import { jsx as _jsx } from '@compiled/react/jsx-runtime';
          /** @jsxImportSource @compiled/react */

          const Component = () =>
            _jsx('div', {
              className: ax(['_1wyb1fwx _syaz13q2']),
              children: 'hello world 2',
            });
          const Component2 = () =>
            _jsx('div', {
              className: ax(['_1wyb1fwx _syaz32ev']),
              children: 'hello world 2',
            });
          "
        `);
      });
    });
  });

  describe('when run in subsequent steps', () => {
    describe('with the automatic runtime', () => {
      const runtime = 'automatic';

      it('removes the css prop runtime', () => {
        const baked = transform(code, { run: 'bake', runtime });
        const actual = transform(baked, { run: 'extract', runtime });

        expect(actual).toMatchInlineSnapshot(`
          "/* app.tsx generated by @compiled/babel-plugin v0.0.0 */
          import { ax, ix } from '@compiled/react/runtime';
          import { jsxs as _jsxs } from 'react/jsx-runtime';
          import { jsx as _jsx } from 'react/jsx-runtime';
          const Component = () =>
            /*#__PURE__*/ _jsx('div', {
              className: ax(['_1wyb1fwx _syaz13q2']),
              children: 'hello world',
            });
          "
        `);
      });

      it('adds require statement for every found style', () => {
        const baked = transform(code, { run: 'bake', runtime });
        const actual = transform(baked, {
          styleSheetPath: testStyleSheetPath,
          run: 'extract',
          runtime,
        });

        expect(actual.match(regexToFindRequireStatements)).toEqual([
          `require('${testStyleSheetPath}?style=._syaz13q2%7Bcolor%3Ablue%7D');`,
          `require('${testStyleSheetPath}?style=._1wyb1fwx%7Bfont-size%3A12px%7D');`,
        ]);
      });

      it('does not add require statement in a node environment', () => {
        const baked = transform(code, { run: 'bake', runtime });
        const actual = transform(baked, {
          styleSheetPath: testStyleSheetPath,
          compiledRequireExclude: testSSR,
          run: 'extract',
          runtime,
        });

        expect(actual.match(regexToFindRequireStatements)).toEqual(null);
      });

      it('adds styleRules to metadata in a node environment', () => {
        const baked = transform(code, { run: 'bake', runtime });
        const actual = transformSync(baked, {
          styleSheetPath: testStyleSheetPath,
          compiledRequireExclude: testSSR,
          run: 'extract',
          runtime,
        });

        const metadata = actual?.metadata as BabelFileMetadata;

        expect(metadata).toEqual({
          styleRules: ['._1wyb1fwx{font-size:12px}', '._syaz13q2{color:blue}'],
        });
      });
    });

    describe('with the classic runtime', () => {
      const runtime = 'classic';

      it('remove the css prop runtime', () => {
        const baked = transform(code, { run: 'bake', runtime });
        const actual = transform(baked, { run: 'extract', runtime });

        expect(actual).toMatchInlineSnapshot(`
          "/* app.tsx generated by @compiled/babel-plugin v0.0.0 */
          import * as React from 'react';
          import { ax, ix } from '@compiled/react/runtime';
          const Component = () =>
            /*#__PURE__*/ React.createElement(
              'div',
              {
                className: ax(['_1wyb1fwx _syaz13q2']),
              },
              'hello world'
            );
          "
        `);
      });

      it('adds require statement for every found style', () => {
        const baked = transform(code, { run: 'bake', runtime });
        const actual = transform(baked, {
          styleSheetPath: testStyleSheetPath,
          run: 'extract',
          runtime,
        });

        expect(actual.match(regexToFindRequireStatements)).toEqual([
          `require('${testStyleSheetPath}?style=._syaz13q2%7Bcolor%3Ablue%7D');`,
          `require('${testStyleSheetPath}?style=._1wyb1fwx%7Bfont-size%3A12px%7D');`,
        ]);
      });

      it('does not add require statement in a node environment', () => {
        const baked = transform(code, { run: 'bake', runtime });
        const actual = transform(baked, {
          styleSheetPath: testStyleSheetPath,
          compiledRequireExclude: testSSR,
          run: 'extract',
          runtime,
        });

        expect(actual.match(regexToFindRequireStatements)).toEqual(null);
      });

      it('adds styleRules to metadata in a node environment', () => {
        const baked = transform(code, { run: 'bake', runtime });
        const actual = transformSync(baked, {
          styleSheetPath: testStyleSheetPath,
          compiledRequireExclude: testSSR,
          run: 'extract',
          runtime,
        });

        const metadata = actual?.metadata as BabelFileMetadata;

        expect(metadata).toEqual({
          styleRules: ['._1wyb1fwx{font-size:12px}', '._syaz13q2{color:blue}'],
        });
      });
    });
  });
});
