import { describe, expect, it } from 'vitest';
import { memorial } from '../src/content/memorial';
import { prerenderRoutes } from '../src/lib/routes';
import { render } from '../src/entry-server';

describe('prerendering', () => {
  it('writes every public page, every photograph, and a not-found page, but not the family demonstration', () => {
    const paths = prerenderRoutes(memorial).map((route) => route.path);
    expect(paths).toEqual(expect.arrayContaining(['/', '/story', '/photographs', '/share', '/privacy', '/family', '/404']));
    expect(paths.filter((path) => path.startsWith('/photographs/'))).toHaveLength(memorial.photos.items.length);
    expect(paths).not.toContain('/family/preview');
  });

  it('titles each page from the content', () => {
    const story = prerenderRoutes(memorial).find((route) => route.path === '/story');
    expect(story?.title).toBe('Her life · Eleanor “Nell” Whitaker, 1946–2026');
  });

  it('renders the memorial’s words into the HTML, with the gathering as it stands at build time', () => {
    const html = render('/', Date.parse('2026-11-24T12:00:00Z'));
    expect(html).toContain('Eleanor “Nell”');
    expect(html).toContain('Took place');
    const before = render('/', Date.parse('2026-09-28T12:00:00Z'));
    expect(before).toContain('Service details');
  });

  it('renders a shared photograph link as its own page and an unknown address as not found', () => {
    expect(render('/photographs/porch-2019', 0)).toContain('Theo had just asked whether she had been alive when dinosaurs were.');
    expect(render('/nowhere', 0)).toContain('This page isn’t here.');
  });
});
