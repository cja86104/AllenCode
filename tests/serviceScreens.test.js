/** @vitest-environment node */
// @ts-check
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { serviceScreens } from '../src/data/serviceScreens.js';

/**
 * Pixel size of a PNG or JPEG file, read from its header.
 * @param {Buffer} bytes
 * @returns {{ width: number, height: number }}
 */
function imageSize(bytes) {
  if (bytes.readUInt32BE(0) === 0x89504e47) return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  let offset = 2;
  while (offset < bytes.length) {
    const marker = bytes.readUInt16BE(offset);
    const length = bytes.readUInt16BE(offset + 2);
    if (marker >= 0xffc0 && marker <= 0xffc3) {
      return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  throw new Error('Not a PNG or JPEG file.');
}

describe('service screens', () => {
  it('only the three flight services can have a screen; the audit chapter has none', () => {
    expect(Object.keys(serviceScreens).sort()).toEqual(['ai-integration', 'custom-saas-builds', 'mvp-sprints']);
  });

  it('every screen that is set exists under public/, is at most 400 kB, and matches its recorded size', () => {
    for (const [slug, screen] of Object.entries(serviceScreens)) {
      if (!screen) continue;
      expect(screen.src.startsWith('/media/services/'), slug).toBe(true);
      const path = new URL(`../public${screen.src}`, import.meta.url);
      expect(existsSync(path), `${slug}: ${screen.src} is missing`).toBe(true);
      const bytes = readFileSync(path);
      expect(bytes.length, `${slug} is larger than 400 kB`).toBeLessThanOrEqual(400 * 1024);
      expect(imageSize(bytes), slug).toEqual({ width: screen.width, height: screen.height });
      expect(screen.alt.trim().length, `${slug} needs alt text`).toBeGreaterThan(0);
    }
  });
});
