// @ts-check
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollEngine from '../src/scroll/ScrollEngine.jsx';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const root = () => document.documentElement;

describe('ScrollEngine', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('turns the engine on while mounted', () => {
    const view = render(<ScrollEngine enabled />);
    expect(root().dataset.scrollEngine).toBe('on');
    expect(root().classList.contains('lenis')).toBe(true);
    view.unmount();
  });

  it('reports off and creates no Lenis instance when disabled', () => {
    const view = render(<ScrollEngine enabled={false} />);
    expect(root().dataset.scrollEngine).toBe('off');
    expect(root().classList.contains('lenis')).toBe(false);
    view.unmount();
  });

  it('ScrollEngine leaves zero ScrollTriggers and no Lenis instance after unmount, including a StrictMode double mount', () => {
    const view = render(
      <StrictMode>
        <ScrollEngine enabled />
      </StrictMode>,
    );
    expect(root().dataset.scrollEngine).toBe('on');
    view.unmount();
    expect(ScrollTrigger.getAll()).toHaveLength(0);
    expect(root().classList.contains('lenis')).toBe(false);
    expect(root().dataset.scrollEngine).toBeUndefined();
  });
});
