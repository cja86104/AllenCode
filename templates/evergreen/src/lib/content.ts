import type { Memorial, Photo } from '../content/types';

/** The photographs shown on the main memorial: the family's choice, or the first six. */
export function featuredPhotos(memorial: Memorial): Photo[] {
  const chosen = memorial.photos.featured;
  if (chosen && chosen.length > 0) {
    return chosen
      .map((id) => findPhoto(memorial, id))
      .filter((photo): photo is Photo => photo !== undefined)
      .slice(0, 6);
  }
  return memorial.photos.items.slice(0, 6);
}

/** Finds a photograph by id. Returns undefined for a missing or unknown id. */
export function findPhoto(memorial: Memorial, id: string | undefined): Photo | undefined {
  if (!id) return undefined;
  return memorial.photos.items.find((photo) => photo.id === id);
}

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

function duplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) repeated.add(id);
    seen.add(id);
  }
  return [...repeated];
}

export interface ValidationOptions {
  /** Whether a server enforces access control. Private memorials require it. */
  serverAccessControl: boolean;
}

/**
 * Checks a family's content for mistakes the page cannot recover from gracefully: references to
 * photographs that do not exist, audio without a transcript, links that are not secure, or a private
 * memorial published without server-enforced access. Returns one plain sentence per problem.
 */
export function validateMemorial(memorial: Memorial, options: ValidationOptions): string[] {
  const problems: string[] = [];
  const photoIds = new Set(memorial.photos.items.map((photo) => photo.id));
  const checkPhoto = (id: string | undefined, where: string) => {
    if (id !== undefined && !photoIds.has(id)) problems.push(`${where} refers to a photograph “${id}” that is not in photos.items.`);
  };

  for (const id of duplicates(memorial.photos.items.map((photo) => photo.id))) problems.push(`Two photographs share the id “${id}”.`);
  for (const id of duplicates(memorial.memories.items.map((memory) => memory.id))) problems.push(`Two memories share the id “${id}”.`);
  for (const id of duplicates(memorial.life.chapters.map((chapter) => chapter.id))) problems.push(`Two chapters share the id “${id}”.`);
  for (const id of duplicates(memorial.objects.items.map((item) => item.id))) problems.push(`Two remembered objects share the id “${id}”.`);

  checkPhoto(memorial.opening.portraitId, 'The opening portrait');
  for (const id of memorial.photos.featured ?? []) checkPhoto(id, 'The featured photographs');
  checkPhoto(memorial.site.socialImageId, 'The social preview image');
  checkPhoto(memorial.closing.photoId, 'The closing photograph');
  checkPhoto(memorial.modules.recipe?.cardPhotoId, 'The recipe card');
  for (const chapter of memorial.life.chapters) checkPhoto(chapter.photoId, `Chapter “${chapter.title}”`);
  for (const item of memorial.objects.items) checkPhoto(item.photoId, `Object “${item.name}”`);
  for (const memory of memorial.memories.items) checkPhoto(memory.photoId, `The memory from ${memory.author}`);

  for (const photo of memorial.photos.items) {
    if (photo.alt.trim() === '') problems.push(`Photograph “${photo.id}” needs alt text describing what it shows.`);
    if (!(photo.width > 0 && photo.height > 0)) problems.push(`Photograph “${photo.id}” needs its real width and height.`);
    if (photo.collections.length === 0) problems.push(`Photograph “${photo.id}” needs at least one collection.`);
    const focal = photo.focalPoint;
    if (focal && (focal.x < 0 || focal.x > 100 || focal.y < 0 || focal.y > 100)) {
      problems.push(`Photograph “${photo.id}” has a focal point outside 0–100.`);
    }
  }

  for (const event of memorial.gathering?.events ?? []) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(event.start))
      problems.push(`Event “${event.title}” needs a start written as YYYY-MM-DDTHH:mm.`);
    if (!isValidTimeZone(event.timeZone)) problems.push(`Event “${event.title}” has an unknown time zone “${event.timeZone}”.`);
    if (event.rsvp && !isHttpsUrl(event.rsvp.url))
      problems.push(`Event “${event.title}” has an RSVP link that is not a secure https address.`);
    if (event.livestream && !isHttpsUrl(event.livestream.url))
      problems.push(`Event “${event.title}” has a livestream link that is not a secure https address.`);
  }

  const { audio, donation, program } = memorial.modules;
  if (audio?.enabled && audio.transcript.length === 0) problems.push('The audio memory needs a transcript before it can be shown.');
  if (donation?.enabled && !isHttpsUrl(donation.link.url))
    problems.push('The donation link must be a secure https address the family supplied.');
  if (program?.enabled && program.file.url.trim() === '') problems.push('The service program needs a file.');

  if (memorial.privacy.mode === 'private' && !options.serverAccessControl) {
    problems.push(
      'Private mode needs server-enforced access control, and none is configured. A static site cannot keep content private: publish as unlisted, or connect authentication first.',
    );
  }

  return problems;
}
