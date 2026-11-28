// @ts-check
import { afterEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { PATH_BAR_FLOOR_PX, PATH_BAR_MIN_WIDTH, setPathBarShown, useWordsFloor } from '../src/pathbar/pathBarStore.js';

afterEach(() => setPathBarShown(false));

describe('the path bar’s floor for pinned words (Living Source Phase 3)', () => {
  it('is the header’s bottom with the bar shown from 768 px, and none otherwise', () => {
    expect(PATH_BAR_FLOOR_PX).toBe(112);
    expect(PATH_BAR_MIN_WIDTH).toBe(768);
    const { result, rerender } = renderHook(({ width }) => useWordsFloor(width), { initialProps: { width: 768 } });
    expect(result.current).toBe(0);
    act(() => setPathBarShown(true));
    expect(result.current).toBe(112);
    rerender({ width: 767 });
    expect(result.current).toBe(0);
    rerender({ width: 1440 });
    expect(result.current).toBe(112);
  });
});
