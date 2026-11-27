// @ts-check
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Nav, { primaryAction } from '../src/components/Nav.jsx';
import DoorProvider from '../src/door/DoorProvider.jsx';
import { DOOR_STORAGE_KEY } from '../src/door/doorStorage.js';
import App from '../src/App.jsx';

afterEach(() => {
  window.sessionStorage.clear();
  vi.unstubAllGlobals();
});

const renderNav = () =>
  render(
    <MemoryRouter>
      <DoorProvider>
        <Nav />
      </DoorProvider>
    </MemoryRouter>,
  );

describe('Nav', () => {
  it('primary action is Start a project for door a and Browse templates for door b', () => {
    expect(primaryAction('a')).toEqual({ to: '/contact', label: 'Start a Project' });
    expect(primaryAction(null)).toEqual({ to: '/contact', label: 'Start a Project' });
    expect(primaryAction('b')).toEqual({ to: '/templates', label: 'Browse templates' });

    renderNav();
    const primary = within(screen.getByRole('navigation', { name: 'Primary' }));
    expect(primary.getByRole('link', { name: 'Start a Project' })).toHaveAttribute('href', '/contact');
    fireEvent.click(primary.getByRole('button', { name: 'Templates/Custom' }));
    expect(primary.getByRole('link', { name: 'Browse templates' })).toHaveAttribute('href', '/templates');
    expect(window.sessionStorage.getItem(DOOR_STORAGE_KEY)).toBe('b');
  });

  it('the door switcher shows the remembered door and changes it', () => {
    window.sessionStorage.setItem(DOOR_STORAGE_KEY, 'b');
    renderNav();
    const switcher = within(screen.getByRole('group', { name: 'Show the site for' }));
    expect(switcher.getByRole('button', { name: 'Templates/Custom' })).toHaveAttribute('aria-pressed', 'true');
    expect(switcher.queryByRole('button', { name: 'Family' })).toBeNull();
    fireEvent.click(switcher.getByRole('button', { name: 'Business' }));
    expect(switcher.getByRole('button', { name: 'Business' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('link', { name: 'Start a Project' })).toBeInTheDocument();
  });

  it('below the full bar, the primary action sits beside the menu button and follows the door (2026-11-26)', () => {
    renderNav();
    const compact = /** @type {HTMLElement} */ (document.querySelector('[data-primary-action-compact]'));
    expect(compact).not.toBeNull();
    // Outside the full bar, which only shows from 1280px.
    expect(screen.getByRole('navigation', { name: 'Primary' }).contains(compact)).toBe(false);
    expect(compact).toHaveTextContent('Start a Project');
    expect(compact).toHaveAttribute('href', '/contact');
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('button', { name: 'Templates/Custom' }));
    expect(compact).toHaveTextContent('Browse templates');
    expect(compact).toHaveAttribute('href', '/templates');
  });
});

describe('App shell', () => {
  it('skip link is the first focusable element and points at the main content', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      },
    );
    window.history.pushState({}, '', '/about');
    const { container } = render(<App />);
    const focusable = container.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    expect(focusable[0]).toHaveTextContent('Skip to content');
    expect(focusable[0]).toHaveAttribute('href', '#main');
    expect(container.querySelector('main#main')).not.toBeNull();
    window.history.pushState({}, '', '/');
  });
});
