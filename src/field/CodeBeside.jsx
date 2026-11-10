// @ts-check
import CodeLines from './CodeLines.jsx';

/** @typedef {import('../content/excerpts/index.js').Excerpt} Excerpt */

/**
 * The static form of a transformation: the code in an editor beside what it becomes. Used for
 * reduced motion and whenever the glyph renderer is not running (spec section 8).
 *
 * @param {{ excerpt: Excerpt, result: import('react').ReactNode }} props
 */
export default function CodeBeside({ excerpt, result }) {
  return (
    <figure data-code-beside className="relative z-10 grid items-center gap-8 lg:grid-cols-2">
      <figcaption className="sr-only">
        {`Code from ${excerpt.file} (${excerpt.repo}), which becomes ${excerpt.becomes}.`}
      </figcaption>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-night/80">
        <div className="mono border-b border-white/10 px-4 py-2 text-[11px] tracking-widest text-white/60">
          {excerpt.file}
        </div>
        {/* Ligatures off: the page shows the literal characters of the code (=> stays =>). */}
        <pre className="mono overflow-x-auto p-5 text-[13px] leading-[19px] [font-variant-ligatures:none]">
          <CodeLines code={excerpt.code} />
        </pre>
      </div>
      <div>{result}</div>
    </figure>
  );
}
