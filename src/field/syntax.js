// @ts-check

/** @typedef {'keyword' | 'type' | 'string' | 'plain'} TokenKind */
/** @typedef {[number, number, number]} RGB */

/** Editor colors as 0..1 RGB (spec section 6). Keywords use the brand orange. */
export const SYNTAX_COLORS = Object.freeze({
  keyword: /** @type {RGB} */ ([249 / 255, 115 / 255, 22 / 255]),
  type: /** @type {RGB} */ ([140 / 255, 199 / 255, 255 / 255]),
  string: /** @type {RGB} */ ([166 / 255, 217 / 255, 140 / 255]),
  plain: /** @type {RGB} */ ([209 / 255, 209 / 255, 204 / 255]),
});

const KEYWORDS = new Set([
  'import', 'from', 'export', 'default', 'async', 'await', 'function', 'return', 'const', 'let', 'var',
  'new', 'class', 'extends', 'if', 'else', 'for', 'of', 'in', 'while', 'switch', 'case', 'break',
  'continue', 'throw', 'try', 'catch', 'finally', 'typeof', 'instanceof', 'void', 'yield', 'as',
  'type', 'interface', 'enum', 'true', 'false', 'null', 'undefined',
]);

/** Strings (closed or running to end of line), identifiers, whitespace, and everything else. */
const TOKEN = /'(?:[^'\\]|\\.)*'?|"(?:[^"\\]|\\.)*"?|`(?:[^`\\]|\\.)*`?|[A-Za-z_$][\w$]*|\s+|[^\sA-Za-z_$'"`]+/g;

/**
 * Splits one line of JavaScript or TypeScript into colored tokens. Joining the tokens' text
 * gives the original line back.
 *
 * @param {string} line
 * @returns {{ text: string, kind: TokenKind }[]}
 */
export function tokenizeLine(line) {
  return (line.match(TOKEN) ?? []).map((text) => {
    /** @type {TokenKind} */
    let kind = 'plain';
    if (/^['"`]/.test(text)) kind = 'string';
    else if (KEYWORDS.has(text)) kind = 'keyword';
    else if (/^[A-Z][\w$]*$/.test(text)) kind = 'type';
    return { text, kind };
  });
}
