// @ts-check
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { fieldBus, useField } from '../src/field/fieldBus.js';

/** Shows the field's mode, as the gate's layout depends on it. */
function Probe() {
  const { mode } = useField();
  return <p data-mode={mode}>{mode}</p>;
}

afterEach(() => {
  act(() => fieldBus.set({ mode: 'pending' }));
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('useField while hydrating (found in W2.4: a late-hydrating home page)', () => {
  it('hydrates with what the server rendered even when the field has decided meanwhile, then shows the field’s mode', async () => {
    const html = renderToString(<Probe />);
    expect(html).toContain('pending');
    // The app shell's field decides before a lazily loaded page hydrates (no WebGL: static).
    fieldBus.set({ mode: 'static' });
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const recoverable = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => {
      hydrateRoot(container, <Probe />, { onRecoverableError: recoverable });
    });
    expect(recoverable).not.toHaveBeenCalled();
    expect(consoleError.mock.calls.map((call) => call.map(String).join(' ')).filter((text) => /hydrat|did not match/i.test(text))).toEqual([]);
    expect(container.querySelector('p')?.dataset.mode).toBe('static');
  });
});
