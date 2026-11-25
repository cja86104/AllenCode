import type { Restaurant } from '../content/types';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isAddress(value: string): boolean {
  if (value.startsWith('/')) return true;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Checks the content for mistakes the page cannot recover from gracefully. Returns one plain sentence
 * per problem; the build stops while any remain.
 */
export function validateRestaurant(restaurant: Restaurant): string[] {
  const problems: string[] = [];
  const days = new Set<number>();
  for (const opening of restaurant.hours.schedule) {
    if (!TIME.test(opening.opens) || !TIME.test(opening.closes)) problems.push(`Hours for day ${opening.day} must be written as HH:mm.`);
    else if (opening.closes <= opening.opens) problems.push(`Hours for day ${opening.day} close before they open.`);
    if (days.has(opening.day)) problems.push(`Day ${opening.day} appears twice in the hours.`);
    days.add(opening.day);
  }
  if (!EMAIL.test(restaurant.contact.email)) problems.push('The contact email address is not complete.');

  const photos = [
    restaurant.home.hero.photo,
    restaurant.home.events.photo,
    restaurant.about.chef.photo,
    restaurant.reservations.ambiance.photo,
    ...restaurant.about.process,
    ...restaurant.gallery.photos,
    ...restaurant.gallery.strip.photos,
    ...restaurant.menu.categories.flatMap((category) => category.items.flatMap((item) => (item.photo ? [item.photo] : []))),
  ];
  for (const photo of photos) {
    if (!isAddress(photo.src)) problems.push(`The photo “${photo.alt}” needs a secure https address or a file in public/.`);
    if (photo.alt.trim() === '') problems.push(`A photo at ${photo.src} needs alt text describing what it shows.`);
  }

  const ids = new Set<string>();
  for (const category of restaurant.menu.categories) {
    if (ids.has(category.id)) problems.push(`Two menu categories share the id “${category.id}”.`);
    ids.add(category.id);
    for (const item of category.items) {
      if (item.signature && !item.photo) problems.push(`The signature dish “${item.name}” needs a photo.`);
    }
  }

  for (const review of restaurant.contactPage.reviews) {
    if (!(review.rating >= 1 && review.rating <= 5)) problems.push(`The review from ${review.name} needs a rating from 1 to 5.`);
  }
  const { reservations } = restaurant;
  if (reservations.largestParty < 1) problems.push('The largest party must be at least 1.');
  if (reservations.slotMinutes < 5) problems.push('Bookable times must be at least 5 minutes apart.');
  if (reservations.external && !isAddress(reservations.external.url))
    problems.push('The outside booking link must be a secure https address.');
  for (const link of Object.values(restaurant.contact.social)) {
    if (link && !isAddress(link.url)) problems.push(`The ${link.label} link must be a secure https address.`);
  }
  return problems;
}

/** The dishes featured on the home page, in menu order. */
export function signatureDishes(restaurant: Restaurant) {
  return restaurant.menu.categories.flatMap((category) => category.items.filter((item) => item.signature && item.photo));
}

/** A map link for the address: the restaurant's own, or an OpenStreetMap search. */
export function mapUrl(restaurant: Restaurant): string {
  const { contact } = restaurant;
  if (contact.mapUrl) return contact.mapUrl;
  const query = `${contact.street}, ${contact.city}, ${contact.region} ${contact.postalCode}`;
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
}
