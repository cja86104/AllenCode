// @ts-check

/**
 * Source for the UI / UX design chapter: this site's own sketch component, which turns a visitor's
 * one-line idea into a wireframe. It lands as a loop of that sketch being built (Chris, 2026-11-16).
 * @type {import('./index.js').Excerpt}
 */
const serviceUiux = {
  id: 'service-uiux',
  file: 'IdeaSketch.jsx',
  repo: 'cja86104/AllenCode',
  path: 'src/scenes/IdeaSketch.jsx',
  lines: [57, 80],
  commit: 'c27c37b19b006e6bdaa594cdb33305ad1492cea9',
  code: [
    "function Sketch({ blocks, opacity, sketchRef }) {",
    "  const placed = sketchShapes(blocks, SKETCH_SPACE);",
    "  return (",
    "    <div ref={sketchRef} aria-hidden=\"true\" data-sketch data-world-target className=\"relative aspect-[4/3] w-full\">",
    "      <div style={{ opacity }} className=\"absolute inset-0\">",
    "        {placed.flatMap(({ block, shapes }) =>",
    "          shapes.map((shape, i) => (",
    "            <div",
    "              key={`${block.kind}-${i}`}",
    "              data-tone={shape.tone}",
    "              style={{",
    "                left: `${shape.x}%`,",
    "                top: `${(shape.y / SKETCH_SPACE.h) * 100}%`,",
    "                width: `${shape.w}%`,",
    "                height: `${(shape.h / SKETCH_SPACE.h) * 100}%`,",
    "              }}",
    "              className={`absolute rounded-[2px] ${TONE_CLASSES[shape.tone]}`}",
    "            />",
    "          )),",
    "        )}",
    "      </div>",
    "    </div>",
    "  );",
    "}",
  ].join('\n'),
  becomes: 'a loop of a visitor’s idea becoming its wireframe',
  approved: { by: 'Chris', on: '2026-11-16' },
};

export default serviceUiux;
