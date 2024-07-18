import { AtomicGroups } from '../ac';
import ax from '../ax';

const atomicMap = new Map();
atomicMap.set('_aaaa', '_aaaabbbb');
atomicMap.set('_bbbb', '_bbbbcccc');

describe('ax', () => {
  const isEnabled: boolean = (() => false)();

  it.each([
    ['should handle empty array', [], undefined],
    ['should handle array with undefined', [undefined], undefined],
    ['should join single classes together', ['foo', 'bar'], 'foo bar'],
    ['should join multi classes together', ['foo baz', 'bar'], 'foo baz bar'],
    ['should remove undefined', ['foo', 'bar', undefined], 'foo bar'],
    [
      'should ensure the last atomic declaration of a single group wins',
      ['_aaaabbbb', '_aaaacccc'],
      '_aaaacccc',
    ],
    [
      'should ensure the last atomic declaration of many single groups wins',
      ['_aaaabbbb', '_aaaacccc', '_aaaadddd', '_aaaaeeee'],
      '_aaaaeeee',
    ],
    [
      'should ensure the last atomic declaration of a multi group wins',
      ['_aaaabbbb _aaaacccc'],
      '_aaaacccc',
    ],
    [
      'should ensure the last atomic declaration of many multi groups wins',
      ['_aaaabbbb _aaaacccc _aaaadddd _aaaaeeee'],
      '_aaaaeeee',
    ],
    [
      'should ensure the last atomic declaration of many multi groups with short class name wins',
      ['_aaaabbbb', '_aaaaaaa', '_ddddbbb', '_ddddcccc'],
      '_aaaaaaa _ddddcccc',
    ],
    [
      'should not remove any atomic declarations if there are no duplicate groups',
      ['_aaaabbbb', '_bbbbcccc'],
      '_aaaabbbb _bbbbcccc',
    ],
    ['should not apply conditional class', [isEnabled && 'foo', 'bar'], 'bar'],
    [
      'should ignore non atomic declarations',
      ['hello_there', 'hello_world'],
      'hello_there hello_world',
    ],
    [
      'should ignore non atomic declarations when atomic declarations exist',
      ['hello_there', 'hello_world', '_aaaabbbb'],
      'hello_there hello_world _aaaabbbb',
    ],
    [
      'should handle a nested AtomicGroups class',
      ['_aaaaaaaa', new AtomicGroups(atomicMap)],
      '_aaaabbbb _bbbbcccc',
    ],
    [
      'should handle a flat, nested array',
      // We don't directly handle array-like collected classes (they shouldn't exist with types), but it's easy to solve for
      ['_aaaabbbb', ['_bbbbaaaa', '_bbbbcccc'] as any],
      '_aaaabbbb _bbbbcccc',
    ],
  ])('%s', (_, params, result) => {
    expect(result).toEqual(ax(params));
  });
});
