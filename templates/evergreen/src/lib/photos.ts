import type { Photo, PhotoCollection } from '../content/types';
import { partialDateSortKey } from './dates';

export type CollectionFilter = 'all' | PhotoCollection;

export interface CollectionOption {
  id: CollectionFilter;
  label: string;
}

export const COLLECTION_OPTIONS: CollectionOption[] = [
  { id: 'all', label: 'All photographs' },
  { id: 'early-years', label: 'Early years' },
  { id: 'family', label: 'Family' },
  { id: 'everyday', label: 'Everyday life' },
];

/** The query value for the collection filter: `/photographs?show=family`. */
export const COLLECTION_PARAM = 'show';

export function parseCollection(value: string | null): CollectionFilter {
  return COLLECTION_OPTIONS.some((option) => option.id === value) ? (value as CollectionFilter) : 'all';
}

/** Photographs in date order; undated photographs keep their family-chosen order at the end. */
export function chronological(photos: Photo[]): Photo[] {
  return photos
    .map((photo, index) => ({ photo, index }))
    .sort((a, b) => partialDateSortKey(a.photo.date) - partialDateSortKey(b.photo.date) || a.index - b.index)
    .map(({ photo }) => photo);
}

export function filterPhotos(photos: Photo[], collection: CollectionFilter): Photo[] {
  const ordered = chronological(photos);
  return collection === 'all' ? ordered : ordered.filter((photo) => photo.collections.includes(collection));
}

/** Filter options that have something in them, so a visitor never picks an empty collection. */
export function availableCollections(photos: Photo[]): CollectionOption[] {
  return COLLECTION_OPTIONS.filter(
    (option) => option.id === 'all' || photos.some((photo) => photo.collections.includes(option.id as PhotoCollection)),
  );
}

/** The shape a photograph is shown at in the collection: one of three controlled proportions. */
export function photoShape(photo: Photo): 'landscape' | 'portrait' | 'square' {
  const ratio = photo.width / photo.height;
  if (ratio > 1.15) return 'landscape';
  if (ratio < 0.87) return 'portrait';
  return 'square';
}

export const SHAPE_ASPECT = { landscape: 3 / 2, portrait: 4 / 5, square: 1 } as const;

export function photoPath(id: string, search = ''): string {
  return `/photographs/${encodeURIComponent(id)}${search}`;
}
