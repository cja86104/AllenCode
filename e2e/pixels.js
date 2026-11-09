// @ts-check

/**
 * Pixels clearly brighter than the faint ambient field in a PNG screenshot. Code drawn behind the
 * editor's translucent background still counts; the ambient field does not.
 * @param {Buffer} buffer
 */
export async function visibleCodePixels(buffer) {
  const { PNG } = await import('pngjs');
  const png = PNG.sync.read(buffer);
  let count = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i] + png.data[i + 1] + png.data[i + 2] > 150) count += 1;
  }
  return count;
}
