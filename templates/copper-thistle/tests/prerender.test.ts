import { describe, expect, it } from 'vitest';
import { render, routes } from '../src/entry-server';

describe('prerendering', () => {
  it('writes every page and a not-found page', () => {
    expect(routes.map((route) => route.path)).toEqual(['/', '/menu', '/about', '/gallery', '/reservations', '/contact', '/404']);
  });

  it('puts each page’s words in the HTML, with every menu section and no hidden reveal styles', () => {
    expect(render('/')).toContain('Rooted in the');
    const menu = render('/menu');
    for (const dish of ['Heirloom Beet Carpaccio', 'Dry-Aged Ribeye, 14oz', 'Maple Panna Cotta', 'Amaro Digestivo Flight'])
      expect(menu).toContain(dish);
    expect(menu).not.toContain('opacity:0');
  });
});
