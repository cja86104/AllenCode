// @ts-check

/** Copies of the excerpt drawn so the texture fills a large screen. */
const REPEAT = 8;

/**
 * The static field: a faint texture of real code. It is painted with the page and stays the same
 * element for the whole visit (Task 9.3b): `hidden` keeps it in place but invisible while the WebGL
 * renderer draws the field, and it shows again when WebGL2 is unavailable, fails, loses its context
 * for good, or the visitor prefers reduced motion. Without code it is empty.
 *
 * @param {{ code?: string | null, hidden?: boolean }} props
 */
export default function CssField({ code = null, hidden = false }) {
  return (
    <div
      data-field="css"
      aria-hidden="true"
      style={hidden ? { visibility: 'hidden' } : undefined}
      className="css-field pointer-events-none fixed inset-0 z-0"
    >
      {code && <pre>{Array.from({ length: REPEAT }, () => code).join('\n\n')}</pre>}
    </div>
  );
}
