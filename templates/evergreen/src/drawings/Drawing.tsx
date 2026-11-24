import type { ReactNode } from 'react';
import type { DrawingName } from '../content/types';

/**
 * Small line drawings that ship with the template: the recipe tin, a book, the extra chair, a tomato,
 * and a sprig used as a quiet divider. Drawn in a single stroke weight in the current text colour, so
 * they follow every appearance preset. Decorative: the object's name is always written beside them.
 */
const PATHS: Record<DrawingName, ReactNode> = {
  'recipe-tin': (
    <>
      <path d="M22 52h76v40a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6V52Z" />
      <path d="M20 52h80" />
      <path d="M24 52 30 30h60l6 22" />
      <path d="M38 52V38h18v14M50 52V34h18v18M64 52V40h16v12" />
      <path d="M41 43h10M53 39h11M67 45h9" />
      <path d="M30 74c4 2 8 2 12 0" />
      <path d="M54 66h12" />
    </>
  ),
  book: (
    <>
      <path d="M60 34c-10-6-24-8-38-6v58c14-2 28 0 38 6 10-6 24-8 38-6V28c-14-2-28 0-38 6Z" />
      <path d="M60 34v58" />
      <path d="M70 42c4-1 9-1 14 0" />
      <path d="M70 52h20M70 58h18M70 64h20M70 70h14" />
      <path d="M30 52h20M30 58h18M30 64h20M30 70h16M30 76h12" />
    </>
  ),
  chair: (
    <>
      <path d="M40 18h40" />
      <path d="M42 18v52M78 18v52" />
      <path d="M50 22v44M60 22v44M70 22v44" />
      <path d="M34 70h52l-3 8H37l-3-8Z" />
      <path d="M38 78l-4 26M82 78l4 26M46 78l-1 22M74 78l1 22" />
      <path d="M38 94h44" />
    </>
  ),
  tomato: (
    <>
      <path d="M60 40c22 0 34 12 34 28S80 98 60 98 26 84 26 68s12-28 34-28Z" />
      <path d="M60 40c-6-6-14-6-20-2 6 1 10 4 12 8M60 40c6-6 14-6 20-2-6 1-10 4-12 8M60 40c0-6 2-12 6-16" />
      <path d="M44 56c-4 4-6 10-5 16" />
    </>
  ),
  sprig: (
    <>
      <path d="M14 60c30-2 62-2 92 0" />
      <path d="M36 60c2-8 8-12 16-12-2 8-8 12-16 12ZM56 60c2-9 9-14 18-14-2 9-9 14-18 14ZM40 60c4 7 10 10 18 9-4-7-10-10-18-9ZM62 60c4 7 11 10 19 9-4-7-11-10-19-9Z" />
    </>
  ),
};

interface DrawingProps {
  name: DrawingName;
  className?: string;
}

export function Drawing({ name, className }: DrawingProps) {
  return (
    <svg
      className={['drawing', className].filter(Boolean).join(' ')}
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
