import postcss, { Plugin } from 'postcss';
import whitespace from 'postcss-normalize-whitespace';
import autoprefixer from 'autoprefixer';
import { atomicifyRules } from '../atomicify-rules';

const transform = (cssOrPlugins: TemplateStringsArray | Plugin<any>[]) => {
  const result = postcss([atomicifyRules(), whitespace]).process(cssOrPlugins[0], {
    from: undefined,
  });

  return result.css;
};

describe('atomicify rules', () => {
  it('should atomicify a single declaration', () => {
    const actual = transform`
      color: blue;
    `;

    expect(actual).toMatchInlineSnapshot(`"._1doq13q2{color:blue}"`);
  });

  it('should should atomicify multiple declarations', () => {
    const actual = transform`
      color: blue;
      font-size: 12px;
    `;

    expect(actual).toMatchInlineSnapshot(`"._1doq13q2{color:blue}._36l61fwx{font-size:12px}"`);
  });

  it('should autoprefix atomic rules', () => {
    process.env.BROWSERSLIST = 'Edge 16';

    const result = postcss([atomicifyRules(), whitespace, autoprefixer]).process(
      'user-select: none;',
      {
        from: undefined,
      }
    );

    expect(result.css).toMatchInlineSnapshot(`"._q4hxglyw{-ms-user-select:none;user-select:none}"`);
  });

  it('should callback with created class names', () => {
    const classes: string[] = [];
    const callback = (className: string) => {
      classes.push(className);
    };

    const result = postcss([atomicifyRules({ callback }), whitespace, autoprefixer]).process(
      'display:block;text-align:center;',
      {
        from: undefined,
      }
    );

    result.css;

    expect(classes).toMatchInlineSnapshot(`
      Array [
        "_dj7i1ule",
        "_o3nk1h6o",
      ]
    `);
  });

  it('should atomicify a nested tag rule', () => {
    const actual = transform`
      div {
        color: blue;
      }
    `;

    expect(actual).toMatchInlineSnapshot(`"._k2hc13q2 div{color:blue}"`);
  });

  it('should atomicify a nested tag rule', () => {
    const actual = transform`
      div {
        color: blue;
      }
    `;

    expect(actual).toMatchInlineSnapshot(`"._k2hc13q2 div{color:blue}"`);
  });

  it('should generate the same class hash for semantically same but different rules', () => {
    const firstActual = transform`
      &:first-child {
        color: blue;
      }
    `;
    const secondActual = transform`
      :first-child {
        color: blue;
      }
    `;

    const expected = '._roi113q2:first-child{color:blue}';
    expect(firstActual).toEqual(expected);
    expect(secondActual).toEqual(expected);
  });

  it('should behind reversed nesting', () => {
    const actual = transform`
      :first-child & {
        color: hotpink;
      }
    `;

    expect(actual).toMatchInlineSnapshot(`"._1qab1q9v:first-child ._1qab1q9v{color:hotpink}"`);
  });

  it('should reference the atomic class with the nesting selector', () => {
    const actual = transform`
      & :first-child {
        color: blue;
      }
    `;

    expect(actual).toMatchInlineSnapshot(`"._p9sj13q2 :first-child{color:blue}"`);
  });

  it('should atomicify a double tag rule', () => {
    const actual = transform`
      div span {
        color: blue;
      }
    `;

    expect(actual).toMatchInlineSnapshot(`"._m59i13q2 div span{color:blue}"`);
  });

  it('should atomicify a double tag with pseudos rule', () => {
    const actual = transform`
      div:hover span:active {
        color: blue;
      }
    `;

    expect(actual).toMatchInlineSnapshot(`"._107g13q2 div:hover span:active{color:blue}"`);
  });

  it('should atomicify a nested tag pseudo rule', () => {
    const actual = transform`
      div:hover {
        color: blue;
      }
    `;

    expect(actual).toMatchInlineSnapshot(`"._5tvz13q2 div:hover{color:blue}"`);
  });

  it('should blow up if a doubly nested rule was found', () => {
    expect(() => {
      transform`
        div {
          div {
            font-size: 12px;
          }
        }
      `;
    }).toThrow('atomicify-rules: <css input>:3:11: Nested rules are not allowed.');
  });

  xit('should atomicify at rule styles', () => {
    const actual = transform`
      @media (min-width: 30rem) {
        display: block;
      }
    `;

    expect(actual).toMatchInlineSnapshot(`".not yet"`);
  });

  xit('should atomicify nested at rule styles', () => {
    const actual = transform`
      @media (min-width: 30rem) {
        @media (min-width: 20rem) {
          display: block;
        }
      }
    `;

    expect(actual).toMatchInlineSnapshot(`".not yet"`);
  });

  xit('should atomicify at rule nested styles', () => {
    const actual = transform`
      @media (min-width: 30rem) {
        div {
          display: block;
        }
      }
    `;

    expect(actual).toMatchInlineSnapshot(`".not yet"`);
  });

  xit('should atomicify double nested at rule nested styles', () => {
    const actual = transform`
      @media (min-width: 30rem) {
        @media (min-width: 20rem) {
          div {
            display: block;
          }
        }
      }
    `;

    expect(actual).toMatchInlineSnapshot(`".not yet"`);
  });
});
