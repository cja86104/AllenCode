import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ROUTER_FUTURE } from '../src/App';
import { MemorialProvider } from '../src/app/MemorialContext';
import { memorial } from '../src/content/memorial';
import type { Memorial } from '../src/content/types';
import { SharePage } from '../src/pages/SharePage';
import {
  configuredAdapter,
  createHttpAdapter,
  demonstrationAdapter,
  draftStore,
  LIMITS,
  validateSubmission,
  type SubmissionAdapter,
  type SubmitResult,
} from '../src/lib/submission';

const clone = (): Memorial => structuredClone(memorial);

function renderShare(adapter: SubmissionAdapter, content: Memorial = memorial) {
  return render(
    <MemoryRouter initialEntries={['/share']} future={ROUTER_FUTURE}>
      <MemorialProvider memorial={content}>
        <SharePage adapter={adapter} />
      </MemorialProvider>
    </MemoryRouter>,
  );
}

const fakeAdapter = (result: SubmitResult): SubmissionAdapter & { submit: ReturnType<typeof vi.fn> } => ({
  mode: 'remote',
  reportsProgress: true,
  submit: vi.fn(() => Promise.resolve(result)),
});

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Your name'), 'Priya');
  await user.type(screen.getByLabelText('Your memory'), 'She saved me a seat at the end of the table every Sunday.');
}

beforeEach(() => window.localStorage.clear());
afterEach(() => window.localStorage.clear());

describe('validation', () => {
  const base = { name: 'A', relationship: '', memory: 'A memory.', email: '', displayPermission: true };

  it('needs a name and a memory, and nothing else', () => {
    expect(validateSubmission({ ...base, name: ' ', memory: '' })).toEqual({
      name: 'Please add your name, as you would like the family to see it.',
      memory: 'Please write your memory before sending it.',
    });
    expect(validateSubmission(base)).toEqual({});
  });

  it('explains the character limit with the actual length', () => {
    expect(validateSubmission({ ...base, memory: 'x'.repeat(LIMITS.memory + 5) }).memory).toBe(
      'Your memory is 4,005 characters. Please shorten it to 4,000.',
    );
  });

  it('checks an email only when one is given', () => {
    expect(validateSubmission({ ...base, email: 'priya@' }).email).toMatch(/doesn’t look complete/);
    expect(validateSubmission({ ...base, email: 'priya@example.org' }).email).toBeUndefined();
  });

  it('checks the photograph’s type and size', () => {
    const big = new File(['x'], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(big, 'size', { value: 11 * 1024 * 1024 });
    expect(validateSubmission({ ...base, photo: big }).photo).toBe('This photograph is 11.0 MB. Please choose one under 10 MB.');
    expect(validateSubmission({ ...base, photo: new File(['x'], 'a.gif', { type: 'image/gif' }) }).photo).toBe(
      'Please choose a JPEG, PNG or WebP photograph.',
    );
  });
});

describe('sending', () => {
  it('uses the demonstration unless an endpoint is configured', () => {
    expect(configuredAdapter(undefined)).toBe(demonstrationAdapter);
    expect(configuredAdapter('  ')).toBe(demonstrationAdapter);
    expect(configuredAdapter('https://example.org/memories').mode).toBe('remote');
  });

  it('posts to the endpoint, reports progress, and turns failures into recoverable messages', async () => {
    const sent: { url?: string; body?: FormData } = {};
    let respond: (status: number) => void = () => undefined;
    class FakeRequest {
      status = 0;
      upload = new EventTarget();
      private events = new EventTarget();
      open(_: string, url: string) {
        sent.url = url;
      }
      addEventListener(type: string, listener: EventListener) {
        this.events.addEventListener(type, listener);
      }
      send(body: FormData) {
        sent.body = body;
        respond = (status) => {
          const progress = Object.assign(new Event('progress'), { lengthComputable: true, loaded: 5, total: 10 });
          this.upload.dispatchEvent(progress);
          this.status = status;
          this.events.dispatchEvent(new Event('load'));
        };
      }
    }
    vi.stubGlobal('XMLHttpRequest', FakeRequest);
    const adapter = createHttpAdapter('https://example.org/memories');
    const progress = vi.fn();
    const submission = { name: ' Priya ', relationship: '', memory: 'Hello', email: '', displayPermission: false };

    const first = adapter.submit(submission, progress);
    respond(201);
    expect(await first).toEqual({ kind: 'received' });
    expect(sent.url).toBe('https://example.org/memories');
    expect(sent.body?.get('name')).toBe('Priya');
    expect(sent.body?.get('displayPermission')).toBe('no');
    expect(progress).toHaveBeenCalledWith(0.5);

    const second = adapter.submit(submission, progress);
    respond(413);
    expect(await second).toMatchObject({ kind: 'failed', reason: 'photo-too-large' });

    const third = adapter.submit(submission, progress);
    respond(500);
    expect(await third).toMatchObject({ kind: 'failed', reason: 'server' });
    vi.unstubAllGlobals();
  });
});

describe('the share page', () => {
  it('explains review, the email, and the limits before anything is sent', () => {
    renderShare(demonstrationAdapter);
    expect(screen.getByText(/The family reads every memory before it appears/)).toBeInTheDocument();
    expect(screen.getByText(/Your email will not appear on the memorial\./)).toBeInTheDocument();
    expect(screen.getByText(/up to 4,000 characters/)).toBeInTheDocument();
    expect(screen.getByText(/JPEG, PNG or WebP, up to 10 MB/)).toBeInTheDocument();
    expect(screen.getByText('Was there something she always said?')).toBeInTheDocument();
    expect(screen.getByLabelText('How you knew her (optional)')).not.toBeRequired();
  });

  it('says plainly when the form is a demonstration', () => {
    renderShare(demonstrationAdapter);
    expect(screen.getByText('This form is a template preview.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try the form (nothing is sent)' })).toBeInTheDocument();
  });

  it('lists every problem in a summary that takes focus, and marks each field', async () => {
    const user = userEvent.setup();
    const adapter = fakeAdapter({ kind: 'received' });
    renderShare(adapter);
    await user.type(screen.getByLabelText('Your email (optional)'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Send to the family' }));
    const summary = await screen.findByRole('alert');
    await waitFor(() => expect(summary).toHaveFocus());
    expect(within(summary).getByRole('heading')).toHaveTextContent('3 things need a look before sending');
    expect(screen.getByLabelText('Your name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Your name').getAttribute('aria-describedby')).toMatch(/-error/);
    expect(adapter.submit).not.toHaveBeenCalled();
  });

  it('shows the confirmation after the family’s endpoint receives the memory, and forgets the draft', async () => {
    const user = userEvent.setup();
    renderShare(fakeAdapter({ kind: 'received' }));
    await fillRequired(user);
    expect(draftStore.load()?.name).toBe('Priya');
    await user.click(screen.getByRole('button', { name: 'Send to the family' }));
    expect(
      await screen.findByText('Thank you for sharing this memory. The family will review it before it appears here.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
    expect(draftStore.load()).toBeUndefined();
  });

  it('never claims a demonstration was received, and keeps the writing', async () => {
    const user = userEvent.setup();
    renderShare(demonstrationAdapter);
    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: 'Try the form (nothing is sent)' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Nothing was sent.' })).toHaveFocus();
    expect(screen.getByText('She saved me a seat at the end of the table every Sunday.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to the form' }));
    expect(screen.getByLabelText('Your memory')).toHaveValue('She saved me a seat at the end of the table every Sunday.');
    expect(draftStore.load()?.memory).toBe('She saved me a seat at the end of the table every Sunday.');
  });

  it('keeps everything on the page when sending fails, and offers to try again', async () => {
    const user = userEvent.setup();
    renderShare(fakeAdapter({ kind: 'failed', reason: 'offline', message: 'The memory couldn’t be sent. You may be offline.' }));
    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: 'Send to the family' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Your memory wasn’t sent');
    await waitFor(() => expect(alert).toHaveFocus());
    expect(screen.getByLabelText('Your memory')).toHaveValue('She saved me a seat at the end of the table every Sunday.');
    expect(screen.getByRole('button', { name: 'Try sending again' })).toBeEnabled();
  });

  it('shows a chosen photograph and lets it be removed; rejects one that is too large', async () => {
    const user = userEvent.setup();
    renderShare(fakeAdapter({ kind: 'received' }));
    const input = screen.getByLabelText('A photograph (optional)');
    await user.upload(input, new File(['abc'], 'porch.jpg', { type: 'image/jpeg' }));
    expect(screen.getByText(/porch\.jpg/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove photograph' }));
    expect(screen.queryByText(/porch\.jpg/)).toBeNull();

    const big = new File(['x'], 'huge.png', { type: 'image/png' });
    Object.defineProperty(big, 'size', { value: 12 * 1024 * 1024 });
    await user.upload(input, big);
    expect(screen.getByText('This photograph is 12.0 MB. Please choose one under 10 MB.')).toBeInTheDocument();
  });

  it('brings back a memory started earlier in this browser', () => {
    draftStore.save({ name: 'June', relationship: 'sister', memory: 'Half-written', email: '', displayPermission: true });
    renderShare(demonstrationAdapter);
    expect(screen.getByText('We kept the memory you started earlier in this browser.')).toBeInTheDocument();
    expect(screen.getByLabelText('Your memory')).toHaveValue('Half-written');
  });

  it('follows the family’s settings for memories and photographs', () => {
    const noPhotos = clone();
    noPhotos.privacy.acceptPhotos = false;
    const { unmount } = renderShare(demonstrationAdapter, noPhotos);
    expect(screen.queryByLabelText('A photograph (optional)')).toBeNull();
    unmount();

    const closed = clone();
    closed.privacy.acceptMemories = false;
    renderShare(demonstrationAdapter, closed);
    expect(screen.getByText('The family isn’t adding new memories to this page at the moment.')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});
