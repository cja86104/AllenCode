// @ts-check
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { DOOR_STORAGE_KEY, readDoor, writeDoor } from '../src/door/doorStorage.js';
import DoorProvider, { useDoor } from '../src/door/DoorProvider.jsx';
import { fieldBus } from '../src/field/fieldBus.js';

afterEach(() => {
  vi.restoreAllMocks();
  window.sessionStorage.clear();
  fieldBus.set({ door: null });
});

describe('door storage', () => {
  it('a written door is read back', () => {
    writeDoor('b');
    expect(readDoor()).toBe('b');
  });

  it('readDoor returns null when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readDoor()).toBeNull();
  });

  it('writeDoor does not throw when storage is full', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(() => writeDoor('a')).not.toThrow();
  });

  it('an unrecognised stored value reads as no door', () => {
    window.sessionStorage.setItem(DOOR_STORAGE_KEY, 'c');
    expect(readDoor()).toBeNull();
  });
});

function Probe() {
  const { door, setDoor } = useDoor();
  return (
    <button type="button" onClick={() => setDoor('a')}>
      door:{door ?? 'none'}
    </button>
  );
}

describe('DoorProvider', () => {
  it('starts from the stored door', () => {
    writeDoor('b');
    render(
      <DoorProvider>
        <Probe />
      </DoorProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('door:b');
  });

  it('setDoor updates the state, storage and fieldBus', () => {
    render(
      <DoorProvider>
        <Probe />
      </DoorProvider>,
    );
    act(() => screen.getByRole('button').click());
    expect(screen.getByRole('button')).toHaveTextContent('door:a');
    expect(readDoor()).toBe('a');
    expect(fieldBus.get().door).toBe('a');
  });
});
