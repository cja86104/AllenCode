// @ts-check
import { afterEach, describe, expect, it } from 'vitest';
import { measureProbes, pickCurrent, segmentProbes } from '../src/pathbar/current.js';
import { homeTree } from '../src/pathbar/tree.js';

/** @param {string} html */
function add(html) {
  const holder = document.createElement('div');
  holder.innerHTML = html;
  const el = /** @type {HTMLElement} */ (holder.firstElementChild);
  document.body.append(el);
  return el;
}
/** @param {Element} el @param {number} top @param {number} height */
function place(el, top, height) {
  el.getBoundingClientRect = () => /** @type {DOMRect} */ ({ top, bottom: top + height, height, left: 0, right: 0, width: 0, x: 0, y: top, toJSON: () => ({}) });
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('following the scroll (Living Source Phase 3, Task 5)', () => {
  it('pickCurrent: the probe holding the line; past a gap, the last one started; before all, none', () => {
    const probes = [
      { id: 'a', top: 0, bottom: 100 },
      { id: 'b', top: 100, bottom: 300 },
      { id: 'c', top: 500, bottom: 900 },
    ];
    expect(pickCurrent(probes, 50)).toBe('a');
    expect(pickCurrent(probes, 100)).toBe('b');
    expect(pickCurrent(probes, 400)).toBe('b');
    expect(pickCurrent(probes, 2000)).toBe('c');
    expect(pickCurrent([{ id: 'x', top: 10, bottom: 20 }], 5)).toBeNull();
    expect(pickCurrent([], 5)).toBeNull();
  });

  it('segmentProbes: contiguous, measured at the screen’s middle, the first from the section’s top, the last to its bottom', () => {
    // A section 5400 px tall in a 900 px window: 4500 px of scroll, 900 px per segment.
    const probes = segmentProbes(1000, 5400, 900, ['a', 'b', 'c', 'd', 'e']);
    expect(probes.map((p) => p.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(probes[0].top).toBe(1000);
    expect(probes[1].top).toBe(1000 + 450 + 900);
    for (let i = 1; i < probes.length; i += 1) expect(probes[i].top).toBe(probes[i - 1].bottom);
    expect(probes[4].bottom).toBe(6400);
  });

  it('measureProbes: the origin first, then each chapter in the page; a chapter not drawn is left out', () => {
    place(add('<section data-chapter="gate"></section>'), 0, 900);
    place(add('<section data-chapter="mvp-sprints"></section>'), 2000, 1800);
    place(add('<section data-product="underfire-ai"></section>'), 4000, 1800);
    place(add('<section data-chapter="brief"></section>'), 9000, 800);
    const probes = measureProbes(homeTree());
    expect(probes.map((p) => p.id)).toEqual(['00_origin', '01_services/mvp-sprints', '02_our-work/underfire-ai', '07_start']);
    expect(probes[0]).toEqual({ id: '00_origin', top: 0, bottom: 2000 });
  });

  it('measureProbes: door B’s pinned templates by segment, from the chapter’s order', () => {
    place(add('<section data-door-b-intro></section>'), 1000, 1800);
    place(add('<section data-template-chapter data-template-order="evergreen keepsake"><div class="pin-frame"></div></section>'), 3000, 2700);
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true });
    const ids = measureProbes(homeTree()).map((p) => p.id);
    expect(ids).toEqual(['00_origin', '03_templates/hearth', '03_templates/evergreen', '03_templates/keepsake']);
  });
});
