import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Photo } from '../src/components/Photo';

const photo = { src: 'https://example.com/table.jpg', alt: 'A table set for two' };

describe('Photo', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the photograph with its description as alt text', () => {
    render(<Photo photo={photo} />);
    expect(screen.getByRole('img', { name: photo.alt }).tagName).toBe('IMG');
  });

  it('replaces a photograph that fails to load with a panel carrying its description', () => {
    render(<Photo photo={photo} />);
    fireEvent.error(screen.getByRole('img', { name: photo.alt }));
    const panel = screen.getByRole('img', { name: photo.alt });
    expect(panel.tagName).toBe('DIV');
    expect(panel).toHaveTextContent(photo.alt);
  });

  it('notices an image that had already failed before React attached to it', () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(0);
    render(<Photo photo={photo} />);
    expect(screen.getByRole('img', { name: photo.alt }).tagName).toBe('DIV');
  });

  it('keeps an image that loaded', () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(1600);
    render(<Photo photo={photo} />);
    expect(screen.getByRole('img', { name: photo.alt }).tagName).toBe('IMG');
  });
});
