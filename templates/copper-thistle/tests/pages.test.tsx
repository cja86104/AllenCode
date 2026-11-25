import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { restaurant } from '../src/content/restaurant';
import type { FormSender } from '../src/lib/forms';
import { demonstrationSender } from '../src/lib/forms';
import { PrivateEventForm } from '../src/sections/reservations/PrivateEventForm';
import { ReservationForm } from '../src/sections/reservations/ReservationForm';
import { Newsletter } from '../src/sections/contact/Newsletter';
import { clone, renderSite, renderWith } from './render';

const TODAY = new Date(2026, 10, 24); // Tuesday, November 24, 2026

const fakeSender = (kind: 'sent' | 'failed'): FormSender & { send: ReturnType<typeof vi.fn> } => ({
  mode: 'live',
  send: vi.fn(() =>
    Promise.resolve(
      kind === 'sent' ? { kind: 'sent' as const } : { kind: 'failed' as const, message: 'Something went wrong on our side.' },
    ),
  ),
});

describe('every page', () => {
  it.each([
    ['/', 'Rooted in the Land We Love'],
    ['/menu', 'The Menu'],
    ['/about', 'A Table Set by the Seasons'],
    ['/gallery', 'Gallery'],
    ['/reservations', 'Reservations'],
    ['/contact', 'Contact'],
    ['/nowhere', 'This page isn’t on the menu.'],
  ])('%s has one top-level heading', (path, heading) => {
    renderSite(path);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(heading);
  });

  it('has a skip link, a labelled main navigation, and only real links', () => {
    const { container } = renderSite('/');
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
    expect(within(screen.getByRole('navigation', { name: 'Main' })).getAllByRole('link')).toHaveLength(6);
    for (const link of container.querySelectorAll('a')) expect(link.getAttribute('href')).not.toBe('#');
  });

  it('says once, in the footer, that the demonstration is fictional', () => {
    renderSite('/');
    expect(screen.getAllByText(/Template preview\. The Copper Thistle, its chef/)).toHaveLength(1);
  });

  it('shows social links only when they are configured', () => {
    renderSite('/');
    expect(screen.queryByRole('link', { name: /Instagram/ })).toBeNull();
    const content = clone();
    content.contact.social.instagram = { label: 'Instagram', url: 'https://instagram.com/example' };
    renderSite('/', content);
    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', 'https://instagram.com/example');
  });
});

describe('the menu', () => {
  it('moves between sections with the arrow keys', async () => {
    const user = userEvent.setup();
    renderSite('/menu');
    const starters = screen.getByRole('tab', { name: 'Starters' });
    expect(starters).toHaveAttribute('aria-selected', 'true');
    starters.focus();
    await user.keyboard('{ArrowRight}');
    const mains = screen.getByRole('tab', { name: 'Mains' });
    expect(mains).toHaveFocus();
    expect(mains).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Wine & Spirits' })).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps every section in the page, so it reads in full without JavaScript and in print', () => {
    renderSite('/menu');
    expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(restaurant.menu.categories.length);
    expect(screen.getByText('Glass $18 · Bottle $68')).toBeInTheDocument();
  });

  it('names each dietary mark for screen readers', () => {
    renderSite('/menu');
    const item = screen.getByRole('heading', { name: /Charred Octopus/ });
    expect(item).toHaveTextContent('Seafood');
    expect(item).toHaveTextContent('Spicy');
  });
});

describe('carousels', () => {
  it('can be paused, and stop rotating once a quote is chosen', async () => {
    vi.useFakeTimers();
    renderSite('/');
    const carousel = screen.getByRole('group', { name: 'In the press' });
    expect(within(carousel).getByText(/Every course felt like it was harvested/)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(6100);
    });
    expect(within(carousel).getByText(/tells the story of a valley/)).toBeInTheDocument();
    fireEvent.click(within(carousel).getByRole('button', { name: 'Pause' }));
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(within(carousel).getByText(/tells the story of a valley/)).toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe('reservations', () => {
  async function fillName(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'ada@example.org');
  }

  it('offers the times the kitchen seats on the chosen day, and says when it is closed', async () => {
    const user = userEvent.setup();
    renderWith(<ReservationForm sender={demonstrationSender} today={TODAY} />);
    expect(screen.getByText('Choose a date to see available times.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-11-30' } });
    expect(screen.getByText('We’re closed on Mondays. Please choose another day.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-12-01' } });
    const times = within(screen.getByRole('group', { name: 'Time' })).getAllByRole('radio');
    expect(times.map((time) => time.getAttribute('value'))).toEqual([
      '5:30 PM',
      '6:00 PM',
      '6:30 PM',
      '7:00 PM',
      '7:30 PM',
      '8:00 PM',
      '8:30 PM',
    ]);
    await user.click(screen.getByRole('radio', { name: '7:00 PM' }));
    expect(screen.getByRole('radio', { name: '7:00 PM' })).toBeChecked();
  });

  it('limits the party size and announces it', async () => {
    const user = userEvent.setup();
    renderWith(<ReservationForm sender={demonstrationSender} today={TODAY} />);
    await user.click(screen.getByRole('button', { name: 'Fewer guests' }));
    expect(screen.getByRole('status')).toHaveTextContent('1 guest');
    expect(screen.getByRole('button', { name: 'Fewer guests' })).toBeDisabled();
  });

  it('marks each problem on its field and moves focus to the first', async () => {
    const user = userEvent.setup();
    const sender = fakeSender('sent');
    renderWith(<ReservationForm sender={sender} today={TODAY} />);
    await user.click(screen.getByRole('button', { name: 'Request reservation' }));
    expect(screen.getByRole('alert')).toHaveTextContent('3 things need a look before booking.');
    expect(screen.getByLabelText('Date')).toHaveFocus();
    expect(screen.getByLabelText('Date')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Name').getAttribute('aria-describedby')).toMatch(/-error/);
    expect(sender.send).not.toHaveBeenCalled();
  });

  it('never claims a booking when nothing was sent, and keeps the details', async () => {
    const user = userEvent.setup();
    renderWith(<ReservationForm sender={demonstrationSender} today={TODAY} />);
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-12-05' } });
    await user.click(screen.getByRole('radio', { name: '7:00 PM' }));
    await fillName(user);
    await user.click(screen.getByRole('button', { name: 'Request reservation' }));
    const result = await screen.findByRole('heading', { name: 'Nothing was sent.' });
    expect(result).toHaveFocus();
    // It replaces the form's own h2, so the page outline has no gap.
    expect(result.tagName).toBe('H2');
    expect(screen.queryByText(/You’re booked/i)).toBeNull();
    expect(screen.getByText(/A table for 2 on Saturday, December 5 at 7:00 PM/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to the form' }));
    expect(screen.getByLabelText('Name')).toHaveValue('Ada Lovelace');
  });

  it('confirms only what the restaurant received, and keeps everything when sending fails', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWith(<ReservationForm sender={fakeSender('sent')} today={TODAY} />);
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-12-05' } });
    await user.click(screen.getByRole('radio', { name: '7:00 PM' }));
    await fillName(user);
    await user.click(screen.getByRole('button', { name: 'Request reservation' }));
    expect(await screen.findByRole('heading', { name: 'Request received, Ada' })).toHaveFocus();
    unmount();

    renderWith(<ReservationForm sender={fakeSender('failed')} today={TODAY} />);
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-12-05' } });
    await user.click(screen.getByRole('radio', { name: '7:00 PM' }));
    await fillName(user);
    await user.click(screen.getByRole('button', { name: 'Request reservation' }));
    expect(await screen.findByText('Something went wrong on our side.')).toHaveFocus();
    expect(screen.getByLabelText('Name')).toHaveValue('Ada Lovelace');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeEnabled();
  });

  it('links to an outside booking service instead of the form when one is set', () => {
    const content = clone();
    content.reservations.external = { label: 'Book on our reservations page', url: 'https://booking.example/copper-thistle' };
    renderWith(<ReservationForm today={TODAY} />, content);
    expect(screen.getByRole('link', { name: 'Book on our reservations page' })).toHaveAttribute(
      'href',
      'https://booking.example/copper-thistle',
    );
    expect(screen.queryByLabelText('Date')).toBeNull();
  });
});

describe('private events and the newsletter', () => {
  it('checks the guest count against the room’s capacity', async () => {
    const user = userEvent.setup();
    renderWith(<PrivateEventForm sender={demonstrationSender} />);
    await user.type(screen.getByLabelText('Guests'), '40');
    await user.click(screen.getByRole('button', { name: 'Send inquiry' }));
    expect(screen.getByText('Please enter a number from 1 to 24.')).toBeInTheDocument();
  });

  it('is honest that a demonstration sign-up sent nothing', async () => {
    const user = userEvent.setup();
    renderWith(<Newsletter sender={demonstrationSender} />);
    await user.type(screen.getByLabelText('Email address'), 'ada@example.org');
    await user.click(screen.getByRole('button', { name: 'Subscribe' }));
    expect(await screen.findByRole('heading', { name: 'Nothing was sent.' })).toBeInTheDocument();
  });
});
