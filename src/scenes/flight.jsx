// @ts-check
import { useEffect } from 'react';
import { fieldBus } from '../field/fieldBus.js';
import { CODE_FONT_SIZE, CODE_LINE_HEIGHT, EDITOR_PADDING, editorSize } from '../field/editorMetrics.js';
import CodeLines from '../field/CodeLines.jsx';

/**
 * What service and product chapters share when their code flies onto a real screen: where things
 * sit, the editor the code leaves, and the request to the field.
 */

/** @typedef {import('../content/excerpts/index.js').Excerpt} Excerpt */
/** @typedef {import('../field/types.js').Box} Box */
/** @typedef {{ src: string, alt: string, width: number, height: number }} Screen */

export const TITLE_BAR_HEIGHT = 30;
export const DESKTOP_MIN_WIDTH = 1024;

/**
 * Where the text, the editor and the screen sit for one viewport: text on the left and the stage on
 * the right on desktop; text above the stage on phones.
 * @param {number} w
 * @param {number} h
 * @returns {{ text: Box, stage: Box }}
 */
export function chapterLayout(w, h) {
  if (w >= DESKTOP_MIN_WIDTH) {
    return {
      text: { x: w * 0.06, y: h * 0.16, w: w * 0.36, h: h * 0.68 },
      stage: { x: w * 0.45, y: h * 0.14, w: w * 0.51, h: h * 0.74 },
    };
  }
  return {
    text: { x: w * 0.06, y: h * 0.1, w: w * 0.88, h: h * 0.3 },
    stage: { x: w * 0.04, y: h * 0.44, w: w * 0.92, h: h * 0.5 },
  };
}

/**
 * A box of the given aspect ratio, as large as fits, centered in `area`.
 * @param {Box} area
 * @param {number} aspect width / height
 * @returns {Box}
 */
function fit(area, aspect) {
  const w = Math.min(area.w, area.h * aspect);
  const h = w / aspect;
  return { x: area.x + (area.w - w) / 2, y: area.y + (area.h - h) / 2, w, h };
}

/**
 * Where everything in a flight chapter sits for one viewport. Pure, so the render and the
 * transformation request always agree.
 * @param {string} code
 * @param {{ width: number, height: number }} screen
 * @param {number} w
 * @param {number} h
 * @returns {{ text: Box, sourceBox: Box, codeScale: number, targetBox: Box }}
 */
export function flightGeometry(code, screen, w, h) {
  const { text, stage } = chapterLayout(w, h);
  const full = editorSize(code);
  const codeScale = Math.min(1, stage.w / full.w, (stage.h - TITLE_BAR_HEIGHT) / full.h);
  const size = editorSize(code, codeScale);
  const sourceBox = {
    x: stage.x + (stage.w - size.w) / 2,
    y: stage.y + TITLE_BAR_HEIGHT + (stage.h - TITLE_BAR_HEIGHT - size.h) / 2,
    ...size,
  };
  return { text, sourceBox, codeScale, targetBox: fit(stage, screen.width / screen.height) };
}

/**
 * Asks the field to fly `code` onto `screen` while the chapter is on screen, and drives the flight.
 * The request is keyed by chapter and viewport, so a chapter only ever releases its own.
 * @param {{ slug: string, code: string, screen: Screen, visible: boolean, viewport: { w: number, h: number }, flight: number }} opts
 */
export function useImageFlight({ slug, code, screen, visible, viewport, flight }) {
  const { src, alt, width, height } = screen;
  const key = `${slug}:${viewport.w}x${viewport.h}`;

  useEffect(() => {
    if (!visible) return undefined;
    const geometry = flightGeometry(code, { width, height }, viewport.w, viewport.h);
    fieldBus.claimTransform({
      key,
      code,
      sourceBox: geometry.sourceBox,
      codeScale: geometry.codeScale,
      target: { kind: 'image', src, alt },
      targetBox: geometry.targetBox,
      step: Math.max(5, Math.round(geometry.targetBox.w / 110)),
    });
    return () => fieldBus.releaseTransform(key);
  }, [visible, key, viewport.w, viewport.h, code, src, alt, width, height]);

  useEffect(() => {
    if (visible) fieldBus.setTransformProgress(key, flight);
  }, [visible, key, flight]);
}

/**
 * The editor a flight leaves: its frame with the file name, and the code itself, both hidden from
 * assistive technology (the chapter describes the code in text).
 * @param {{ file: string, code: string, sourceBox: Box, codeScale: number, codeOpacity: number, frameOpacity: number }} props
 */
export function FlightEditor({ file, code, sourceBox, codeScale, codeOpacity, frameOpacity }) {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          opacity: frameOpacity,
          left: sourceBox.x,
          top: sourceBox.y - TITLE_BAR_HEIGHT,
          width: sourceBox.w,
          height: sourceBox.h + TITLE_BAR_HEIGHT,
        }}
        className="absolute rounded-xl border border-white/10 bg-night/70"
      >
        <div
          style={{ height: TITLE_BAR_HEIGHT }}
          className="mono flex items-center border-b border-white/10 px-4 text-[11px] tracking-widest text-white/60"
        >
          {file}
        </div>
      </div>
      <pre
        aria-hidden="true"
        style={{
          opacity: codeOpacity,
          left: sourceBox.x + EDITOR_PADDING * codeScale,
          top: sourceBox.y + EDITOR_PADDING * codeScale,
          fontSize: CODE_FONT_SIZE * codeScale,
          lineHeight: `${CODE_LINE_HEIGHT * codeScale}px`,
        }}
        className="mono absolute m-0 whitespace-pre [font-variant-ligatures:none]"
      >
        <CodeLines code={code} />
      </pre>
    </>
  );
}

/**
 * A static editor panel with the excerpt's file name and code. With `visible`, only that many
 * characters are shown and a cursor follows them, for a file still being written.
 * @param {{ excerpt: Excerpt, visible?: number, cursor?: boolean }} props
 */
export function EditorPanel({ excerpt, visible = excerpt.code.length, cursor = false }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-white/10 bg-night/80">
      <figcaption className="sr-only">
        {`Code from ${excerpt.file} (${excerpt.repo}), which becomes ${excerpt.becomes}.`}
      </figcaption>
      <div className="mono border-b border-white/10 px-4 py-2 text-[11px] tracking-widest text-white/60">
        {excerpt.file}
      </div>
      {/* Long lines wrap rather than scroll, so no part of the code is hidden from a keyboard (WCAG 2.1.1). */}
      <pre className="mono whitespace-pre-wrap p-5 text-[13px] leading-[19px] [font-variant-ligatures:none] [overflow-wrap:anywhere]">
        <CodeLines code={excerpt.code} visible={visible} />
        {cursor && <span aria-hidden="true" data-cursor className="gate-cursor" />}
      </pre>
    </figure>
  );
}
