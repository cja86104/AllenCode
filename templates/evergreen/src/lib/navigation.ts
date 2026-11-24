import type { Memorial } from '../content/types';

export interface NavItem {
  /** The id of the section on the main memorial. */
  id: string;
  label: string;
}

/** Section ids on the main memorial, shared by the sections and the navigation that links to them. */
export const SECTION_IDS = {
  objects: 'remembered',
  life: 'life',
  photos: 'photographs',
  gathering: 'gathering',
  memories: 'memories',
  recipe: 'recipe',
} as const;

/**
 * The main navigation. An item is only offered when its section has something in it, so a family that
 * has no gathering or no photographs yet never sees a link to an empty section.
 */
export function mainNavigation(memorial: Memorial): NavItem[] {
  const items: NavItem[] = [];
  if (memorial.life.chapters.length > 0 || memorial.life.intro.length > 0) {
    items.push({ id: SECTION_IDS.life, label: memorial.person.pronouns.lifeLabel });
  }
  if (memorial.photos.items.length > 0) items.push({ id: SECTION_IDS.photos, label: 'Photographs' });
  if (memorial.gathering && (memorial.gathering.visibility === 'private' || memorial.gathering.events.length > 0)) {
    items.push({ id: SECTION_IDS.gathering, label: 'Gathering' });
  }
  if (memorial.memories.items.length > 0 || memorial.privacy.acceptMemories) {
    items.push({ id: SECTION_IDS.memories, label: 'Memories' });
  }
  return items;
}
