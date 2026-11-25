import { describe, expect, it } from 'vitest';
import { render, routes } from '../src/entry-server';

describe('prerendering', () => {
  it('writes every page and a not-found page', () => {
    expect(routes.map((route) => route.path)).toEqual(['/', '/beer', '/taproom', '/story', '/find-us', '/contact', '/404']);
    expect(routes[0]?.title).toBe('Founding Fathoms Brewing · Brewing · Harbor');
  });

  it('puts the home page’s words in the HTML, with no hidden reveal styles', () => {
    const home = render('/');
    for (const words of ['Currently pouring', 'Harbor Lights IPA', 'The Can Club', 'I work the morning boats', 'Batch on deck'])
      expect(home).toContain(words);
    expect(home).not.toContain('opacity:0');
  });

  it('puts every inner page’s words in the HTML', () => {
    expect(render('/beer')).toContain('Autumn Plimsoll');
    expect(render('/taproom')).toContain('First Saturday of the month · 2 PM');
    expect(render('/story')).toContain('Warehouse 4 on the east pier');
    expect(render('/find-us')).toContain('Railcar Craft Cellar');
    expect(render('/contact')).toContain('Write us');
  });

  it('renders the not-found page for an unknown address', () => {
    expect(render('/this-page-does-not-exist')).toContain('Nothing on this tap.');
  });
});
