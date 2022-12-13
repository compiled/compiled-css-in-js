import { toBoolean } from '@compiled/utils';
import type { Plugin, ChildNode, Declaration, Container, Rule, AtRule } from 'postcss';
import { rule } from 'postcss';

interface PluginOpts {
  callback?: (className: string) => void;
}

interface AtomicifyOpts extends PluginOpts {
  selectors?: string[];
  atRule?: string;
  parentNode?: Container;
}

/**
 * Returns an atomic rule class name using this form:
 *
 * ```
 * "_{atrulesselectorspropertyname}{propertyvalueimportant}"
 * ```
 *
 * Atomic rules are always prepended with an underscore.
 *
 * @param node CSS declaration
 * @param opts AtomicifyOpts
 */

 const nonCssSafeCharacters = /[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~\s]/;

const devHash = (str: string | undefined) => {
  if (typeof str !== 'string') {
    return ''
  }

  return str.trim().replace(
    new RegExp(nonCssSafeCharacters, 'g'),
    '-'
  )
}

const atomicClassName = (node: Declaration, opts: AtomicifyOpts) => {
  const selectors = opts.selectors ? opts.selectors.join('') : '';
  const hashed = [devHash(opts.atRule), devHash(selectors), devHash(node.prop), devHash(node.value), node.important && 'important'].filter(g => toBoolean(g) && g != '-').join('-');

  return `c_${hashed}`;
};

/**
 * Returns a normalized selector.
 * The primary function is to get rid of white space and to place a nesting selector if one is missing.
 * If the selector already has a nesting selector - we won't do anything to it.
 *
 * ---
 * ASSUMPTION: Nesting and parent orphaned pseudos plugins should run before the atomicify plugin!
 * ---
 *
 * @param selector
 */
const normalizeSelector = (selector: string | undefined) => {
  if (!selector) {
    // Nothing to see here - return early with a nesting selector!
    return '&';
  }

  // We want to build a consistent selector that we will use to generate the group hash.
  // Because of that we trim whitespace.
  const trimmed = selector.trim();
  if (trimmed.indexOf('&') === -1) {
    return `& ${trimmed}`;
  }

  return trimmed;
};

/**
 * Replaces all instances of a nesting operator `&` with the parent class name.
 *
 * @param selector
 * @param parentClassName
 */
const replaceNestingSelector = (selector: string, parentClassName: string) => {
  return selector.replace(/&/g, `.${parentClassName}`);
};

/**
 * Builds an atomic rule selector.
 *
 * @param node
 */
const buildAtomicSelector = (node: Declaration, opts: AtomicifyOpts) => {
  const selectors: string[] = [];

  (opts.selectors || ['']).forEach((selector) => {
    const normalizedSelector = normalizeSelector(selector);
    const className = atomicClassName(node, {
      ...opts,
      selectors: [normalizedSelector],
    });
    const replacedSelector = replaceNestingSelector(normalizedSelector, className);

    selectors.push(replacedSelector);

    if (opts.callback) {
      opts.callback(className);
    }
  });

  return selectors.join(', ');
};

/**
 * Transforms a declaration into an atomic rule.
 *
 * @param node
 * @param opts
 */
const atomicifyDecl = (node: Declaration, opts: AtomicifyOpts) => {
  const selector = buildAtomicSelector(node, opts);
  const newDecl = node.clone({
    raws: { before: '', value: { value: '', raw: '' }, between: '' },
  });
  const newRule = rule({
    raws: { before: '', after: '', between: '', selector: { raw: '', value: '' } },
    nodes: [newDecl],
    selector,
  });

  // We need to link the new node to a parent else autoprefixer blows up.
  newDecl.parent = newRule;
  newRule.parent = opts.parentNode!;

  return newRule;
};

/**
 * Transforms a rule into atomic rules.
 *
 * @param node
 * @param opts
 */
const atomicifyRule = (node: Rule, opts: AtomicifyOpts): Rule[] => {
  if (!node.nodes) {
    return [];
  }

  return node.nodes
    .map((childNode) => {
      if (childNode.type === 'rule') {
        throw childNode.error(
          'Nested rules need to be flattened first - run the "postcss-nested" plugin before this.'
        );
      }

      if (childNode.type !== 'decl') {
        return undefined;
      }

      return atomicifyDecl(childNode, {
        ...opts,
        selectors: node.selectors,
      });
    })
    .filter((child): child is Rule => !!child);
};

/**
 * Transforms an atrule into atomic rules.
 *
 * @param node
 * @param opts
 */
const atomicifyAtRule = (node: AtRule, opts: AtomicifyOpts): AtRule => {
  const children: ChildNode[] = [];
  const newNode = node.clone({
    raws: {
      before: '',
      between: '',
      semicolon: false,
      params: { raw: '', value: '' },
    },
    nodes: children,
  });
  const atRuleLabel = `${opts.atRule || ''}${node.name}${node.params}`;
  const atRuleOpts = {
    ...opts,
    parentNode: newNode,
    atRule: atRuleLabel,
  };

  newNode.parent = opts.parentNode!;

  node.each((childNode) => {
    switch (childNode.type) {
      case 'atrule':
        newNode.nodes.push(atomicifyAtRule(childNode, atRuleOpts));
        break;

      case 'rule':
        atomicifyRule(childNode, atRuleOpts).forEach((rule) => {
          newNode.nodes.push(rule);
        });
        break;

      case 'decl':
        newNode.nodes.push(atomicifyDecl(childNode, atRuleOpts));
        break;

      default:
        break;
    }
  });

  return newNode;
};

/**
 * Transforms a style sheet into atomic rules.
 * When passing a `callback` option it will callback with created class names.
 *
 * Preconditions:
 *
 * 1. No nested rules allowed - normalize them with the `parent-orphaned-pseudos` and `nested` plugins first.
 */
export const atomicifyRules = (opts = {}): Plugin => {
  return {
    postcssPlugin: 'atomicify-rules',
    OnceExit(root) {
      root.each((node) => {
        switch (node.type) {
          case 'atrule':
            const supported = ['media', 'supports', 'document'];
            if (supported.includes(node.name)) {
              node.replaceWith(atomicifyAtRule(node, opts));
            }

            break;

          case 'rule':
            node.replaceWith(atomicifyRule(node, opts));
            break;

          case 'decl':
            node.replaceWith(atomicifyDecl(node, opts));
            break;

          case 'comment':
            node.remove();
            break;

          default:
            break;
        }
      });
    },
  };
};

export const postcss = true;
