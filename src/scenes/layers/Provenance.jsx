// @ts-check

/** @typedef {import('../../content/excerpts/index.js').Excerpt} Excerpt */

/**
 * Where a chapter's code comes from (Living Source Phase 4; spec D): the repository and path, the lines and the
 * commit it was copied at, Chris's approval, and what it becomes on the page. No link: a repository is linked
 * only once Chris names it public (spec, answer 4).
 * @param {{ excerpt: Excerpt }} props
 */
export default function Provenance({ excerpt }) {
  const [first, last] = excerpt.lines;
  return (
    <div data-provenance className="mono space-y-1 text-[11px] leading-relaxed text-white/60">
      <p>
        {excerpt.repo} · {excerpt.path}
      </p>
      <p>
        lines {first}–{last} · commit {excerpt.commit.slice(0, 7)}
        {excerpt.approved ? ` · approved ${excerpt.approved.on}` : ''}
      </p>
      <p className="font-sans text-[13px] text-white/70">{excerpt.becomes}</p>
    </div>
  );
}
