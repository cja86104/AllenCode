// @ts-check

/** Copies of the excerpt drawn so the texture fills a large screen. */
const REPEAT = 8;

/**
 * The static field: a faint texture of real code, used when WebGL2 is unavailable, fails, loses its
 * context, or the visitor prefers reduced motion. Without code (while the field loads) it is empty.
 *
 * @param {{ code?: string | null }} props
 */
export default function CssField({ code = null }) {
  return (
    <div data-field="css" aria-hidden="true" className="css-field pointer-events-none fixed inset-0 z-0">
      {code && <pre>{Array.from({ length: REPEAT }, () => code).join('\n\n')}</pre>}
    </div>
  );
}
