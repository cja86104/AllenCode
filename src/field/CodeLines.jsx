// @ts-check
import { SYNTAX_COLORS, tokenizeLine } from './syntax.js';

/**
 * @param {readonly number[]} color 0..1 RGB
 * @returns {string}
 */
function css(color) {
  return `rgb(${color.map((c) => Math.round(c * 255)).join(', ')})`;
}

/**
 * Code with editor syntax colors. With `visible`, only that many characters of the code are shown,
 * for typing it out; the rest is not rendered.
 *
 * @param {{ code: string, visible?: number }} props
 */
export default function CodeLines({ code, visible = code.length }) {
  let remaining = Math.max(0, Math.min(code.length, Math.floor(visible)));
  const lines = code.split('\n');
  /** @type {import('react').ReactNode[]} */
  const out = [];
  lines.forEach((line, row) => {
    if (remaining <= 0) return;
    const tokens = [];
    for (const [i, token] of tokenizeLine(line).entries()) {
      if (remaining <= 0) break;
      const text = token.text.slice(0, remaining);
      remaining -= text.length;
      tokens.push(
        <span key={i} style={{ color: css(SYNTAX_COLORS[token.kind]) }}>
          {text}
        </span>,
      );
    }
    out.push(<span key={row}>{tokens}</span>);
    if (row < lines.length - 1 && remaining > 0) {
      remaining -= 1;
      out.push(<span key={`newline-${row}`}>{'\n'}</span>);
    }
  });
  return <>{out}</>;
}
