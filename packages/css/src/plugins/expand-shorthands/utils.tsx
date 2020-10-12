import { Node } from 'postcss-values-parser';

/**
 * Common global values
 */
export const globalValues = ['inherit', 'initial', 'unset'];

/**
 * Returns `true` if the node is a color,
 * else `false`.
 *
 * @param node
 */
export const isColor = (node: Node) => {
  if (node.type === 'word' && node.isColor) {
    return true;
  }

  return false;
};

/**
 * Returns `true` if the node is a width,
 * else `false`.
 *
 * @param node
 */
export const isWidth = (node: Node) => {
  if (node.type === 'numeric') {
    if (['px', 'rem', 'em', '%'].includes(node.unit)) {
      return true;
    }
  }

  return false;
};

/**
 * Returns calculated width of a node.
 *
 * @param node
 */
export const getWidth = (node: Node) => {
  if (node.type === 'numeric') {
    return `${node.value}${node.unit}`;
  }

  if (node.type === 'word') {
    return node.value;
  }

  return undefined;
};
