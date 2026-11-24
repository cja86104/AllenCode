/**
 * Sharing a memory: the limits, the validation, and how a submission leaves the page.
 *
 * The template ships with two ways to send a memory:
 * - `demonstrationAdapter`: used when no endpoint is configured. It sends nothing anywhere and says so.
 * - `createHttpAdapter(endpoint)`: posts the memory to a family-controlled endpoint as multipart form
 *   data, reporting upload progress. The endpoint must store it as unpublished until the family approves
 *   it (README, "Receiving memories").
 */

export const LIMITS = {
  name: 80,
  relationship: 80,
  memory: 4000,
  memoryMinimum: 2,
  email: 254,
  photoBytes: 10 * 1024 * 1024,
} as const;

export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export interface MemoryDraft {
  name: string;
  relationship: string;
  memory: string;
  email: string;
  displayPermission: boolean;
}

export interface MemorySubmission extends MemoryDraft {
  photo?: File;
}

export type FieldName = 'name' | 'relationship' | 'memory' | 'email' | 'photo';

export type FieldErrors = Partial<Record<FieldName, string>>;

export const EMPTY_DRAFT: MemoryDraft = { name: '', relationship: '', memory: '', email: '', displayPermission: true };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateField(field: FieldName, submission: MemorySubmission): string | undefined {
  switch (field) {
    case 'name': {
      const value = submission.name.trim();
      if (value === '') return 'Please add your name, as you would like the family to see it.';
      if (value.length > LIMITS.name) return `Please keep your name to ${LIMITS.name} characters.`;
      return undefined;
    }
    case 'relationship':
      return submission.relationship.trim().length > LIMITS.relationship
        ? `Please keep this to ${LIMITS.relationship} characters.`
        : undefined;
    case 'memory': {
      const value = submission.memory.trim();
      if (value.length < LIMITS.memoryMinimum) return 'Please write your memory before sending it.';
      if (value.length > LIMITS.memory) {
        return `Your memory is ${value.length.toLocaleString('en-US')} characters. Please shorten it to ${LIMITS.memory.toLocaleString('en-US')}.`;
      }
      return undefined;
    }
    case 'email': {
      const value = submission.email.trim();
      if (value === '') return undefined;
      if (value.length > LIMITS.email || !EMAIL_PATTERN.test(value))
        return 'This email address doesn’t look complete. You can also leave it empty.';
      return undefined;
    }
    case 'photo': {
      const photo = submission.photo;
      if (!photo) return undefined;
      if (!(PHOTO_TYPES as readonly string[]).includes(photo.type)) return 'Please choose a JPEG, PNG or WebP photograph.';
      if (photo.size > LIMITS.photoBytes) return `This photograph is ${formatBytes(photo.size)}. Please choose one under 10 MB.`;
      return undefined;
    }
  }
}

export const FIELD_ORDER: FieldName[] = ['name', 'relationship', 'memory', 'photo', 'email'];

export function validateSubmission(submission: MemorySubmission): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of FIELD_ORDER) {
    const message = validateField(field, submission);
    if (message) errors[field] = message;
  }
  return errors;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** What happened when a memory was sent. Every failure keeps the visitor's writing on the page. */
export type SubmitResult =
  | { kind: 'received' }
  | { kind: 'demonstration' }
  | { kind: 'failed'; reason: 'offline' | 'photo-too-large' | 'photo-type' | 'rejected' | 'server'; message: string };

export interface SubmissionAdapter {
  /** `local` sends nothing; `remote` sends to the family's endpoint. */
  mode: 'local' | 'remote';
  /** Whether the adapter can report upload progress. */
  reportsProgress: boolean;
  submit(submission: MemorySubmission, onProgress: (fraction: number) => void): Promise<SubmitResult>;
}

/** Sends nothing. Used whenever no endpoint is configured, and says so to the visitor. */
export const demonstrationAdapter: SubmissionAdapter = {
  mode: 'local',
  reportsProgress: false,
  submit: () => Promise.resolve({ kind: 'demonstration' }),
};

function failureFor(status: number): SubmitResult {
  if (status === 413) {
    return {
      kind: 'failed',
      reason: 'photo-too-large',
      message: 'The photograph was too large to send. Your memory is still here; try a smaller photograph or remove it.',
    };
  }
  if (status === 415) {
    return {
      kind: 'failed',
      reason: 'photo-type',
      message: 'The photograph’s file type wasn’t accepted. Your memory is still here; try a JPEG, or remove the photograph.',
    };
  }
  if (status >= 400 && status < 500) {
    return {
      kind: 'failed',
      reason: 'rejected',
      message: 'The memorial couldn’t accept this memory as it is. Your writing is still here. Please check it and try again.',
    };
  }
  return {
    kind: 'failed',
    reason: 'server',
    message: 'Something went wrong on the memorial’s side. Your memory is still here; please try again in a few minutes.',
  };
}

/**
 * Posts a memory to `endpoint` as multipart form data with fields `name`, `relationship`, `memory`,
 * `email`, `displayPermission` (`yes`/`no`) and an optional `photo`. Any 2xx response means received.
 * Uses XMLHttpRequest because it reports upload progress, which `fetch` does not.
 */
export function createHttpAdapter(endpoint: string): SubmissionAdapter {
  return {
    mode: 'remote',
    reportsProgress: true,
    submit(submission, onProgress) {
      const body = new FormData();
      body.set('name', submission.name.trim());
      body.set('relationship', submission.relationship.trim());
      body.set('memory', submission.memory.trim());
      body.set('email', submission.email.trim());
      body.set('displayPermission', submission.displayPermission ? 'yes' : 'no');
      if (submission.photo) body.set('photo', submission.photo);

      return new Promise((resolve) => {
        const request = new XMLHttpRequest();
        request.open('POST', endpoint);
        request.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && event.total > 0) onProgress(event.loaded / event.total);
        });
        request.addEventListener('load', () => {
          resolve(request.status >= 200 && request.status < 300 ? { kind: 'received' } : failureFor(request.status));
        });
        request.addEventListener('error', () => {
          resolve({
            kind: 'failed',
            reason: 'offline',
            message: 'The memory couldn’t be sent. You may be offline. Your writing is still here; try again when you’re connected.',
          });
        });
        request.send(body);
      });
    },
  };
}

/** The adapter for this build: the family's endpoint when `VITE_MEMORY_ENDPOINT` is set, otherwise the demonstration. */
export function configuredAdapter(endpoint: string | undefined): SubmissionAdapter {
  const value = endpoint?.trim();
  return value ? createHttpAdapter(value) : demonstrationAdapter;
}

const DRAFT_KEY = 'evergreen:memory-draft';

/**
 * Keeps an unsent memory in this browser only, so a reload or a lost connection never loses someone's
 * writing. Nothing is sent anywhere. Storage can be unavailable (private browsing, blocked storage), in
 * which case drafts simply are not kept.
 */
export const draftStore = {
  load(): MemoryDraft | undefined {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return undefined;
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return undefined;
      const value = parsed as Partial<Record<keyof MemoryDraft, unknown>>;
      return {
        name: typeof value.name === 'string' ? value.name : '',
        relationship: typeof value.relationship === 'string' ? value.relationship : '',
        memory: typeof value.memory === 'string' ? value.memory : '',
        email: typeof value.email === 'string' ? value.email : '',
        displayPermission: typeof value.displayPermission === 'boolean' ? value.displayPermission : true,
      };
    } catch {
      return undefined;
    }
  },
  save(draft: MemoryDraft): void {
    try {
      const empty = draft.name === '' && draft.relationship === '' && draft.memory === '' && draft.email === '';
      if (empty) window.localStorage.removeItem(DRAFT_KEY);
      else window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Storage unavailable: the draft lives only in the page.
    }
  },
  clear(): void {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Storage unavailable: nothing to clear.
    }
  },
};
