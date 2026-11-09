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
    fireEvent.click(primary.getByRole('button', { name: 'Family' }));
    expect(primary.getByRole('link', { name: 'Browse templates' })).toHaveAttribute('href', '/templates');
    expect(window.sessionStorage.getItem(DOOR_STORAGE_KEY)).toBe('b');
  });

  it('the door switcher shows the remembered door and changes it', () => {
    window.sessionStorage.setItem(DOOR_STORAGE_KEY, 'b');
    renderNav();
    const switcher = within(screen.getByRole('group', { name: 'Show the site for' }));
    expect(switcher.getByRole('button', { name: 'Family' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(switcher.getByRole('button', { name: 'Business' }));
    expect(switcher.getByRole('button', { name: 'Business' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('link', { name: 'Start a Project' })).toBeInTheDocument();
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
