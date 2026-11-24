import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { memorial } from '../src/content/memorial';
import type { Memorial } from '../src/content/types';
import { availableCollections, filterPhotos, photoShape } from '../src/lib/photos';
import { renderMemorial } from './render';

const clone = (): Memorial => structuredClone(memorial);

describe('the full story', () => {
  it('sets every chapter in full with a chapter list and a way back', () => {
    renderMemorial(memorial, { path: '/story' });
    expect(screen.getByRole('heading', { level: 1, name: 'A life, in chapters.' })).toBeInTheDocument();
    const toc = screen.getByRole('navigation', { name: 'Chapters' });
    expect(
      within(toc)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['#story-growing-up', '#story-library-years', '#story-house-with-room', '#story-passed-on']);
    expect(screen.getByText(/Mrs. Lyda, let her take out six books/)).toBeInTheDocument();
    expect(screen.getByText(/Written by Ruth Whitaker Ames/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return to the memorial' })).toHaveAttribute('href', '/');
    expect(document.title).toBe('Her life · Eleanor “Nell” Whitaker, 1946–2026');
  });

  it('is linked from the main memorial', () => {
    renderMemorial(memorial);
    expect(screen.getByRole('link', { name: 'Read her full story' })).toHaveAttribute('href', '/story');
  });

  it('falls back to the short chapter when there is no longer version, and drops the chapter list for one chapter', () => {
    const content = clone();
    const [first] = content.life.chapters;
    if (!first) throw new Error('fixture');
    first.body = [];
    content.life.chapters = [first];
    renderMemorial(content, { path: '/story' });
    expect(screen.getByText(/grew up in the rooms above her father’s feed-and-seed store/)).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Chapters' })).toBeNull();
  });
});

describe('the photograph collection', () => {
  it('orders photographs by date and filters by collection', () => {
    const all = filterPhotos(memorial.photos.items, 'all');
    expect(all[0]?.id).toBe('haywood-road-1952');
    expect(all.at(-1)?.id).toBe('kitchen-table-2026');
    expect(filterPhotos(memorial.photos.items, 'early-years').map((photo) => photo.id)).toEqual([
      'haywood-road-1952',
      'graduation-1968',
      'courthouse-1969',
    ]);
    expect(availableCollections(memorial.photos.items)).toHaveLength(4);
  });

  it('keeps three controlled shapes', () => {
    expect(memorial.photos.items.map(photoShape)).toEqual(expect.arrayContaining(['landscape', 'portrait', 'square']));
  });

  it('offers filters as real links and marks the current one', () => {
    renderMemorial(memorial, { path: '/photographs?show=family' });
    const filters = screen.getByRole('navigation', { name: 'Photograph collections' });
    expect(within(filters).getByRole('link', { name: 'Family' })).toHaveAttribute('aria-current', 'page');
    expect(within(filters).getByRole('link', { name: 'All photographs' })).toHaveAttribute('href', '/photographs');
    expect(screen.getByText('5 photographs')).toHaveAttribute('role', 'status');
  });

  it('opens a photograph in the lightbox, moves with the arrow keys, and closes with Escape back to the photograph', async () => {
    const user = userEvent.setup();
    renderMemorial(memorial, { path: '/photographs?show=early-years' });
    const link = screen.getByRole('link', { name: 'Nell on the steps of the feed store on Haywood Road.' });
    await user.click(link);

    const dialog = screen.getByRole('dialog', { name: 'Nell on the steps of the feed store on Haywood Road.' });
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(within(dialog).getByText('1 of 3')).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Previous photograph' })).toBeNull();

    act(() => {
      fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    });
    expect(screen.getByRole('dialog', { name: 'Graduation day in Boone. The wind won.' })).toBeInTheDocument();

    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Next photograph' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('3 of 3');
    expect(within(screen.getByRole('dialog')).queryByRole('button', { name: 'Next photograph' })).toBeNull();
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' })).toHaveFocus();

    act(() => {
      screen.getByRole('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('link', { name: 'Nell and Hal outside the courthouse, the day they married.' })).toHaveFocus();
  });

  it('gives a shared photograph link its own page', () => {
    renderMemorial(memorial, { path: '/photographs/porch-2019' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('heading', { level: 1, name: 'Nell on the back porch, late summer, 2019.' })).toBeInTheDocument();
    expect(
      screen.getByText('Theo had just asked whether she had been alive when dinosaurs were. She said only the small ones.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Next: / })).toHaveAttribute('href', '/photographs/garden-2023');
  });

  it('shows the not-found page for an unknown photograph or address', () => {
    renderMemorial(memorial, { path: '/photographs/not-a-photo' });
    expect(screen.getByRole('heading', { level: 1, name: 'This page isn’t here.' })).toBeInTheDocument();
  });

  it('handles a large collection', () => {
    const content = clone();
    const [template] = content.photos.items;
    if (!template) throw new Error('fixture');
    content.photos.items = Array.from({ length: 120 }, (_, index) => ({
      ...template,
      id: `photo-${index}`,
      caption: `Photograph ${index}`,
    }));
    content.photos.featured = [];
    content.opening.portraitId = 'photo-0';
    content.site.socialImageId = 'photo-0';
    delete content.closing.photoId;
    content.life.chapters.forEach((chapter) => delete chapter.photoId);
    renderMemorial(content, { path: '/photographs' });
    expect(screen.getByText('120 photographs')).toHaveAttribute('role', 'status');
    expect(screen.getAllByRole('link', { name: /^Photograph \d+$/ })).toHaveLength(120);
  });
});
