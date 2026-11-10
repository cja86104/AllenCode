// @ts-check

/**
 * Panels on inner pages: solid enough that the code field behind the page never shows through text,
 * in the same night, line and ember language as the home page's editors.
 */
export const PANEL = 'rounded-xl border border-white/10 bg-night/90';
/** A panel that lights up when it, or something in it, is hovered or focused. */
export const PANEL_HOVER = `${PANEL} transition-colors hover:border-ember/50 focus-within:border-ember/50`;
/** The primary call to action, and the quieter one beside it. */
export const BUTTON =
  'mono inline-flex items-center justify-center gap-2 rounded-full bg-ember px-6 py-3 text-xs uppercase tracking-widest text-night transition-colors hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember';
export const BUTTON_QUIET =
  'mono inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-widest text-white transition-colors hover:border-ember hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember';
/** Display headings: Instrument Serif italic, as on the home page. */
export const DISPLAY = 'font-serif-display italic leading-[1.05] text-white';

/**
 * The top of an inner page, in the home page's language: the page as a path in the studio's source,
 * a label, the headline and its lede. It clears the fixed nav.
 *
 * @param {{ path: string, eyebrow: string, title: import('react').ReactNode, lede?: import('react').ReactNode, children?: import('react').ReactNode }} props
 */
export default function PageHeader({ path, eyebrow, title, lede, children }) {
  return (
    <header className="pb-10 pt-32 lg:pt-36">
      <p aria-hidden="true" className="mono text-[11px] tracking-widest text-white/45">
        <span className="text-ember">~/</span>allencode/{path}
        <span className="gate-cursor" />
      </p>
      <p className="mono mt-6 text-xs uppercase tracking-[0.3em] text-ember">{eyebrow}</p>
      <h1 className={`${DISPLAY} mt-4 max-w-4xl text-5xl sm:text-6xl lg:text-7xl`}>{title}</h1>
      {lede && <div className="mt-6 max-w-2xl text-lg text-white/70">{lede}</div>}
      {children}
    </header>
  );
}
