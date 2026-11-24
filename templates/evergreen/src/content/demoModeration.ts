import type { Memory } from './types';

/**
 * Memories waiting for the family's review, used only by the demonstration of the family area
 * (`/family/preview`), which is loaded separately from the public pages. In a published memorial,
 * unreviewed memories live on the server and are never sent to visitors.
 */
export interface PendingMemory extends Memory {
  displayPermission: boolean;
  /** Whether the contributor left an email address. The address itself is never shown here. */
  leftEmail: boolean;
  /** Describes an attached photograph in the demonstration; no file is included. */
  photoNote?: string;
}

export const pendingMemories: PendingMemory[] = [
  {
    id: 'pending-carol',
    author: 'Carol Iredell',
    relationship: 'Riverside parent',
    sharedOn: '2026-10-12',
    displayPermission: true,
    leftEmail: true,
    text: [
      'My son could not sit still for anything, and Mrs. Whitaker let him read standing up at the end of the shelves for a whole year. He is thirty-four now and still reads standing up.',
    ],
  },
  {
    id: 'pending-walt',
    author: 'Walt Pressley',
    relationship: 'cousin',
    sharedOn: '2026-10-15',
    displayPermission: true,
    leftEmail: false,
    photoNote: 'A photograph of the feed store, 1958 (demonstration: no file attached).',
    text: ['I found this in my father’s things. That’s Uncle Roy in the doorway and Nell on the bench out front, reading, of course.'],
  },
  {
    id: 'pending-private',
    author: 'Lena',
    relationship: 'former student',
    sharedOn: '2026-10-20',
    displayPermission: false,
    leftEmail: true,
    text: [
      'I wanted the family to know that she was the first adult who noticed I wasn’t eating lunch. I never told anyone else. I’d rather this stay between us.',
    ],
  },
];
