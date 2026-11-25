import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { brewery } from '../src/content/brewery';
import type { FormSender } from '../src/lib/forms';
import { ContactForm } from '../src/sections/contact/ContactForm';
import { clone, renderSite, renderWith } from './render';

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
    ['/', 'FoundingFathomsBrewing'],
    ['/beer', 'Beer'],
    ['/taproom', 'Taproom'],
    ['/story', 'Our Story'],
    ['/find-us', 'Find Us'],
    ['/contact', 'Contact'],
    ['/nowhere', 'Nothing on this tap.'],
  ])('%s has one top-level heading', (path, heading) => {
    renderSite(path);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(heading);
  });

  it('has a skip link, a labelled main navigation, and only real links', () => {
    const { container } = renderSite('/');
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
    const main = screen.getByRole('navigation', { name: 'Main' });
    expect(
      within(main)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Home', 'Beer', 'Taproom', 'Our Story', 'Find Us', 'Shop', 'Contact', 'Join the Can Club']);
    for (const link of container.querySelectorAll('a')) expect(link.getAttribute('href')).not.toBe('#');
  });

  it('opens and closes the small-screen menu, and Escape closes it', async () => {
    const user = userEvent.setup();
    renderSite('/');
    const toggle = screen.getByRole('button', { name: 'Menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('says once, in the footer, that the demonstration is fictional, and not once it is real', () => {
    renderSite('/');
    expect(screen.getAllByText(/Template preview\. Founding Fathoms Brewing, its people, beers/)).toHaveLength(1);
    const content = clone();
    content.site.demonstration = false;
    renderSite('/', content);
    expect(screen.getAllByText(/Template preview\./)).toHaveLength(1);
  });

  it('shows the hours with the closed days explained', () => {
    renderSite('/');
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByText('Mon – Tue')).toBeInTheDocument();
    expect(within(footer).getByText('(brew days)')).toBeInTheDocument();
    expect(within(footer).getByText('12 – 8pm')).toBeInTheDocument();
  });
});

describe('the home page', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('puts every beer on tap on the live board, and only those', () => {
    renderSite('/');
    const board = screen.getByRole('region', { name: 'Beers on draft' });
    expect(board).toHaveAttribute('tabindex', '0');
    const names = within(board)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
    expect(names).toEqual(brewery.beer.beers.filter((beer) => beer.onTap).map((beer) => beer.name));
    expect(screen.getByText(/^8 on draft\./)).toBeInTheDocument();
    expect(names).not.toContain('Channel Marker DIPA');
  });

  it('reads the strength of each beer out in full', () => {
    renderSite('/');
    const board = screen.getByRole('region', { name: 'Beers on draft' });
    expect(within(board).getByText(/^6\.8%/)).toHaveTextContent('6.8% ABV');
  });

  it('rotates the regulars’ quotes slowly and lets a visitor pause them', () => {
    vi.useFakeTimers();
    renderSite('/');
    const carousel = screen.getByRole('group', { name: 'From the regulars' });
    expect(within(carousel).getByText(/I work the morning boats/)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(6500);
    });
    expect(within(carousel).getByText(/The Can Club isn’t a gimmick/)).toBeInTheDocument();
    act(() => {
      within(carousel).getByRole('button', { name: 'Pause' }).click();
    });
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(within(carousel).getByText(/The Can Club isn’t a gimmick/)).toBeInTheDocument();
    act(() => {
      within(carousel).getByRole('button', { name: 'Show the quote from Diego M.' }).click();
    });
    expect(within(carousel).getByText(/smells like grain and wet steel/)).toBeInTheDocument();
  });

  it('points the Can Club buttons at the sign-up', () => {
    renderSite('/');
    for (const name of ['Join the Can Club', 'Claim a membership'])
      for (const link of screen.getAllByRole('link', { name })) expect(link).toHaveAttribute('href', '/contact#can-club');
  });
});

describe('the beer page', () => {
  it('lists every beer under its style, in the set order, marking the ones on tap', () => {
    renderSite('/beer');
    const groups = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
    expect(groups.slice(0, 5)).toEqual(['IPA', 'Lager', 'Stout', 'Sour', 'Seasonal']);
    const ipa = screen.getByRole('region', { name: 'IPA' });
    expect(within(ipa).getAllByRole('heading', { level: 3 })).toHaveLength(4);
    expect(within(ipa).getByRole('heading', { name: 'Harbor Lights IPA On tap' })).toBeInTheDocument();
    expect(within(ipa).getByRole('heading', { name: 'Channel Marker DIPA' })).toBeInTheDocument();
  });

  it('shows the four-packs with their status and price, and works out the average strength', () => {
    renderSite('/beer');
    const toGo = screen.getByRole('region', { name: 'Four-packs to go' });
    expect(within(toGo).getAllByRole('listitem')).toHaveLength(7);
    expect(within(toGo).getAllByText('Limited · Can Club first')).toHaveLength(2);
    expect(within(toGo).getByText('$24')).toBeInTheDocument();
    expect(within(toGo).getByRole('link', { name: 'Order for pickup' })).toHaveAttribute('href', '/shop');
    const freshness = screen.getByRole('region', { name: 'Freshness is a logistics problem' });
    expect(within(freshness).getByText(/^6\.1%/)).toHaveTextContent('6.1% ABV');
    expect(within(freshness).getByText('across the 8 beers on tap')).toBeInTheDocument();
  });
});

describe('the taproom page', () => {
  it('shows the hours, the trucks Monday first, and the weekly events', () => {
    renderSite('/taproom');
    const hours = screen.getByRole('region', { name: 'Hours' });
    expect(within(hours).getByText('Closed (brew days)')).toBeInTheDocument();
    const trucks = screen.getByRole('region', { name: 'Food truck schedule' });
    expect(
      within(trucks)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(['Smoke Stack BBQ', 'Salt & Hull', 'Pier Pie Co.', 'Rotating guest', 'Sweet Ballast']);
    expect(within(trucks).getByText('Wednesday')).toBeInTheDocument();
    const events = screen.getByRole('region', { name: 'Events' });
    expect(within(events).getByText('Every Thursday · 7 PM')).toBeInTheDocument();
    expect(within(events).getAllByRole('listitem')).toHaveLength(4);
  });
});

describe('the find us page', () => {
  it('lists every shop, counts them by region, and links distributors to the trade address', () => {
    renderSite('/find-us');
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(10);
    const counts = screen.getByRole('region', { name: 'Shops by region' });
    expect(within(counts).getByText('Inland & Metro').nextElementSibling).toHaveTextContent('3');
    expect(screen.getByRole('link', { name: 'trade@foundingfathoms.example' })).toHaveAttribute(
      'href',
      'mailto:trade@foundingfathoms.example',
    );
  });

  it('narrows the list as a visitor searches and says how many match', async () => {
    const user = userEvent.setup();
    renderSite('/find-us');
    await user.type(screen.getByLabelText('Search shops'), 'midland');
    expect(screen.getByRole('status')).toHaveTextContent('2 shops match “midland”.');
    expect(screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
      'Ironworks Bottle Bar',
      'Cedar & Hop',
    ]);
    await user.clear(screen.getByLabelText('Search shops'));
    await user.type(screen.getByLabelText('Search shops'), 'atlantis');
    expect(screen.getByText(/No shops match that search/)).toBeInTheDocument();
  });
});

describe('the contact form', () => {
  it('names each problem and moves focus to the first', async () => {
    const user = userEvent.setup();
    renderWith(<ContactForm />);
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.getByLabelText('Name')).toHaveFocus();
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('Error: Please enter your name.');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Tell us a little more: at least 10 characters.')).toBeInTheDocument();
  });

  it('says plainly that nothing was sent when no endpoint is set, and keeps what was typed', async () => {
    const user = userEvent.setup();
    renderWith(<ContactForm />);
    expect(screen.getByText('Template preview: nothing is sent.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Name'), 'Sam Rivera');
    await user.type(screen.getByLabelText('Email'), 'sam@example.com');
    await user.type(screen.getByLabelText('Message'), 'Do you host rehearsal dinners on the mezzanine?');
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByRole('heading', { name: 'Nothing was sent.' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Back to the form' }));
    expect(screen.getByLabelText('Name')).toHaveValue('Sam Rivera');
  });

  it('posts the message with the topic’s name, and confirms it', async () => {
    const user = userEvent.setup();
    const sender = fakeSender('sent');
    renderWith(<ContactForm sender={sender} />);
    await user.type(screen.getByLabelText('Name'), 'Sam Rivera');
    await user.type(screen.getByLabelText('Email'), ' sam@example.com ');
    await user.selectOptions(screen.getByLabelText('Topic'), 'private');
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Mezzanine for forty on a Saturday?' } });
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(sender.send).toHaveBeenCalledWith({
      name: 'Sam Rivera',
      email: 'sam@example.com',
      topic: 'Private hire',
      message: 'Mezzanine for forty on a Saturday?',
    });
    expect(await screen.findByRole('heading', { name: /Message received/ })).toHaveFocus();
  });

  it('keeps the message and explains when sending fails', async () => {
    const user = userEvent.setup();
    renderWith(<ContactForm sender={fakeSender('failed')} />);
    await user.type(screen.getByLabelText('Name'), 'Sam Rivera');
    await user.type(screen.getByLabelText('Email'), 'sam@example.com');
    await user.type(screen.getByLabelText('Message'), 'A question about tours.');
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong on our side.');
    expect(screen.getByLabelText('Message')).toHaveValue('A question about tours.');
    expect(screen.queryByText('Template preview: nothing is sent.')).toBeNull();
  });
});
