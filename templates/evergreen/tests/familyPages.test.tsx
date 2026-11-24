import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { memorial } from '../src/content/memorial';
import type { Memorial } from '../src/content/types';
import { FamilyPreviewPage } from '../src/pages/FamilyPreviewPage';
import { renderMemorial } from './render';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ROUTER_FUTURE } from '../src/App';
import { MemorialProvider } from '../src/app/MemorialContext';

const clone = (): Memorial => structuredClone(memorial);

function renderPreview(content: Memorial = memorial) {
  return render(
    <MemoryRouter future={ROUTER_FUTURE}>
      <MemorialProvider memorial={content} renderedAt={Date.parse('2026-11-24T17:00:00Z')}>
        <FamilyPreviewPage />
      </MemorialProvider>
    </MemoryRouter>,
  );
}

describe('links to the new pages', () => {
  it('offers share, copy link, privacy and family access in the footer, and a quiet share link in the header', () => {
    renderMemorial(memorial);
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: 'Share a memory' })).toHaveAttribute('href', '/share');
    expect(within(footer).getByRole('button', { name: 'Copy memorial link' })).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    expect(within(footer).getByRole('link', { name: 'Family access' })).toHaveAttribute('href', '/family');
    expect(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Share a memory' })).toHaveAttribute(
      'href',
      '/share',
    );
  });
});

describe('the privacy page', () => {
  it('describes an unlisted memorial honestly', () => {
    renderMemorial(memorial, { path: '/privacy' });
    expect(screen.getByText(/It is not private: anyone who has the link can read everything here\./)).toBeInTheDocument();
    expect(screen.getByText(/no analytics, no advertising and no tracking cookies/)).toBeInTheDocument();
    expect(screen.getByText(/Your email address is never shown on the memorial/)).toBeInTheDocument();
  });

  it('describes the public mode and a published contact address', () => {
    const content = clone();
    content.privacy.mode = 'public';
    content.contact.publicEmail = 'family@example.org';
    renderMemorial(content, { path: '/privacy' });
    expect(screen.getByText(/search engines may list it/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'family@example.org' })).toHaveAttribute('href', 'mailto:family@example.org');
  });
});

describe('family access', () => {
  it('shows no login form, and offers the demonstration only on the demonstration memorial', () => {
    renderMemorial(memorial, { path: '/family' });
    expect(screen.queryByLabelText(/password/i)).toBeNull();
    expect(screen.getByRole('link', { name: 'See a demonstration of the family area' })).toHaveAttribute('href', '/family/preview');
  });

  it('tells a real family that sign-in is not set up', () => {
    const content = clone();
    content.site.demonstration = false;
    renderMemorial(content, { path: '/family' });
    expect(screen.getByText(/Family sign-in hasn’t been set up for this memorial yet\./)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /demonstration/ })).toBeNull();
  });
});

describe('the family-area demonstration', () => {
  it('says it is a demonstration that saves nothing and is not protected', () => {
    renderPreview();
    expect(screen.getByText('Demonstration of the family area')).toBeInTheDocument();
    expect(screen.getByText(/nothing is saved or sent, and this page is not protected/)).toBeInTheDocument();
  });

  it('is not available on a real memorial', () => {
    const content = clone();
    content.site.demonstration = false;
    renderPreview(content);
    expect(screen.getByRole('heading', { level: 1, name: 'This page isn’t here.' })).toBeInTheDocument();
  });

  it('previews each state of the gathering', async () => {
    const user = userEvent.setup();
    renderPreview();
    const preview = screen.getByRole('group', { name: 'Preview of the gathering section' });
    expect(within(preview).getByText('Took place')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Upcoming' }));
    expect(within(preview).getByRole('link', { name: 'Add to calendar' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Details shared privately' }));
    expect(within(preview).queryByText(/October 3/)).toBeNull();
  });

  it('reviews memories without ranking them, and can undo', async () => {
    const user = userEvent.setup();
    renderPreview();
    const group = screen.getByRole('group', { name: 'Decide on the memory from Lena' });
    expect(within(group).queryByRole('button', { name: 'Approve' })).toBeNull();
    await user.click(within(group).getByRole('button', { name: 'Keep private' }));
    expect(screen.getByText(/Kept private: the family can read it, visitors cannot/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('group', { name: 'Decide on the memory from Lena' })).toBeInTheDocument();
  });

  it('reorders the featured photographs', async () => {
    const user = userEvent.setup();
    renderPreview();
    const second = memorial.photos.featured?.[1] ?? '';
    const caption = memorial.photos.items.find((photo) => photo.id === second)?.caption ?? '';
    await user.click(screen.getByRole('button', { name: `Move “${caption}” earlier` }));
    const items = screen.getAllByRole('listitem').filter((item) => item.classList.contains('order-list__item'));
    expect(items[0]).toHaveTextContent(caption);
  });
});
