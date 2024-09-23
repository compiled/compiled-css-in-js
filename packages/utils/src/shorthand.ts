export type ShorthandProperties =
  | 'all'
  | 'animation'
  | 'animation-range'
  | 'background'
  | 'border'
  | 'border-block'
  | 'border-block-end'
  | 'border-block-start'
  | 'border-bottom'
  | 'border-color'
  | 'border-image'
  | 'border-inline'
  | 'border-inline-end'
  | 'border-inline-start'
  | 'border-left'
  | 'border-radius'
  | 'border-right'
  | 'border-style'
  | 'border-top'
  | 'border-width'
  | 'column-rule'
  | 'columns'
  | 'contain-intrinsic-size'
  | 'container'
  | 'flex'
  | 'flex-flow'
  | 'font'
  | 'font-synthesis'
  | 'font-variant'
  | 'gap'
  | 'grid'
  | 'grid-area'
  | 'grid-column'
  | 'grid-row'
  | 'grid-template'
  | 'inset'
  | 'inset-block'
  | 'inset-inline'
  | 'list-style'
  | 'margin'
  | 'margin-block'
  | 'margin-inline'
  | 'mask'
  | 'mask-border'
  | 'offset'
  | 'outline'
  | 'overflow'
  | 'overscroll-behavior'
  | 'padding'
  | 'padding-block'
  | 'padding-inline'
  | 'place-content'
  | 'place-items'
  | 'place-self'
  | 'position-try'
  | 'scroll-margin'
  | 'scroll-margin-block'
  | 'scroll-margin-inline'
  | 'scroll-padding'
  | 'scroll-padding-block'
  | 'scroll-padding-inline'
  | 'scroll-timeline'
  | 'text-decoration'
  | 'text-emphasis'
  | 'text-wrap'
  | 'transition'
  | 'view-timeline';

/**
 * List of shorthand properties that should be sorted (or expanded).
 * Please note these aren't necessarily just shorthand properties against their constituent properties, but
 * also shorthand properties against sibling constituent properties.
 * Example: `border-color` supersedes `border-top-color` and `border-block-color` (and others)
 *
 * This list is outdated and should be expanded to include all shorthand properties—there are 71 as of writing.
 *
 * TODO: check whether there are more......
 *
 * Source MDN Web Docs (unclear which list is complete as there's a minor discrepancy)
 * @see https://github.com/search?q=repo%3Amdn%2Fcontent%20%22%23%23%20Constituent%20properties%22&type=code
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties#shorthand_properties
 */
export const shorthandFor: Record<ShorthandProperties, true | string[]> = {
  all: true, // This is a special case, it's a shorthand for all properties
  animation: [
    'animation-delay',
    'animation-direction',
    'animation-duration',
    'animation-fill-mode',
    'animation-iteration-count',
    'animation-name',
    'animation-play-state',
    'animation-timeline',
    'animation-timing-function',
  ],
  'animation-range': ['animation-range-start', 'animation-range-end'],
  background: [
    'background-attachment',
    'background-clip',
    'background-color',
    'background-image',
    'background-origin',
    'background-position',
    'background-repeat',
    'background-size',
  ],
  border: [
    'border-block',
    'border-block-end',
    'border-block-end-color',
    'border-block-end-style',
    'border-block-end-width',
    'border-block-start',
    'border-block-start-color',
    'border-block-start-style',
    'border-block-start-width',
    'border-bottom',
    'border-bottom-color',
    'border-bottom-style',
    'border-bottom-width',
    'border-inline',
    'border-inline-end',
    'border-inline-end-color',
    'border-inline-end-style',
    'border-inline-end-width',
    'border-inline-start',
    'border-inline-start-color',
    'border-inline-start-style',
    'border-inline-start-width',
    'border-left',
    'border-left-color',
    'border-left-style',
    'border-left-width',
    'border-right',
    'border-right-color',
    'border-right-style',
    'border-right-width',
    'border-top',
    'border-top-color',
    'border-top-style',
    'border-top-width',
  ],
  'border-block': [
    'border-block-start',
    'border-block-start-color',
    'border-block-start-style',
    'border-block-start-width',
    'border-block-end',
    'border-block-end-color',
    'border-block-end-style',
    'border-block-end-width',
    'border-top-color',
    'border-top-style',
    'border-top-width',
    'border-bottom-color',
    'border-bottom-style',
    'border-bottom-width',
  ],
  'border-block-end': [
    'border-block-end-color',
    'border-block-end-style',
    'border-block-end-width',
    'border-top-color',
    'border-top-style',
    'border-top-width',
    'border-bottom-color',
    'border-bottom-style',
    'border-bottom-width',
  ],
  'border-block-start': [
    'border-block-start-color',
    'border-block-start-style',
    'border-block-start-width',
    'border-top-color',
    'border-top-style',
    'border-top-width',
    'border-bottom-color',
    'border-bottom-style',
    'border-bottom-width',
  ],
  'border-bottom': [
    'border-bottom-color',
    'border-bottom-style',
    'border-bottom-width',
    'border-block-start-color',
    'border-block-start-style',
    'border-block-start-width',
    'border-block-end-color',
    'border-block-end-style',
    'border-block-end-width',
  ],
  'border-color': [
    'border-block-color',
    'border-block-start-color',
    'border-block-end-color',
    'border-inline-color',
    'border-inline-start-color',
    'border-inline-end-color',
    'border-bottom-color',
    'border-left-color',
    'border-right-color',
    'border-top-color',
  ],
  'border-image': [
    'border-image-outset',
    'border-image-repeat',
    'border-image-slice',
    'border-image-source',
    'border-image-width',
  ],
  'border-inline': [
    'border-inline-start',
    'border-inline-start-color',
    'border-inline-start-style',
    'border-inline-start-width',
    'border-inline-end',
    'border-inline-end-color',
    'border-inline-end-style',
    'border-inline-end-width',
    'border-left-color',
    'border-left-style',
    'border-left-width',
    'border-right-color',
    'border-right-style',
    'border-right-width',
  ],
  'border-inline-end': [
    'border-inline-end-color',
    'border-inline-end-style',
    'border-inline-end-width',
    'border-left-color',
    'border-left-style',
    'border-left-width',
    'border-right-color',
    'border-right-style',
    'border-right-width',
  ],
  'border-inline-start': [
    'border-inline-start-color',
    'border-inline-start-style',
    'border-inline-start-width',
    'border-left-color',
    'border-left-style',
    'border-left-width',
    'border-right-color',
    'border-right-style',
    'border-right-width',
  ],
  'border-left': [
    'border-left-color',
    'border-left-style',
    'border-left-width',
    'border-inline-start-color',
    'border-inline-start-style',
    'border-inline-start-width',
    'border-inline-end-color',
    'border-inline-end-style',
    'border-inline-end-width',
  ],
  'border-radius': [
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
    'border-start-start-radius',
    'border-start-end-radius',
    'border-end-end-radius',
    'border-end-start-radius',
  ],
  'border-right': [
    'border-right-color',
    'border-right-style',
    'border-right-width',
    'border-inline-start-color',
    'border-inline-start-style',
    'border-inline-start-width',
    'border-inline-end-color',
    'border-inline-end-style',
    'border-inline-end-width',
  ],
  'border-style': [
    'border-block-style',
    'border-block-start-style',
    'border-block-end-style',
    'border-inline-style',
    'border-inline-start-style',
    'border-inline-end-style',
    'border-bottom-style',
    'border-left-style',
    'border-right-style',
    'border-top-style',
  ],
  'border-top': [
    'border-top-color',
    'border-top-style',
    'border-top-width',
    'border-block-start-color',
    'border-block-start-style',
    'border-block-start-width',
    'border-block-end-color',
    'border-block-end-style',
    'border-block-end-width',
  ],
  'border-width': [
    'border-block-width',
    'border-block-start-width',
    'border-block-end-width',
    'border-inline-width',
    'border-inline-start-width',
    'border-inline-end-width',
    'border-bottom-width',
    'border-left-width',
    'border-right-width',
    'border-top-width',
  ],
  'column-rule': ['column-rule-color', 'column-rule-style', 'column-rule-width'],
  columns: ['column-count', 'column-width'],
  'contain-intrinsic-size': [
    'contain-intrinsic-width',
    'contain-intrinsic-block-size',
    'contain-intrinsic-height',
    'contain-intrinsic-inline-size',
  ],
  container: ['container-name', 'container-type'],
  flex: ['flex-basis', 'flex-grow', 'flex-shrink'],
  'flex-flow': ['flex-direction', 'flex-wrap'],
  font: [
    'font-style',
    'font-variant',
    'font-variant-alternates',
    'font-variant-caps',
    'font-variant-east-asian',
    'font-variant-emoji',
    'font-variant-ligatures',
    'font-variant-numeric',
    'font-variant-position',
    'font-weight',
    'font-stretch',
    'font-size',
    'line-height',
    'font-family',
  ],
  'font-synthesis': [
    'font-synthesis-style',
    'font-synthesis-weight',
    'font-synthesis-small-caps',
    'font-synthesis-position',
  ],
  'font-variant': [
    'font-variant-alternates',
    'font-variant-caps',
    'font-variant-east-asian',
    'font-variant-emoji',
    'font-variant-ligatures',
    'font-variant-numeric',
    'font-variant-position',
  ],
  gap: ['row-gap', 'column-gap'],
  grid: [
    'grid-template',
    'grid-template-rows',
    'grid-template-columns',
    'grid-template-areas',
    'grid-auto-rows',
    'grid-auto-columns',
    'grid-auto-flow',
  ],
  'grid-area': [
    'grid-column',
    'grid-column-end',
    'grid-column-start',
    'grid-row',
    'grid-row-end',
    'grid-row-start',
  ],
  'grid-column': ['grid-column-end', 'grid-column-start'],
  'grid-row': ['grid-row-end', 'grid-row-start'],
  'grid-template': ['grid-template-rows', 'grid-template-columns', 'grid-template-areas'],
  inset: [
    'top',
    'right',
    'bottom',
    'left',
    'inset-block',
    'inset-block-start',
    'inset-block-end',
    'inset-inline',
    'inset-inline-start',
    'inset-inline-end',
  ],
  'inset-block': ['inset-block-start', 'inset-block-end', 'top', 'bottom'],
  'inset-inline': ['inset-inline-start', 'inset-inline-end', 'left', 'right'],
  'list-style': ['list-style-image', 'list-style-position', 'list-style-type'],
  margin: [
    'margin-block',
    'margin-block-end',
    'margin-block-start',
    'margin-bottom',
    'margin-inline',
    'margin-inline-end',
    'margin-inline-start',
    'margin-left',
    'margin-right',
    'margin-top',
  ],
  'margin-block': ['margin-block-start', 'margin-block-end', 'margin-top', 'margin-bottom'],
  'margin-inline': ['margin-inline-start', 'margin-inline-end', 'margin-left', 'margin-right'],
  mask: [
    'mask-clip',
    'mask-composite',
    'mask-image',
    'mask-mode',
    'mask-origin',
    'mask-position',
    'mask-repeat',
    'mask-size',
  ],
  'mask-border': [
    'mask-border-mode',
    'mask-border-outset',
    'mask-border-repeat',
    'mask-border-slice',
    'mask-border-source',
    'mask-border-width',
  ],
  offset: ['offset-anchor', 'offset-distance', 'offset-path', 'offset-position', 'offset-rotate'],
  outline: ['outline-color', 'outline-style', 'outline-width'],
  overflow: ['overflow-x', 'overflow-y', 'overflow-block', 'overflow-inline'],
  'overscroll-behavior': [
    'overscroll-behavior-x',
    'overscroll-behavior-y',
    'overscroll-behavior-inline',
    'overscroll-behavior-block',
  ],
  padding: [
    'padding-block',
    'padding-block-end',
    'padding-block-start',
    'padding-bottom',
    'padding-inline',
    'padding-inline-end',
    'padding-inline-start',
    'padding-left',
    'padding-right',
    'padding-top',
  ],
  'padding-block': ['padding-block-start', 'padding-block-end', 'padding-top', 'padding-bottom'],
  'padding-inline': ['padding-inline-start', 'padding-inline-end', 'padding-left', 'padding-right'],
  'place-content': ['align-content', 'justify-content'],
  'place-items': ['align-items', 'justify-items'],
  'place-self': ['align-self', 'justify-self'],
  'position-try': ['position-try-order', 'position-try-fallbacks'],
  'scroll-margin': [
    'scroll-margin-block',
    'scroll-margin-block-end',
    'scroll-margin-block-start',
    'scroll-margin-bottom',
    'scroll-margin-inline',
    'scroll-margin-inline-end',
    'scroll-margin-inline-start',
    'scroll-margin-left',
    'scroll-margin-right',
    'scroll-margin-top',
  ],
  'scroll-margin-block': [
    'scroll-margin-block-start',
    'scroll-margin-block-end',
    'scroll-margin-top',
    'scroll-margin-bottom',
  ],
  'scroll-margin-inline': [
    'scroll-margin-inline-start',
    'scroll-margin-inline-end',
    'scroll-margin-left',
    'scroll-margin-right',
  ],
  'scroll-padding': [
    'scroll-padding-block',
    'scroll-padding-block-end',
    'scroll-padding-block-start',
    'scroll-padding-bottom',
    'scroll-padding-inline',
    'scroll-padding-inline-end',
    'scroll-padding-inline-start',
    'scroll-padding-left',
    'scroll-padding-right',
    'scroll-padding-top',
  ],
  'scroll-padding-block': [
    'scroll-padding-block-start',
    'scroll-padding-block-end',
    'scroll-padding-top',
    'scroll-padding-bottom',
  ],
  'scroll-padding-inline': [
    'scroll-padding-inline-start',
    'scroll-padding-inline-end',
    'scroll-padding-left',
    'scroll-padding-right',
  ],
  'scroll-timeline': ['scroll-timeline-name', 'scroll-timeline-axis'],
  'text-decoration': [
    'text-decoration-color',
    'text-decoration-line',
    'text-decoration-style',
    'text-decoration-thickness',
  ],
  'text-emphasis': ['text-emphasis-color', 'text-emphasis-style'],
  'text-wrap': ['text-wrap-mode', 'text-wrap-style'],
  transition: [
    'transition-behavior',
    'transition-delay',
    'transition-duration',
    'transition-property',
    'transition-timing-function',
  ],
  'view-timeline': ['view-timeline-name', 'view-timeline-axis'],
};
