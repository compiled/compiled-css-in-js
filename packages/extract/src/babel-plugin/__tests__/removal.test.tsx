import { transformSync } from '@babel/core';
import reactBabelPlugin from '@compiled/babel-plugin';
import extractBabelPlugin from '../index';

const transform = (
  opts: { runtime: 'automatic' | 'classic'; run: 'bake' | 'extract' | 'both' } = {
    runtime: 'classic',
    run: 'both',
  }
) => (code: TemplateStringsArray | string) => {
  const runBoth = opts.run === 'both';
  const runBake = runBoth || opts.run === 'bake';
  const runExtract = runBoth || opts.run === 'extract';

  const plugins = [
    runBake && [reactBabelPlugin, { importReact: opts.runtime === 'classic' }],
    runExtract && extractBabelPlugin,
  ].filter(Boolean);

  return transformSync(typeof code === 'string' ? code : code[0], {
    configFile: false,
    babelrc: false,
    presets: [['@babel/preset-react', { runtime: opts.runtime }]],
    plugins: plugins,
  })?.code;
};

describe('removal behaviour', () => {
  describe('when ran in the same step', () => {
    it('should remove CSS prop runtime when classic runtime', () => {
      const actual = transform()`
        import '@compiled/react';

        const Component = () => <div css={{ fontSize: 12, color: 'blue' }}>hello world</div>
      `;

      expect(actual).toMatchInlineSnapshot(`
        "/* File generated by @compiled/babel-plugin v0.0.0 */

        import * as React from 'react';
        import { ax, ix } from \\"@compiled/react/runtime\\";

        const Component = () => /*#__PURE__*/React.createElement(\\"div\\", {
          className: ax([\\"_1wyb1fwx _syaz13q2\\"])
        }, \\"hello world\\");"
      `);
    });

    it('should remove CSS prop runtime when automatic runtime', () => {
      const actual = transform({ runtime: 'automatic', run: 'both' })`
        import '@compiled/react';

        const Component = () => <div css={{ fontSize: 12, color: 'blue' }}>hello world</div>
      `;

      expect(actual).toMatchInlineSnapshot(`
        "/* File generated by @compiled/babel-plugin v0.0.0 */
        import { jsx as _jsx } from \\"react/jsx-runtime\\";
        import { jsxs as _jsxs } from \\"react/jsx-runtime\\";

        import { ax, ix } from \\"@compiled/react/runtime\\";

        const Component = () => /*#__PURE__*/_jsx(\\"div\\", {
          className: ax([\\"_1wyb1fwx _syaz13q2\\"]),
          children: \\"hello world\\"
        });"
      `);
    });
  });

  describe('when ran in subsequent steps', () => {
    it('should remove CSS prop runtime when classic runtime', () => {
      const baked = transform({ runtime: 'classic', run: 'bake' })`
        import '@compiled/react';

        const Component = () => <div css={{ fontSize: 12, color: 'blue' }}>hello world</div>
      `;

      const actual = transform({ runtime: 'classic', run: 'extract' })(baked);

      expect(actual).toMatchInlineSnapshot(`
        "/* File generated by @compiled/babel-plugin v0.0.0 */
        import * as React from 'react';
        import { ax, ix } from \\"@compiled/react/runtime\\";

        const Component = () => /*#__PURE__*/React.createElement(\\"div\\", {
          className: ax([\\"_1wyb1fwx _syaz13q2\\"])
        }, \\"hello world\\");"
      `);
    });

    it('should remove CSS prop runtime when automatic runtime', () => {
      const baked = transform({ runtime: 'automatic', run: 'bake' })`
        import '@compiled/react';

        const Component = () => <div css={{ fontSize: 12, color: 'blue' }}>hello world</div>
      `;

      const actual = transform({ runtime: 'automatic', run: 'extract' })(baked);

      // TODO: This is missing the PURE pragma in the Component return. Fix this.
      expect(actual).toMatchInlineSnapshot(`
        "/* File generated by @compiled/babel-plugin v0.0.0 */
        import { jsx as _jsx } from \\"react/jsx-runtime\\";
        import { jsxs as _jsxs } from \\"react/jsx-runtime\\";
        import { ax, ix } from \\"@compiled/react/runtime\\";

        const Component = () => _jsx(\\"div\\", {
          className: ax([\\"_1wyb1fwx _syaz13q2\\"]),
          children: \\"hello world\\"
        });"
      `);
    });
  });
});
