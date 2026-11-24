// @ts-check
import { describe, expect, it } from 'vitest';
import { templateLoopAlt, templateStatusLabel } from '../src/data/templateStatus.js';
import { templates } from '../src/data/templates.js';

describe('template status on the page', () => {
  it('labels a concept as a concept preview and a built template as ready', () => {
    expect(templateStatusLabel({ name: 'Vow — Wedding', category: 'Events', status: 'concept' })).toBe('Concept preview, coming soon');
    expect(templateStatusLabel({ name: 'Evergreen — Memorial and Tribute', category: 'Family and Memories', status: 'ready' })).toBe('Ready to build');
  });

  it('only calls a loop a concept preview when it is one', () => {
    const evergreen = templates.find((template) => template.id === 'evergreen');
    const vow = templates.find((template) => template.id === 'vow');
    if (!evergreen || !vow) throw new Error('fixture');
    expect(templateLoopAlt(evergreen)).toBe('Evergreen, a preview of the family and memories template');
    expect(templateLoopAlt(vow)).toBe('Vow, a concept preview of the events template');
  });
});
