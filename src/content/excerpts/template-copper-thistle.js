// @ts-check

/**
 * Source for the Copper Thistle template: the hero of the real template (templates/copper-thistle), the
 * headline, intro and reservation button its loop opens on.
 * @type {import('./index.js').Excerpt}
 */
const templateCopperThistle = {
  id: 'template-copper-thistle',
  file: 'Hero.tsx',
  repo: 'cja86104/AllenCode',
  path: 'templates/copper-thistle/src/sections/home/Hero.tsx',
  lines: [19, 34],
  commit: '22d7eea9d88263ff1aec83d75f5998789c6aac0a',
  code: [
    "        <h1",
    "          id=\"hero-title\"",
    "          className=\"hero-enter mb-6 font-display text-5xl italic leading-[1.03] text-cream [animation-delay:0.15s] sm:text-6xl md:text-7xl lg:text-[5.5rem]\"",
    "        >",
    "          {hero.headline.map((line, index) => (",
    "            <span key={line} className=\"block\">",
    "              {index > 0 ? ' ' : ''}",
    "              {line}",
    "            </span>",
    "          ))}",
    "        </h1>",
    "        <div aria-hidden=\"true\" className=\"hero-enter mb-6 h-px w-24 bg-gold [animation-delay:0.4s]\" />",
    "        <p className=\"hero-enter mb-10 max-w-md text-lg font-light text-cream [animation-delay:0.4s]\">{hero.intro}</p>",
    "        <div className=\"hero-enter [animation-delay:0.6s]\">",
    "          <PillLink to=\"/reservations\">{hero.action}</PillLink>",
    "        </div>",
  ].join('\n'),
  becomes: 'the opening of the Copper Thistle — Restaurant template',
  approved: { by: 'Chris', on: '2026-11-25' },
};

export default templateCopperThistle;
