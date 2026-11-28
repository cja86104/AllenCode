// @ts-check
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import ServiceChapters, { chapterShows, NAV_FLOOR_PX, PATH_BAR_FLOOR_PX, SERVICE_CHAPTERS, ServiceChapterFor, ServiceText, wordsCompact, wordsRise, wordsTop } from '../src/scenes/ServiceChapters.jsx';
import { chapterLayout } from '../src/scenes/flight.jsx';
import { setPathBarShown } from '../src/pathbar/pathBarStore.js';
import { services } from '../src/data/services.js';
import { serviceScreens } from '../src/data/serviceScreens.js';
import { excerpts, getExcerpt } from '../src/content/excerpts/index.js';
import { draftExcerpts } from '../src/content/excerpts/drafts.js';

const EXISTING = ['mvp-sprints', 'custom-saas-builds', 'custom-web-development', 'ui-ux-design', 'ai-integration', 'technical-audits'];
/** The chapters door A shows today: every entry whose excerpt and screen exist, Immersive first (its loop, 2026-11-27). */
const chapterSlugs = ['immersive-web-experiences', ...EXISTING];

/** A stand-in screen, so the flagships' text can be tested before their real media lands. */
const STUB_SCREEN = Object.freeze({ src: '/media/services/stub.jpg', alt: 'A stand-in screen.', width: 1280, height: 800 });

/** @param {string} slug */
function serviceFor(slug) {
  const service = services.find((s) => s.slug === slug);
  if (!service) throw new Error(slug);
  return service;
}

describe('ServiceChapters', () => {
  it('leads with the two flagships, then the build services, AI integration and audits, in that order, all from services.js (Chris, 2026-11-27)', () => {
    expect(SERVICE_CHAPTERS).toEqual([
      { slug: 'immersive-web-experiences', excerptId: 'service-immersive' },
      { slug: 'intelligent-ai-systems', excerptId: 'service-ai-systems' },
      { slug: 'mvp-sprints', excerptId: 'service-mvp' },
      { slug: 'custom-saas-builds', excerptId: 'service-custom' },
      { slug: 'custom-web-development', excerptId: 'service-web' },
      { slug: 'ui-ux-design', excerptId: 'service-uiux' },
      { slug: 'ai-integration', excerptId: 'service-ai' },
      { slug: 'technical-audits', excerptId: 'service-audit' },
    ]);
    for (const { slug } of SERVICE_CHAPTERS) expect(services.some((s) => s.slug === slug)).toBe(true);
  });

  it('a chapter shows only with its excerpt and, outside the audit, its screen', () => {
    const excerpt = /** @type {import('../src/content/excerpts/index.js').Excerpt} */ (getExcerpt('service-immersive'));
    expect(chapterShows('immersive-web-experiences', excerpt, STUB_SCREEN)).toBe(true);
    expect(chapterShows('immersive-web-experiences', excerpt, null)).toBe(false);
    expect(chapterShows('immersive-web-experiences', null, STUB_SCREEN)).toBe(false);
    expect(chapterShows('technical-audits', excerpt, null)).toBe(true);
  });

  it('Immersive leads door A with its screen; the AI systems chapter stays out, its excerpt a draft without a screen', () => {
    expect(serviceScreens['immersive-web-experiences']).not.toBeNull();
    expect(serviceScreens['intelligent-ai-systems']).toBeNull();
    expect(getExcerpt('service-ai-systems')).toBeNull();
    for (const includeDrafts of [false, true]) {
      const { container, unmount } = render(<ServiceChapters includeDrafts={includeDrafts} />);
      const order = Array.from(container.querySelectorAll('[data-chapter]')).map((el) => el.getAttribute('data-chapter'));
      expect(order).toEqual(chapterSlugs);
      unmount();
    }
  });

  it('in door A the Immersive chapter comes first with its tagline, summary, all seven scope items, its terms and its loop', () => {
    const service = serviceFor('immersive-web-experiences');
    const { container } = render(<ServiceChapters includeDrafts={false} />);
    const first = /** @type {HTMLElement} */ (container.querySelector('[data-chapter]'));
    expect(first.getAttribute('data-chapter')).toBe('immersive-web-experiences');
    expect(within(first).getByRole('heading', { level: 2, name: 'Immersive Web Experiences' })).toBeInTheDocument();
    expect(within(first).getByText('Beyond websites. Into experiences.')).toBeInTheDocument();
    expect(within(first).getByText(service.summary)).toBeInTheDocument();
    expect(service.scope).toHaveLength(7);
    expect(Array.from(first.querySelectorAll('li')).map((li) => li.textContent)).toEqual(service.scope);
    expect(first.querySelector('ul')?.className).toContain('lg:grid-cols-2');
    expect(within(first).getByText('Timeline and deposit set per project, after scoping.')).toBeInTheDocument();
    expect(first.querySelector('pre')?.textContent).toBe(excerpts['service-immersive'].code);
    expect(first.querySelector('video')).not.toBeNull();
    expect(first.querySelector('img[src="/media/services/immersive-web-experiences.jpg"]')).not.toBeNull();
    expect(first.textContent).not.toMatch(/\$\s?\d/);
  });

  it('the six existing chapters render alone as they do in door A’s list, each keeping its single-column four-item scope', () => {
    const { container: all } = render(<ServiceChapters includeDrafts={false} />);
    for (const slug of EXISTING) {
      const entry = /** @type {{ slug: string, excerptId: string }} */ (SERVICE_CHAPTERS.find((c) => c.slug === slug));
      const { container: one, unmount } = render(<ServiceChapterFor slug={slug} excerptId={entry.excerptId} includeDrafts={false} />);
      expect(all.querySelector(`[data-chapter="${slug}"]`)?.outerHTML, slug).toBe(one.innerHTML);
      unmount();
      // Four scope items each, so each keeps the single-column list.
      expect(serviceFor(slug).scope, slug).toHaveLength(4);
      expect(all.querySelector(`[data-chapter="${slug}"] ul`)?.className, slug).toBe('mt-6 space-y-2 border-t border-white/10 pt-6');
    }
  });

  it('with its screen, the Immersive chapter leads with its tagline, summary, every scope item in two columns from 1024 px, and its terms', () => {
    const service = serviceFor('immersive-web-experiences');
    const { container } = render(
      <ServiceChapterFor
        slug="immersive-web-experiences"
        excerptId="service-immersive"
        includeDrafts={false}
        screens={{ ...serviceScreens, 'immersive-web-experiences': STUB_SCREEN }}
      />,
    );
    const chapter = /** @type {HTMLElement} */ (container.querySelector('[data-chapter="immersive-web-experiences"]'));
    expect(within(chapter).getByRole('heading', { level: 2, name: 'Immersive Web Experiences' })).toBeInTheDocument();
    expect(within(chapter).getByText('Beyond websites. Into experiences.')).toBeInTheDocument();
    expect(within(chapter).getByText(service.summary)).toBeInTheDocument();
    expect(Array.from(chapter.querySelectorAll('li')).map((li) => li.textContent)).toEqual(service.scope);
    expect(chapter.querySelector('ul')?.className).toContain('lg:grid-cols-2');
    expect(within(chapter).getByText('Timeline and deposit set per project, after scoping.')).toBeInTheDocument();
    expect(chapter.querySelector('pre')?.textContent).toBe(excerpts['service-immersive'].code);
    expect(chapter.textContent).not.toMatch(/\$\s?\d/);
  });

  it('the AI systems chapter stays out while its excerpt is a draft, even with a screen; with drafts on and a screen it shows all eight items', () => {
    const screens = { ...serviceScreens, 'intelligent-ai-systems': STUB_SCREEN };
    // The draft is not in the site's registry (it never ships); the test brings it in.
    const registry = { ...excerpts, 'service-ai-systems': draftExcerpts['service-ai-systems'] };
    const props = { slug: 'intelligent-ai-systems', excerptId: 'service-ai-systems', screens, registry };
    const { container, rerender } = render(<ServiceChapterFor {...props} includeDrafts={false} />);
    expect(container.innerHTML).toBe('');
    rerender(<ServiceChapterFor {...props} includeDrafts />);
    const chapter = /** @type {HTMLElement} */ (container.querySelector('[data-chapter="intelligent-ai-systems"]'));
    expect(Array.from(chapter.querySelectorAll('li')).map((li) => li.textContent)).toEqual(serviceFor('intelligent-ai-systems').scope);
    expect(chapter.querySelectorAll('li')).toHaveLength(8);
    expect(chapter.querySelector('ul')?.className).toContain('lg:grid-cols-2');
  });

  it('ServiceText sets a scope of more than four items in two columns from 1024 px, and keeps the compact form without it', () => {
    const base = { slug: 'x', name: 'X', summary: 'Sum.', terms: 'T.' };
    const five = ['A.', 'B.', 'C.', 'D.', 'E.'];
    const { container, rerender } = render(<ServiceText service={{ ...base, scope: five }} />);
    expect(container.querySelector('ul')?.className).toBe('mt-6 space-y-2 border-t border-white/10 pt-6 lg:mt-4 lg:pt-4 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-2 lg:space-y-0');
    expect(container.querySelectorAll('li')).toHaveLength(5);
    rerender(<ServiceText service={{ ...base, scope: five.slice(0, 4) }} />);
    expect(container.querySelector('ul')?.className).toBe('mt-6 space-y-2 border-t border-white/10 pt-6');
    rerender(<ServiceText service={{ ...base, scope: five }} compact />);
    expect(container.querySelector('ul')).toBeNull();
  });

  it('a pinned chapter’s words rise only by what overflows the frame, never above a tenth of it or the navigation (2026-11-27)', () => {
    const { text } = chapterLayout(1024, 768);
    // Up to (76.8 − 122.88) px; by 99 % of the frame below their place, less their own height; never down.
    expect(wordsRise(text, 768)).toBe('translateY(clamp(-46.1px, calc(637.4px - 100%), 0px))');
    // Words already above the limit never move down.
    expect(wordsRise({ y: 50 }, 1000)).toBe('translateY(clamp(0.0px, calc(940.0px - 100%), 0px))');
  });

  it('the risen words stop at the navigation’s bottom on a short frame, where a tenth of it is less (final review, 2026-11-27)', () => {
    expect(NAV_FLOOR_PX).toBe(72);
    for (const [w, h] of [[1024, 700], [1024, 640], [1024, 600], [1280, 600], [1280, 590]]) {
      const { text } = chapterLayout(w, h);
      const highest = Number(/clamp\((-?[\d.]+)px/.exec(wordsRise(text, h))?.[1]);
      // At most up to 72 px from the frame's top (a tenth would be 59 to 70 px, under the bar).
      expect(text.y + highest, `${w} x ${h}`).toBeCloseTo(NAV_FLOOR_PX, 0);
    }
  });

  it('with the path bar under the nav, the words never sit or rise above its bottom (Living Source Phase 3)', () => {
    expect(PATH_BAR_FLOOR_PX).toBe(112);
    for (const [w, h] of [[1024, 700], [1024, 640], [1024, 600], [1280, 600], [1280, 590], [1280, 720]]) {
      const { text } = chapterLayout(w, h);
      const top = wordsTop(text, PATH_BAR_FLOOR_PX);
      expect(top, `${w} x ${h}: placed below the bar`).toBeGreaterThanOrEqual(PATH_BAR_FLOOR_PX);
      expect(top, `${w} x ${h}: never lower than the layout puts them`).toBeGreaterThanOrEqual(text.y);
      const highest = Number(/clamp\((-?[\d.]+)px/.exec(wordsRise({ y: top }, h, PATH_BAR_FLOOR_PX))?.[1]);
      expect(top + highest, `${w} x ${h}: risen, still below the bar`).toBeGreaterThanOrEqual(PATH_BAR_FLOOR_PX - 0.05);
    }
    // Without the bar the words keep the layout's place.
    expect(wordsTop({ y: 102.4 }, NAV_FLOOR_PX)).toBe(102.4);
  });

  it('with the path bar, a long scope takes the compact form 40 px of frame sooner', () => {
    // Seven items at 1024 px wide need a 768 px frame under the nav alone, not under the bar too.
    expect(wordsCompact(7, 1024, 768)).toBe(false);
    expect(wordsCompact(7, 1024, 768, PATH_BAR_FLOOR_PX)).toBe(true);
    expect(wordsCompact(7, 1024, 808, PATH_BAR_FLOOR_PX)).toBe(false);
    expect(wordsCompact(7, 1024, 807, PATH_BAR_FLOOR_PX)).toBe(true);
    expect(wordsCompact(4, 1024, 600, PATH_BAR_FLOOR_PX)).toBe(false);
  });

  it('a long scope takes the compact form on a short desktop frame; four items never do; phones always do (final review, 2026-11-27)', () => {
    const immersive = serviceFor('immersive-web-experiences').scope.length;
    expect(immersive).toBe(7);
    // The short screens where Immersive's words were cut off, and their neighbours.
    for (const [w, h] of [[1024, 767], [1024, 700], [1024, 640], [1024, 600], [1100, 720], [1152, 699], [1280, 680], [1280, 600], [1280, 590], [1920, 600]]) {
      expect(wordsCompact(immersive, w, h), `${w} x ${h}`).toBe(true);
      expect(wordsCompact(8, w, h), `8 items at ${w} x ${h}`).toBe(true);
    }
    // Screens tall enough for the two columns in full (e2e pins 1024 × 768 and 1280 × 720).
    for (const [w, h] of [[1024, 768], [1100, 800], [1152, 700], [1280, 700], [1280, 720], [1366, 768], [1440, 900], [1920, 1080], [2560, 1440]]) {
      expect(wordsCompact(immersive, w, h), `${w} x ${h}`).toBe(false);
    }
    // The five four-item chapters keep their full list at every desktop size, however short.
    const fourItem = ['mvp-sprints', 'custom-saas-builds', 'custom-web-development', 'ui-ux-design', 'ai-integration'];
    for (const slug of fourItem) {
      expect(serviceFor(slug).scope.length, slug).toBeLessThanOrEqual(4);
      for (const w of [1024, 1152, 1280, 1366, 1440, 1920, 2560]) {
        for (const h of [500, 590, 600, 640, 700, 720, 768, 900, 1440]) expect(wordsCompact(serviceFor(slug).scope.length, w, h), `${slug} ${w} x ${h}`).toBe(false);
      }
    }
    // Phones keep today's compact form, whatever the scope.
    for (const items of [1, 4, 7, 8]) expect(wordsCompact(items, 390, 844)).toBe(true);
    expect(wordsCompact(7, 1023, 1400)).toBe(true);
  });

  it('each service renders its name, summary and timeline from services.js', () => {
    render(<ServiceChapters includeDrafts />);
    for (const slug of chapterSlugs) {
      const service = services.find((s) => s.slug === slug);
      if (!service) throw new Error(slug);
      const chapter = within(/** @type {HTMLElement} */ (document.querySelector(`[data-chapter="${slug}"]`)));
      expect(chapter.getByRole('heading', { level: 2, name: service.name })).toBeInTheDocument();
      expect(chapter.getByText(service.summary)).toBeInTheDocument();
      expect(chapter.getByText(service.terms ?? service.timeline ?? '', { exact: false })).toBeInTheDocument();
    }
  });

  it('ServiceText shows the terms line in place of the timeline, and the tagline above the summary', () => {
    const base = { slug: 'x', name: 'X', summary: 'Sum.', scope: ['One.'] };
    const { container, rerender } = render(<ServiceText service={{ ...base, tagline: 'Tag.', terms: 'Terms here.' }} />);
    expect(container.textContent).toContain('Terms here.');
    expect(container.textContent).not.toContain('Timeline:');
    const texts = Array.from(container.querySelectorAll('p')).map((p) => p.textContent);
    expect(texts.indexOf('Tag.')).toBe(texts.indexOf('Sum.') - 1);
    rerender(<ServiceText service={{ ...base, timeline: '2 weeks', deposit: 'Half.' }} />);
    expect(container.textContent).toContain('Timeline: 2 weeks');
    expect(container.textContent).not.toContain('Tag.');
  });

  it('no service chapter renders a dollar amount or a startingPrice value', () => {
    const { container } = render(<ServiceChapters includeDrafts />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\$\s?\d/);
    for (const service of services) expect(text).not.toContain(String(service.startingPrice));
  });

  it('the AI integration chapter shows its real code beside the OpenRouter usage dashboard', () => {
    render(<ServiceChapters includeDrafts />);
    const ai = /** @type {HTMLElement} */ (document.querySelector('[data-chapter="ai-integration"]'));
    expect(ai.querySelector('pre')?.textContent).toContain('export async function generateSimpleCompletion(');
    expect(within(ai).getByRole('img', { name: /^An OpenRouter usage dashboard:/ })).toHaveAttribute('src', '/media/services/openrouter-usage.jpg');
  });

  it('without the renderer, a chapter with a screen shows its code and the screen it becomes', () => {
    render(<ServiceChapters includeDrafts />);
    const mvp = /** @type {HTMLElement} */ (document.querySelector('[data-chapter="mvp-sprints"]'));
    expect(mvp.querySelector('pre')?.textContent).toContain('<span className="text-[#fafafa]">Master Your Interviews</span>');
    expect(within(mvp).getByRole('img', { name: /UnderFire AI landing page/ })).toHaveAttribute('src', '/media/services/underfire-landing.jpg');
    const custom = /** @type {HTMLElement} */ (document.querySelector('[data-chapter="custom-saas-builds"]'));
    expect(within(custom).getByRole('img', { name: /Founders Helm dashboard/ })).toHaveAttribute('src', '/media/services/founders-helm-dashboard.jpg');
  });

  it('the audit chapter lists every line of its code for checking', () => {
    render(<ServiceChapters includeDrafts />);
    const audit = /** @type {HTMLElement} */ (document.querySelector('[data-chapter="technical-audits"]'));
    expect(audit.querySelectorAll('[data-audit-line]')).toHaveLength(23);
  });

  it('with the path bar, the pinned audit pads its frame by the header, so its stacked words start below it (Living Source Phase 3)', () => {
    const width = window.innerWidth;
    try {
      window.innerWidth = 768;
      setPathBarShown(true);
      const { unmount } = render(<ServiceChapterFor slug="technical-audits" excerptId="service-audit" includeDrafts={false} />);
      const frame = /** @type {HTMLElement} */ (document.querySelector('[data-chapter="technical-audits"] .pin-frame'));
      expect(frame.style.paddingTop).toBe(`${PATH_BAR_FLOOR_PX}px`);
      unmount();
      setPathBarShown(false);
      render(<ServiceChapterFor slug="technical-audits" excerptId="service-audit" includeDrafts={false} />);
      const plain = /** @type {HTMLElement} */ (document.querySelector('[data-chapter="technical-audits"] .pin-frame'));
      expect(plain.style.paddingTop).toBe('');
    } finally {
      window.innerWidth = width;
      setPathBarShown(false);
    }
  });

  it('with drafts off, the approved code still shows in all seven chapters', () => {
    const { container } = render(<ServiceChapters includeDrafts={false} />);
    expect(container.querySelectorAll('pre')).toHaveLength(7);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(7);
  });

  it('without the renderer, the two new services show their code beside a loop of this build (Chris, 2026-11-16)', () => {
    render(<ServiceChapters includeDrafts={false} />);
    for (const [slug, line] of [
      ['custom-web-development', '<Builder />'],
      ['ui-ux-design', 'const placed = sketchShapes(blocks, SKETCH_SPACE);'],
    ]) {
      const chapter = /** @type {HTMLElement} */ (document.querySelector(`[data-chapter="${slug}"]`));
      expect(chapter.querySelector('pre')?.textContent, slug).toContain(line);
      const video = chapter.querySelector('video');
      expect(video, slug).not.toBeNull();
      expect(chapter.querySelector(`img[src="/media/services/${slug}.jpg"]`), slug).not.toBeNull();
    }
  });
});
