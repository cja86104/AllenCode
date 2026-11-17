// @ts-check
import { products } from '../data/products.js';
import { serviceScreens } from '../data/serviceScreens.js';
import { templates } from '../data/templates.js';
import { BUILDER } from '../content/builderStory.js';
import { loopOf } from '../scenes/ProductChapter.jsx';

/** @typedef {{ data: Uint8ClampedArray, width: number, height: number }} Pixels */

/** Landmark screens are read this wide for their pictures in characters. */
const PICTURE_WIDTH = 320;

/** Each landmark's screen, read once per visit. @type {Map<string, Promise<Pixels | null>>} */
const pictures = new Map();

/**
 * Reads a screen's pixels at `PICTURE_WIDTH`, for its landmark's picture in characters.
 * @param {string} src
 * @returns {Promise<Pixels | null>}
 */
export function readPicture(src) {
  const known = pictures.get(src);
  if (known) return known;
  const reading = (async () => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    await img.decode();
    const width = PICTURE_WIDTH;
    const height = Math.max(1, Math.round((PICTURE_WIDTH * img.naturalHeight) / Math.max(1, img.naturalWidth)));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, width, height);
    return { data: ctx.getImageData(0, 0, width, height).data, width, height };
  })().catch(() => null);
  pictures.set(src, reading);
  return reading;
}

/**
 * The screen a road stop resolves into: a product's or a template's loop poster, a service's screen, or
 * (the workshop, W4) Chris's photo.
 * @param {import('./roads.js').RoadStop} stop
 */
export function screenOf(stop) {
  if (stop.kind === 'product') {
    const product = products.find((p) => p.slug === stop.id);
    return product ? (loopOf(product)?.poster ?? null) : null;
  }
  if (stop.kind === 'service') return serviceScreens[/** @type {keyof typeof serviceScreens} */ (stop.id)]?.src ?? null;
  if (stop.kind === 'template') return templates.find((t) => t.id === stop.id)?.poster ?? null;
  if (stop.kind === 'portrait') return BUILDER.photo.src;
  return null;
}

