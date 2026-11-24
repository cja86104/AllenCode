import type { Memory } from '../content/types';

/** Memories longer than this many characters open in place rather than showing in full. */
export const LONG_MEMORY_CHARACTERS = 320;

export function memoryLength(memory: Memory): number {
  return memory.text.reduce((total, paragraph) => total + paragraph.length, 0);
}

export function isLongMemory(memory: Memory): boolean {
  return memory.text.length > 1 || memoryLength(memory) > LONG_MEMORY_CHARACTERS;
}

/**
 * The order memories appear in: the family's pinned memories first, then everything else in the order
 * it was shared. Nothing is ranked by popularity, length or who the contributor is.
 */
export function orderMemories(memories: Memory[]): Memory[] {
  const byShared = (a: Memory, b: Memory) => a.sharedOn.localeCompare(b.sharedOn) || a.id.localeCompare(b.id);
  const pinned = memories.filter((memory) => memory.pinned).sort(byShared);
  const rest = memories.filter((memory) => !memory.pinned).sort(byShared);
  return [...pinned, ...rest];
}
