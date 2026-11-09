// @ts-check

/**
 * "Type your idea" (spec section 4, step 8): a deterministic layout toy, not an AI generator.
 * Recognized words choose blocks; every sketch has a header, a hero and a call to action.
 */

/** @typedef {'header' | 'hero' | 'calendar' | 'grid' | 'gallery' | 'list' | 'posts' | 'cta'} BlockKind */
/** @typedef {{ kind: BlockKind, label: string }} SketchBlock */

/** Longest idea kept, in UTF-16 code units (the same unit the input's maxLength counts). */
export const IDEA_MAX_LENGTH = 120;

/** @type {Readonly<Record<BlockKind, string>>} */
export const BLOCK_LABELS = Object.freeze({
  header: 'Navigation',
  hero: 'Headline',
  calendar: 'Booking calendar',
  grid: 'Shop',
  gallery: 'Photo gallery',
  list: 'Menu',
  posts: 'Blog posts',
  cta: 'Call to action',
});

/**
 * The words that choose each optional block, in the order the blocks appear in the sketch. Whole
 * words only, so "books" for a bookshop does not ask for a calendar.
 * @type {ReadonlyArray<{ kind: BlockKind, words: readonly string[] }>}
 */
const KEYWORDS = Object.freeze([
  { kind: 'calendar', words: ['book', 'booking', 'bookings', 'appointment', 'appointments', 'schedule', 'scheduling', 'reservation', 'reservations', 'reserve', 'calendar'] },
  { kind: 'grid', words: ['shop', 'shops', 'store', 'stores', 'sell', 'selling', 'product', 'products', 'merch', 'ecommerce'] },
  { kind: 'gallery', words: ['photo', 'photos', 'photography', 'gallery', 'galleries', 'portfolio', 'pictures'] },
  { kind: 'list', words: ['menu', 'menus', 'list', 'lists'] },
  { kind: 'posts', words: ['blog', 'blogs', 'post', 'posts', 'news', 'journal', 'articles'] },
]);

/**
 * The visitor's line as it is kept: whitespace collapsed, trimmed, and cut to IDEA_MAX_LENGTH
 * without splitting a character that takes two code units (an emoji, for example).
 * @param {string} text
 * @returns {string}
 */
export function capIdea(text) {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  let out = '';
  for (const char of collapsed) {
    if (out.length + char.length > IDEA_MAX_LENGTH) break;
    out += char;
  }
  return out.trimEnd();
}

/**
 * The blocks for an idea, top to bottom.
 * @param {string} idea
 * @returns {SketchBlock[]}
 */
export function sketchBlocks(idea) {
  const words = new Set(idea.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean));
  /** @type {BlockKind[]} */
  const kinds = ['header', 'hero'];
  for (const { kind, words: triggers } of KEYWORDS) {
    if (triggers.some((word) => words.has(word))) kinds.push(kind);
  }
  kinds.push('cta');
  return kinds.map((kind) => ({ kind, label: BLOCK_LABELS[kind] }));
}

/**
 * Breaks the idea into lines of at most `columns` characters, at spaces where it can, so it fits
 * the editor it lifts off. A word longer than a line is split.
 * @param {string} idea
 * @param {number} columns
 * @returns {string}
 */
export function wrapIdea(idea, columns) {
  const width = Math.max(1, Math.floor(columns));
  /** @type {string[]} */
  const lines = [];
  let line = '';
  // Lengths count characters, not code units, so an emoji is one column and is never split.
  const length = (/** @type {string} */ text) => Array.from(text).length;
  for (const word of idea.split(' ')) {
    let rest = Array.from(word);
    while (rest.length > width) {
      if (line) {
        lines.push(line);
        line = '';
      }
      lines.push(rest.slice(0, width).join(''));
      rest = rest.slice(width);
    }
    const piece = rest.join('');
    if (!line) line = piece;
    else if (length(line) + 1 + rest.length <= width) line += ` ${piece}`;
    else {
      lines.push(line);
      line = piece;
    }
  }
  if (line) lines.push(line);
  return lines.join('\n');
}
