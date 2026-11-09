// @ts-check
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import CodeBeside from '../src/field/CodeBeside.jsx';

/** @type {import('../src/content/excerpts/index.js').Excerpt} */
const excerpt = {
  id: 'fixture',
  file: 'week-planner.ts',
  repo: 'cja86104/AllenCode',
  path: 'src/fixture.ts',
  lines: [1, 2],
  commit: 'b6701932a0fb3c170f9e5c060cc0c47086633a64',
  code: "export const week = plan('K');\nreturn week;",
  becomes: 'the week planner screen',
  approved: null,
};

describe('CodeBeside', () => {
  it('CodeBeside renders the code verbatim, the file name and the result', () => {
    const { container } = render(<CodeBeside excerpt={excerpt} result={<p>Planner result</p>} />);
    expect(container.querySelector('pre')?.textContent).toBe(excerpt.code);
    expect(screen.getByText('week-planner.ts')).toBeInTheDocument();
    expect(screen.getByText('Planner result')).toBeInTheDocument();
  });

  it('describes what the code is and what it becomes for screen readers', () => {
    render(<CodeBeside excerpt={excerpt} result={<p>Planner result</p>} />);
    expect(screen.getByText('Code from week-planner.ts (cja86104/AllenCode), which becomes the week planner screen.')).toBeInTheDocument();
  });

  it('colors keywords with the brand orange', () => {
    const { container } = render(<CodeBeside excerpt={excerpt} result={null} />);
    const keyword = [...container.querySelectorAll('pre span')].find((el) => el.textContent === 'export');
    expect(keyword?.getAttribute('style')).toContain('rgb(249, 115, 22)');
  });
});

describe('CodeBeside typography', () => {
  it('turns ligatures off so the literal characters show', () => {
    const { container } = render(<CodeBeside excerpt={excerpt} result={null} />);
    expect(container.querySelector('pre')?.className).toContain('[font-variant-ligatures:none]');
  });
});
