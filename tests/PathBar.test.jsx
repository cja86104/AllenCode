// @ts-check
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import DoorProvider from '../src/door/DoorProvider.jsx';
import PathBar, { PathChip } from '../src/pathbar/PathBar.jsx';
import { readPathBarShown } from '../src/pathbar/pathBarStore.js';

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

/**
 * @param {import('react').ReactElement} ui
 * @param {string} [path]
 */
const renderAt = (ui, path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <DoorProvider>{ui}</DoorProvider>
    </MemoryRouter>,
  );

describe('PathBar (Living Source Phase 3)', () => {
  it('names the place: a nav called "Where you are" holding an ordered list, at the origin on the home page', () => {
    renderAt(<PathBar />);
    const nav = screen.getByRole('navigation', { name: 'Where you are' });
    expect(nav.closest('[data-path-bar]')).not.toBeNull();
    const list = within(nav).getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(within(nav).getByRole('link', { name: 'allencode' })).toHaveAttribute('href', '/');
    const origin = within(nav).getByRole('button', { name: '00_origin' });
    expect(origin).toHaveAttribute('aria-current', 'location');
  });

  it('an inner page is a file under pages, and that file is where you are', () => {
    renderAt(<PathBar />, '/services');
    const nav = within(screen.getByRole('navigation', { name: 'Where you are' }));
    expect(nav.getByRole('button', { name: 'pages' })).not.toHaveAttribute('aria-current');
    expect(nav.getByRole('button', { name: 'services' })).toHaveAttribute('aria-current', 'location');
  });

  it('a product page goes through products, a link to the products page', () => {
    renderAt(<PathBar />, '/products/underfire-ai');
    const nav = within(screen.getByRole('navigation', { name: 'Where you are' }));
    expect(nav.getByRole('link', { name: 'products' })).toHaveAttribute('href', '/products');
    expect(nav.getByRole('button', { name: 'underfire-ai' })).toHaveAttribute('aria-current', 'location');
  });

  it('the current file shows its branch and the file itself as where you are', () => {
    renderAt(<PathBar currentId="02_our-work/underfire-ai" />);
    const nav = within(screen.getByRole('navigation', { name: 'Where you are' }));
    expect(nav.getByRole('button', { name: '02_our-work' })).not.toHaveAttribute('aria-current');
    expect(nav.getByRole('button', { name: 'underfire-ai' })).toHaveAttribute('aria-current', 'location');
  });

  it('every segment but allencode is a closed disclosure', () => {
    renderAt(<PathBar currentId="02_our-work/underfire-ai" />);
    const nav = within(screen.getByRole('navigation', { name: 'Where you are' }));
    const buttons = nav.getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(['02_our-work', 'underfire-ai']);
    for (const button of buttons) expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('marks itself shown while mounted, so the pinned chapters keep their words below it', () => {
    const { unmount } = renderAt(<PathBar />);
    expect(readPathBarShown()).toBe(true);
    unmount();
    expect(readPathBarShown()).toBe(false);
  });
});

describe('PathChip (the phone)', () => {
  it('reads the branch number and the file', () => {
    renderAt(<PathChip currentId="02_our-work/underfire-ai" />);
    const nav = within(screen.getByRole('navigation', { name: 'Where you are' }));
    const chip = nav.getByRole('button', { name: '02 / underfire-ai' });
    expect(chip).toHaveAttribute('data-path-chip');
    expect(chip).toHaveAttribute('aria-expanded', 'false');
  });

  it('reads a one-file branch by its name, the origin before a file, and an inner page under pages', () => {
    renderAt(<PathChip currentId="05_who-builds-it" />);
    expect(screen.getByRole('button', { name: '05 / who-builds-it' })).toBeInTheDocument();
    cleanup();
    renderAt(<PathChip />);
    expect(screen.getByRole('button', { name: '00 / origin' })).toBeInTheDocument();
    cleanup();
    renderAt(<PathChip />, '/about');
    expect(screen.getByRole('button', { name: 'pages / about' })).toBeInTheDocument();
  });
});

/** Navigates from inside the router, for the route-change test. @type {{ go: (to: string) => void }} */
const router = { go: () => {} };
function Navigator() {
  const navigate = useNavigate();
  useEffect(() => {
    router.go = (to) => navigate(to);
  }, [navigate]);
  return null;
}

/** The open menu a disclosure button controls. @param {HTMLElement} button */
const panelOf = async (button) => {
  const id = button.getAttribute('aria-controls');
  expect(id).toBeTruthy();
  return /** @type {HTMLElement} */ (await waitFor(() => {
    const panel = document.getElementById(/** @type {string} */ (id));
    if (!panel) throw new Error(`no panel #${id}`);
    return panel;
  }));
};

describe('the menus (Living Source Phase 3, Task 3)', () => {
  it('the branch segment lists the eight branches', async () => {
    renderAt(<PathBar currentId="02_our-work/underfire-ai" />);
    const branch = screen.getByRole('button', { name: '02_our-work' });
    fireEvent.click(branch);
    expect(branch).toHaveAttribute('aria-expanded', 'true');
    const panel = await panelOf(branch);
    const rows = within(panel).getAllByRole('listitem');
    expect(rows).toHaveLength(8);
    expect(rows[2]).toHaveTextContent('02_our-work');
    expect(within(rows[2]).getByRole('button')).toHaveAttribute('aria-current', 'location');
  });

  it('the file segment lists its branch’s files, the current one marked', async () => {
    renderAt(<PathBar currentId="02_our-work/underfire-ai" />);
    const file = screen.getByRole('button', { name: 'underfire-ai' });
    fireEvent.click(file);
    const panel = await panelOf(file);
    const rows = within(panel).getAllByRole('button');
    expect(rows).toHaveLength(4);
    const current = rows.find((r) => r.getAttribute('aria-current') === 'location');
    expect(current).toHaveTextContent('underfire-ai');
    expect(current).toHaveTextContent('UnderFire AI');
  });

  it('Escape closes it and returns focus to its segment', async () => {
    renderAt(<PathBar currentId="02_our-work/underfire-ai" />);
    const branch = screen.getByRole('button', { name: '02_our-work' });
    fireEvent.click(branch);
    const panel = await panelOf(branch);
    within(panel).getAllByRole('button')[0].focus();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(branch).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(branch);
  });

  it('ArrowDown moves from the segment into the rows, End and Home to the ends', async () => {
    renderAt(<PathBar currentId="02_our-work/underfire-ai" />);
    const branch = screen.getByRole('button', { name: '02_our-work' });
    fireEvent.click(branch);
    const rows = within(await panelOf(branch)).getAllByRole('button');
    branch.focus();
    fireEvent.keyDown(branch, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(rows[0]);
    fireEvent.keyDown(rows[0], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(rows[1]);
    fireEvent.keyDown(rows[1], { key: 'End' });
    expect(document.activeElement).toBe(rows[7]);
    fireEvent.keyDown(rows[7], { key: 'Home' });
    expect(document.activeElement).toBe(rows[0]);
  });

  it('a click outside closes it', async () => {
    renderAt(<PathBar currentId="02_our-work/underfire-ai" />);
    const branch = screen.getByRole('button', { name: '02_our-work' });
    fireEvent.click(branch);
    await panelOf(branch);
    fireEvent.pointerDown(document.body);
    expect(branch).toHaveAttribute('aria-expanded', 'false');
  });

  it('a route change closes it', async () => {
    renderAt(
      <>
        <Navigator />
        <PathBar />
      </>,
      '/services',
    );
    const pages = screen.getByRole('button', { name: 'pages' });
    fireEvent.click(pages);
    await panelOf(pages);
    act(() => router.go('/about'));
    expect(screen.getByRole('button', { name: 'pages' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('choosing a home file calls onGo with its id and closes', async () => {
    const onGo = vi.fn();
    renderAt(<PathBar currentId="02_our-work/underfire-ai" onGo={onGo} />);
    const branch = screen.getByRole('button', { name: '02_our-work' });
    fireEvent.click(branch);
    const rows = within(await panelOf(branch)).getAllByRole('button');
    fireEvent.click(rows[1]);
    // A branch with files starts at its first file; a one-file branch is its own.
    expect(onGo).toHaveBeenCalledWith('01_services/immersive-web-experiences');
    expect(branch).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(branch);
    fireEvent.click(within(await panelOf(branch)).getAllByRole('button')[5]);
    expect(onGo).toHaveBeenLastCalledWith('05_who-builds-it');
  });

  it('on an inner page, pages lists the home branches and the page lists the pages as links', async () => {
    renderAt(<PathBar />, '/services');
    const page = screen.getByRole('button', { name: 'services' });
    fireEvent.click(page);
    const links = within(await panelOf(page)).getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['/services', '/products', '/templates', '/about', '/contact']);
    expect(links[0]).toHaveAttribute('aria-current', 'location');
    fireEvent.pointerDown(document.body);
    const pages = screen.getByRole('button', { name: 'pages' });
    fireEvent.click(pages);
    expect(within(await panelOf(pages)).getAllByRole('button')).toHaveLength(8);
  });

  it('the phone chip opens the whole tree as a sheet: every branch, every file, then the pages', async () => {
    renderAt(<PathChip currentId="02_our-work/underfire-ai" />);
    const chip = screen.getByRole('button', { name: /underfire-ai/ });
    fireEvent.click(chip);
    expect(chip).toHaveAttribute('aria-expanded', 'true');
    const sheet = await panelOf(chip);
    expect(sheet).toHaveAttribute('data-path-sheet');
    const branches = /** @type {HTMLElement[]} */ ([...sheet.querySelectorAll('[data-path-sheet-branch]')]);
    expect(branches).toHaveLength(8);
    const counts = branches.map((b) => within(b).queryAllByRole('listitem').length);
    expect(counts).toEqual([0, 9, 4, 8, 0, 0, 0, 0]);
    expect(within(sheet).getAllByRole('link').map((l) => l.getAttribute('href'))).toEqual(['/services', '/products', '/templates', '/about', '/contact']);
    const current = within(sheet).getAllByRole('button').find((b) => b.getAttribute('aria-current') === 'location');
    expect(current).toHaveTextContent('underfire-ai');
  });
});
