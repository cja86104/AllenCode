// @ts-check
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import ServiceChapters, { SERVICE_CHAPTERS } from '../src/scenes/ServiceChapters.jsx';
import { services } from '../src/data/services.js';

const chapterSlugs = SERVICE_CHAPTERS.map((c) => c.slug);

describe('ServiceChapters', () => {
  it('covers MVP sprints, custom builds, AI integration and audits, in that order, all from services.js', () => {
    expect(chapterSlugs).toEqual(['mvp-sprints', 'custom-saas-builds', 'ai-integration', 'technical-audits']);
    for (const slug of chapterSlugs) expect(services.some((s) => s.slug === slug)).toBe(true);
  });

  it('each service renders its name, summary and timeline from services.js', () => {
    render(<ServiceChapters includeDrafts />);
    for (const slug of chapterSlugs) {
      const service = services.find((s) => s.slug === slug);
      if (!service) throw new Error(slug);
      const chapter = within(/** @type {HTMLElement} */ (document.querySelector(`[data-chapter="${slug}"]`)));
      expect(chapter.getByRole('heading', { level: 2, name: service.name })).toBeInTheDocument();
      expect(chapter.getByText(service.summary)).toBeInTheDocument();
      expect(chapter.getByText(service.timeline, { exact: false })).toBeInTheDocument();
    }
  });

  it('no service chapter renders a dollar amount or a startingPrice value', () => {
    const { container } = render(<ServiceChapters includeDrafts />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\$\s?\d/);
    for (const service of services) expect(text).not.toContain(String(service.startingPrice));
  });

  it('the AI integration chapter shows its real code beside the Crew Advisors screen', () => {
    render(<ServiceChapters includeDrafts />);
    const ai = /** @type {HTMLElement} */ (document.querySelector('[data-chapter="ai-integration"]'));
    expect(ai.querySelector('pre')?.textContent).toContain('export async function generateSimpleCompletion(');
    expect(within(ai).getByRole('img', { name: /^Crew Advisors:/ })).toHaveAttribute('src', '/media/services/crew-advisors.jpg');
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

  it('with drafts off, the approved code still shows in all four chapters', () => {
    const { container } = render(<ServiceChapters includeDrafts={false} />);
    expect(container.querySelectorAll('pre')).toHaveLength(4);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(4);
  });
});
