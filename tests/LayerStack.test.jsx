// @ts-check
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { LayerStack, Provenance, StepTabs } from '../src/scenes/layers/index.js';

// What the stack asks of the loop is the contract here; MediaLoop's own playing is tested in MediaLoop.test.jsx.
vi.mock('../src/components/MediaLoop.jsx', () => ({
  default: (/** @type {{ active: boolean, alt: string }} */ { active, alt }) => <div data-loop-stub data-active={String(active)} aria-label={alt} />,
}));
import { layerTimeline } from '../src/scenes/layers/layerTimeline.js';

/** @type {import('../src/content/excerpts/index.js').Excerpt} */
const EXCERPT = {
  id: 'test',
  file: 'mood-engine.ts',
  repo: 'cja86104/underfireai',
  path: 'lib/ai/mood-engine.ts',
  lines: [37, 52],
  commit: 'bee33d2',
  code: 'const TRIGGER_DELTAS = {\n  strong_answer: 12,\n  weak_answer: -12,\n};',
  becomes: 'The interviewer’s mood, answer by answer.',
  approved: { by: 'Chris', on: '2026-11-09' },
};
const IMAGE = { src: '/media/services/underfire-landing.jpg', alt: 'UnderFire AI’s interview screen', width: 1280, height: 800 };
const VIDEO = { ...IMAGE, video: '/media/services/underfire.mp4' };

/** @param {Partial<import('react').ComponentProps<typeof LayerStack>>} props */
const renderStack = (props) =>
  render(<LayerStack excerpt={EXCERPT} screen={IMAGE} progress={0} flat={false} view="result" width={760} {...props} />);

const box = () => /** @type {HTMLElement} */ (document.querySelector('[data-layer-stack] [data-layer-box]'));
const plane = (/** @type {string} */ name) => /** @type {HTMLElement} */ (document.querySelector(`[data-plane="${name}"]`));

describe('LayerStack (Living Source Phase 4)', () => {
  it('holds the three planes: the source, the characters in flight, the real result', () => {
    renderStack({});
    expect(plane('source')).toHaveAttribute('aria-hidden', 'true');
    expect(plane('source')).toHaveTextContent('strong_answer: 12,');
    expect(plane('flight')).toHaveAttribute('aria-hidden', 'true');
    expect(plane('flight').querySelectorAll('span').length).toBe(EXCERPT.code.replace(/\s/g, '').length);
    expect(within(plane('result')).getByRole('img', { name: IMAGE.alt })).toBeInTheDocument();
  });

  it('is tilted at the start and flat and face-on at the end', () => {
    const { rerender } = renderStack({ progress: 0 });
    expect(box().style.transform).toContain('rotateX(52deg)');
    expect(document.querySelector('[data-layer-stack]')).toHaveAttribute('data-step', 'source');
    rerender(<LayerStack excerpt={EXCERPT} screen={IMAGE} progress={1} flat={false} view="result" width={760} />);
    expect(box().style.transform).toContain('rotateX(0deg)');
    expect(document.querySelector('[data-layer-stack]')).toHaveAttribute('data-step', 'result');
  });

  it('drives every character by one value on its plane, the travel', () => {
    renderStack({ progress: 0.4 });
    expect(Number(plane('flight').style.getPropertyValue('--t'))).toBeCloseTo(layerTimeline(0.4).travel, 3);
    const first = /** @type {HTMLElement} */ (plane('flight').querySelector('span'));
    for (const v of ['--x0', '--y0', '--x1', '--y1', '--d']) expect(first.style.getPropertyValue(v)).not.toBe('');
  });

  it('plays a video screen only once the result has landed', () => {
    const { rerender } = renderStack({ screen: VIDEO, progress: 0.8 });
    expect(plane('result').querySelector('[data-loop-stub]')).toHaveAttribute('data-active', 'false');
    rerender(<LayerStack excerpt={EXCERPT} screen={VIDEO} progress={1} flat={false} view="result" width={760} />);
    expect(plane('result').querySelector('[data-loop-stub]')).toHaveAttribute('data-active', 'true');
  });

  it('flat (reduced motion, no renderer): no tilt, and the view chooses the plane shown', () => {
    renderStack({ flat: true, view: 'source' });
    expect(box().style.transform).not.toContain('52deg');
    expect(plane('source').style.opacity).toBe('1');
    expect(document.querySelector('[data-layer-stack]')).toHaveAttribute('data-step', 'source');
  });

  it('scales a 30-line excerpt to fit a phone’s 320 px plane', () => {
    const code = Array.from({ length: 30 }, (_, i) => `  const value_${i} = compute(input_${i}, options);`).join('\n');
    renderStack({ excerpt: { ...EXCERPT, code }, width: 320 });
    const source = plane('source');
    const size = parseFloat(source.style.fontSize);
    const widest = Math.max(...code.split('\n').map((l) => l.length));
    expect(size * 0.6 * widest).toBeLessThanOrEqual(320);
    expect(size * (19 / 13) * 30).toBeLessThanOrEqual(320 * (800 / 1280));
  });
});

describe('StepTabs', () => {
  it('names the steps, marks the current one and moves to the one chosen', () => {
    const onPick = vi.fn();
    render(<StepTabs current="transformation" onPick={onPick} phone={false} />);
    const group = screen.getByRole('group', { name: 'Steps' });
    const buttons = within(group).getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(['01 Source', '02 Transformation', '03 Result']);
    expect(buttons[1]).toHaveAttribute('aria-current', 'step');
    expect(buttons[0]).not.toHaveAttribute('aria-current');
    fireEvent.click(buttons[2]);
    expect(onPick).toHaveBeenCalledWith('result');
  });

  it('on a phone the middle step reads Flight', () => {
    render(<StepTabs current="source" onPick={() => {}} phone />);
    expect(screen.getByRole('button', { name: '02 Flight' })).toBeInTheDocument();
  });
});

describe('Provenance', () => {
  it('names where the code comes from and what it becomes, with no link', () => {
    const { container } = render(<Provenance excerpt={EXCERPT} />);
    expect(container).toHaveTextContent('cja86104/underfireai');
    expect(container).toHaveTextContent('lib/ai/mood-engine.ts');
    expect(container).toHaveTextContent('lines 37–52');
    expect(container).toHaveTextContent('bee33d2');
    expect(container).toHaveTextContent('approved 2026-11-09');
    expect(container).toHaveTextContent(EXCERPT.becomes);
    expect(container.querySelector('a')).toBeNull();
  });
});
