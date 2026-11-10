// @ts-check
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ContactForm, { PROJECT_TYPES } from '../src/components/ContactForm.jsx';
import Contact from '../src/pages/Contact.jsx';
import BriefChapter, { briefFile } from '../src/scenes/BriefChapter.jsx';
import DoorProvider from '../src/door/DoorProvider.jsx';
import { DOOR_STORAGE_KEY } from '../src/door/doorStorage.js';
import { templates } from '../src/data/templates.js';

/** The field names the serverless route reads from the request body, taken from the file itself. */
function apiFieldNames() {
  const source = readFileSync(join(process.cwd(), 'api/send-contact-email.js'), 'utf8');
  const match = source.match(/const\s*\{([^}]+)\}\s*=\s*req\.body/);
  if (!match) throw new Error('send-contact-email.js no longer destructures req.body');
  return match[1].split(',').map((name) => name.trim()).sort();
}

/**
 * @param {{ ok: boolean, body?: unknown }} reply
 */
function stubFetch({ ok, body = {} }) {
  const fetchMock = vi.fn(async () => ({ ok, json: async () => body }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** @param {{ name?: string, email?: string, message?: string }} values */
function fill({ name = 'Jane Founder', email = 'jane@example.com', message = 'A booking site for my bakery, please.' }) {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: name } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('What are you building?'), { target: { value: message } });
}

beforeEach(() => {
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
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

describe('ContactForm', () => {
  it('submits the same payload to /api/send-contact-email as before', async () => {
    const fetchMock = stubFetch({ ok: true });
    render(<ContactForm />);
    fill({});
    fireEvent.change(screen.getByLabelText('Project type'), { target: { value: 'MVP Sprint' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = /** @type {[string, RequestInit]} */ (/** @type {unknown} */ (fetchMock.mock.calls[0]));
    expect(url).toBe('/api/send-contact-email');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    const payload = JSON.parse(String(init.body));
    expect(Object.keys(payload).sort()).toEqual(apiFieldNames());
    expect(payload).toEqual({
      name: 'Jane Founder',
      email: 'jane@example.com',
      projectType: 'MVP Sprint',
      message: 'A booking site for my bakery, please.',
    });
  });

  it('shows the existing success state, and Send another starts a blank form', async () => {
    stubFetch({ ok: true });
    render(<ContactForm />);
    fill({});
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    });
    expect(screen.getByRole('heading', { name: 'Message sent.' })).toBeInTheDocument();
    expect(screen.getByText(/Thanks, Jane\./)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /send another/i }));
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Project type')).toHaveValue(PROJECT_TYPES[0]);
  });

  it('shows the existing error states: the server message with field errors, and an unreachable server', async () => {
    stubFetch({ ok: false, body: { error: 'Invalid submission.', fieldErrors: { email: 'Enter a valid email.' } } });
    render(<ContactForm />);
    fill({});
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    });
    expect(screen.getByText('Invalid submission.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email.')).toBeInTheDocument();

    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('offline'))));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    });
    expect(screen.getByText('Could not reach the server. Please email chris@allencodeco.com directly.')).toBeInTheDocument();
  });

  it('validates before sending, with the existing messages', async () => {
    const fetchMock = stubFetch({ ok: true });
    render(<ContactForm />);
    // An empty email passes the browser's own type=email check and reaches the form's validation.
    fill({ name: ' ', email: '', message: 'short' });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText('Enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email.')).toBeInTheDocument();
    expect(screen.getByText('Give me at least a sentence to work with.')).toBeInTheDocument();
  });

  it('a new prefill replaces an untouched message but never one the visitor wrote', () => {
    const { rerender } = render(<ContactForm prefill={{ message: 'first idea' }} />);
    const message = () => screen.getByLabelText('What are you building?');
    expect(message()).toHaveValue('first idea');
    rerender(<ContactForm prefill={{ message: 'second idea' }} />);
    expect(message()).toHaveValue('second idea');
    fireEvent.change(message(), { target: { value: 'my own words' } });
    rerender(<ContactForm prefill={{ message: 'third idea' }} />);
    expect(message()).toHaveValue('my own words');
  });
});

describe('the brief starts from the address', () => {
  it('prefills from template and idea query parameters on the Contact page', () => {
    render(
      <MemoryRouter initialEntries={['/contact?template=hearth&idea=a%20family%20site%20for%20the%20Allens']}>
        <Contact />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('What are you building?')).toHaveValue(
      `a family site for the Allens\n\nI'd like to talk about the ${templates.find((t) => t.id === 'hearth')?.name} template.`,
    );
    expect(screen.getByLabelText('Project type')).toHaveValue('Website from a template');
  });

  it('an idea alone keeps the default project type, and an unknown template adds nothing', () => {
    render(
      <MemoryRouter initialEntries={['/contact?template=nope&idea=%20%20a%20shop%20']}>
        <Contact />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('What are you building?')).toHaveValue('a shop');
    expect(screen.getByLabelText('Project type')).toHaveValue(PROJECT_TYPES[0]);
  });
});

describe('BriefChapter', () => {
  /** @param {string} entry */
  const renderBrief = (entry) =>
    render(
      <MemoryRouter initialEntries={[entry]}>
        <DoorProvider>
          <BriefChapter />
        </DoorProvider>
      </MemoryRouter>,
    );

  it('door a: Start your project, with the idea as the first line of the brief', () => {
    window.sessionStorage.setItem(DOOR_STORAGE_KEY, 'a');
    renderBrief('/?idea=a%20dashboard%20for%20my%20crew');
    expect(screen.getByRole('link', { name: 'Start your project' })).toHaveAttribute('href', '/contact');
    expect(screen.getByLabelText('What are you building?')).toHaveValue('a dashboard for my crew');
    expect(document.getElementById('brief')).not.toBeNull();
  });

  it('door b: Browse templates', async () => {
    window.sessionStorage.setItem(DOOR_STORAGE_KEY, 'b');
    renderBrief('/');
    await waitFor(() => expect(screen.getByRole('link', { name: 'Browse templates' })).toHaveAttribute('href', '/templates'));
    expect(screen.queryByRole('link', { name: 'Start your project' })).toBeNull();
  });
});

describe('the brief file', () => {
  it('is empty until something is written, and leaves out empty fields', () => {
    expect(briefFile(null)).toBe('');
    expect(briefFile({ name: ' ', email: '', projectType: 'MVP Sprint', message: '' })).toBe('');
    expect(briefFile({ name: 'Jane', email: '', projectType: 'MVP Sprint', message: '' })).toBe(
      '# Project brief\nfrom: Jane\ntype: MVP Sprint',
    );
    expect(briefFile({ name: 'Jane', email: 'jane@example.com', projectType: 'MVP Sprint', message: 'A shop.' })).toBe(
      '# Project brief\nfrom: Jane <jane@example.com>\ntype: MVP Sprint\n\nA shop.',
    );
  });

  it('writes itself beside the form as the visitor types, starting from the idea', () => {
    window.sessionStorage.setItem(DOOR_STORAGE_KEY, 'a');
    render(
      <MemoryRouter initialEntries={['/?idea=a%20shop%20for%20candles']}>
        <DoorProvider>
          <BriefChapter />
        </DoorProvider>
      </MemoryRouter>,
    );
    const file = /** @type {HTMLElement} */ (document.querySelector('[data-brief-file]'));
    expect(file).toHaveTextContent('a shop for candles');
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '<b>Jane</b>' } });
    expect(file).toHaveTextContent('from: <b>Jane</b>');
    expect(file.querySelector('b')).toBeNull();
  });
});
