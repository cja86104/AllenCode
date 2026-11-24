// @ts-check

/**
 * Source for the Evergreen template: the opening spread of the real template (templates/evergreen), the
 * name, dates and place its loop opens on.
 * @type {import('./index.js').Excerpt}
 */
const templateEvergreen = {
  id: 'template-evergreen',
  file: 'Opening.tsx',
  repo: 'cja86104/AllenCode',
  path: 'templates/evergreen/src/sections/Opening.tsx',
  lines: [26, 45],
  commit: '73ce3ef825dd860dc3ced71f551e9ee471868b51',
  code: [
    "      <div className=\"opening__title\">",
    "        <p className=\"opening__eyebrow\">{opening.eyebrow}</p>",
    "        <h1 id=\"opening-name\" className=\"opening__name\">",
    "          {lines.map((line, index) => (",
    "            <span key={line} className=\"opening__line\">",
    "              {index > 0 ? ' ' : ''}",
    "              {line}",
    "            </span>",
    "          ))}",
    "        </h1>",
    "        {born || died ? (",
    "          <p className=\"opening__dates\">",
    "            {born ? <time dateTime={partialDateTimeValue(person.born)}>{born}</time> : null}",
    "            {born && died ? <span aria-hidden=\"true\"> — </span> : null}",
    "            {born && died ? <span className=\"visually-hidden\"> to </span> : null}",
    "            {died ? <time dateTime={partialDateTimeValue(person.died)}>{died}</time> : null}",
    "          </p>",
    "        ) : null}",
    "        {person.place ? <p className=\"opening__place\">{person.place}</p> : null}",
    "      </div>",
  ].join('\n'),
  becomes: 'the opening of the Evergreen — Memorial and Tribute template',
  approved: { by: 'Chris', on: '2026-11-24' },
};

export default templateEvergreen;
