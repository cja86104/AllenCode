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

/**
 * The chroma sampling of each component of a JPEG's frame, as `HxV`. No chroma subsampling (4:4:4) is
 * every component sampled as its luma is: Pillow's `subsampling=0` writes `1x1` for each, ffmpeg's
 * `yuvj444p` writes `1x2` for each (2026-11-27, the recorder's poster); both keep full chroma.
 * @param {Buffer} bytes
 * @returns {string[]}
 */
function jpegSampling(bytes) {
  let offset = 2;
  while (offset < bytes.length) {
    const marker = bytes.readUInt16BE(offset);
    const length = bytes.readUInt16BE(offset + 2);
    if (marker >= 0xffc0 && marker <= 0xffc3) {
      const count = bytes[offset + 9];
      return Array.from({ length: count }, (_, i) => {
        const factors = bytes[offset + 11 + i * 3];
        return `${factors >> 4}x${factors & 15}`;
      });
    }
    offset += 2 + length;
  }
  throw new Error('Not a JPEG file.');
}

/**
 * The handler type of every track in an MP4 (`vide`, `soun`, ...), read from its `hdlr` boxes.
 * @param {Buffer} bytes
 * @returns {string[]}
 */
function mp4Handlers(bytes) {
  const handlers = [];
  for (let at = bytes.indexOf('hdlr'); at >= 0; at = bytes.indexOf('hdlr', at + 4)) handlers.push(bytes.toString('latin1', at + 12, at + 16));
  return handlers;
}

describe('service screens', () => {
  it('only the seven flight services can have a screen; the audit chapter has none', () => {
    expect(Object.keys(serviceScreens).sort()).toEqual([
      'ai-integration',
      'custom-saas-builds',
      'custom-web-development',
      'immersive-web-experiences',
      'intelligent-ai-systems',
      'mvp-sprints',
      'ui-ux-design',
    ]);
  });

  it('Intelligent AI Systems has no screen yet, so its chapter does not show (Task 6 supplies it)', () => {
    expect(serviceScreens['intelligent-ai-systems']).toBeNull();
  });

  it('Immersive Web Experiences loops a muted recording of this build within the loops’ 700 kB, over a 1280 × 800 poster at full chroma (2026-11-27)', () => {
    const screen = serviceScreens['immersive-web-experiences'];
    expect(screen?.video).toBe('/media/services/immersive-web-experiences.mp4');
    expect(screen?.src).toBe('/media/services/immersive-web-experiences.jpg');
    const video = readFileSync(new URL(`../public${screen?.video}`, import.meta.url));
    expect(video.length).toBeLessThanOrEqual(700 * 1024);
    expect(video.toString('latin1', 4, 8)).toBe('ftyp');
    expect(mp4Handlers(video)).toContain('vide');
    expect(mp4Handlers(video), 'muted: no sound track').not.toContain('soun');
    const poster = readFileSync(new URL(`../public${screen?.src}`, import.meta.url));
    expect(imageSize(poster)).toEqual({ width: 1280, height: 800 });
    expect([screen?.width, screen?.height]).toEqual([1280, 800]);
    const sampling = jpegSampling(poster);
    expect(sampling, 'three components').toHaveLength(3);
    expect(new Set(sampling).size, `4:4:4, no chroma subsampling: ${sampling.join(' ')}`).toBe(1);
    expect(screen?.alt).toMatch(/Code World/);
    expect(screen?.alt).not.toMatch(/\$\s?\d|price/i);
  });

  it('the two new services loop a video of this build, at most 700 kB each, over a 1280 × 800 poster (Chris, 2026-11-16)', () => {
    for (const slug of ['custom-web-development', 'ui-ux-design']) {
      const screen = serviceScreens[/** @type {keyof typeof serviceScreens} */ (slug)];
      expect(screen?.video, slug).toBe(`/media/services/${slug}.mp4`);
      expect(screen?.src, slug).toBe(`/media/services/${slug}.jpg`);
      expect([screen?.width, screen?.height]).toEqual([1280, 800]);
      const video = new URL(`../public${screen?.video}`, import.meta.url);
      expect(existsSync(video), slug).toBe(true);
      expect(readFileSync(video).length, slug).toBeLessThanOrEqual(700 * 1024);
    }
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
