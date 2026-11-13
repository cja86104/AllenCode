// @ts-check

/**
 * Loads what a transformation lands on: waits for a text target's font, or decodes an image
 * target and reads its pixels at the size it is drawn. A sketch needs nothing loaded.
 * @param {import('./types.js').TransformSpec} spec
 * @returns {Promise<{ data: Uint8ClampedArray, width: number, height: number } | undefined>}
 */
export async function loadTarget(spec) {
  const { target } = spec;
  if (target.kind === 'sketch') return undefined;
  if (target.kind === 'text') {
    await document.fonts.load(target.font).catch(() => []);
    return undefined;
  }
  const img = new Image();
  img.decoding = 'async';
  img.src = target.src;
  await img.decode();
  const width = Math.max(1, Math.round(spec.targetBox.w));
  const height = Math.max(1, Math.round(spec.targetBox.h));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not create a 2D canvas to read the target image.');
  ctx.drawImage(img, 0, 0, width, height);
  return { data: ctx.getImageData(0, 0, width, height).data, width, height };
}
