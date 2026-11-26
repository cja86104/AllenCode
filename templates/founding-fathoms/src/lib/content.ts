import type { Beer, Brewery, FoodTruck, Photo, Product } from '../content/types';
import { WEEK } from './hours';

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

/** Every photograph the content places on a page. */
export function allPhotos(brewery: Brewery): Photo[] {
  const { home, story, findUs, contactPage, taproom } = brewery;
  return [
    home.hero.photo,
    home.canClub.photo,
    home.regulars.photo,
    ...home.floor.photos,
    ...taproom.photos,
    story.brewer.photo,
    ...story.process.steps.map((step) => step.photo),
    findUs.photo,
    contactPage.photo,
  ];
}

/**
 * Checks the content for mistakes the pages cannot recover from gracefully. Returns one plain sentence
 * per problem; the build stops while any remain.
 */
export function validateBrewery(brewery: Brewery): string[] {
  const problems: string[] = [];
  const days = new Set<number>();
  for (const opening of brewery.hours.schedule) {
    if (!TIME.test(opening.opens) || !TIME.test(opening.closes)) problems.push(`Hours for day ${opening.day} must be written as HH:mm.`);
    else if (opening.closes <= opening.opens) problems.push(`Hours for day ${opening.day} close before they open.`);
    if (days.has(opening.day)) problems.push(`Day ${opening.day} appears twice in the hours.`);
    days.add(opening.day);
  }
  for (const [label, email] of [
    ['contact', brewery.contact.email],
    ['trade', brewery.contact.tradeEmail],
  ] as const) {
    if (!EMAIL.test(email)) problems.push(`The ${label} email address is not complete.`);
  }
  if (brewery.contact.mapUrl && !isAddress(brewery.contact.mapUrl)) problems.push('The map link must be a secure https address.');

  for (const photo of allPhotos(brewery)) {
    if (!isAddress(photo.src)) problems.push(`The photo “${photo.alt}” needs a secure https address or a file in public/.`);
    if (photo.alt.trim() === '') problems.push(`A photo at ${photo.src} needs alt text describing what it shows.`);
  }
  if (brewery.home.floor.photos.length !== 3) problems.push('The “On the floor” section needs exactly three photos.');
  if (brewery.taproom.photos.length === 0) problems.push('The taproom gallery needs at least one photo.');
  if (brewery.story.process.steps.length === 0) problems.push('The process strip needs at least one step.');
  if (brewery.home.hero.lines.length === 0) problems.push('The home page heading needs at least one line.');

  const groups = new Set(brewery.beer.groups);
  const beerIds = new Set<string>();
  for (const beer of brewery.beer.beers) {
    if (beerIds.has(beer.id)) problems.push(`Two beers share the id “${beer.id}”.`);
    beerIds.add(beer.id);
    if (!groups.has(beer.group)) problems.push(`${beer.name} is in the group “${beer.group}”, which isn’t in beer.groups.`);
    if (!(beer.abv > 0 && beer.abv < 100)) problems.push(`${beer.name} needs a strength between 0 and 100% ABV.`);
    if (!(beer.ibu >= 0)) problems.push(`${beer.name} needs a bitterness of 0 IBU or more.`);
  }
  if (!brewery.beer.beers.some((beer) => beer.onTap)) problems.push('At least one beer must be on tap for the home page.');

  const productIds = new Set<string>();
  for (const product of brewery.shop.products) {
    if (productIds.has(product.id)) problems.push(`Two products share the id “${product.id}”.`);
    productIds.add(product.id);
    if (!(product.price > 0)) problems.push(`${product.name} needs a price above zero.`);
  }
  if (brewery.shop.pickupOptions.length === 0) problems.push('The shop needs at least one way to collect an order.');
  if (brewery.canClub.plans.length === 0) problems.push('The Can Club needs at least one plan.');
  const truckDays = new Set<number>();
  for (const truck of brewery.taproom.foodTrucks) {
    if (truckDays.has(truck.day)) problems.push(`Two food trucks are booked for day ${truck.day}.`);
    truckDays.add(truck.day);
  }
  const eventIds = new Set<string>();
  for (const event of brewery.taproom.events) {
    if (eventIds.has(event.id)) problems.push(`Two events share the id “${event.id}”.`);
    eventIds.add(event.id);
  }
  if (brewery.contactPage.topics.length === 0) problems.push('The contact form needs at least one topic.');
  if (brewery.home.regulars.quotes.length === 0) problems.push('The home page needs at least one quote from a regular.');
  return problems;
}

/** The beers on draft right now, in list order. */
export function onTap(brewery: Brewery): Beer[] {
  return brewery.beer.beers.filter((beer) => beer.onTap);
}

/** The average strength of a set of beers, to one decimal place. */
export function averageAbv(beers: Beer[]): number {
  if (beers.length === 0) return 0;
  return Math.round((beers.reduce((sum, beer) => sum + beer.abv, 0) / beers.length) * 10) / 10;
}

/** The four-packs and other beer the shop sells, in shop order. */
export function beerToGo(brewery: Brewery): Product[] {
  return brewery.shop.products.filter((product) => product.category === 'Beer');
}

/** The draft list's groups in their set order, each with its beers. Empty groups are left out. */
export function draftGroups(brewery: Brewery): { group: string; beers: Beer[] }[] {
  return brewery.beer.groups
    .map((group) => ({ group, beers: brewery.beer.beers.filter((beer) => beer.group === group) }))
    .filter((entry) => entry.beers.length > 0);
}

/** The food trucks in the order the week is read, Monday first. */
export function trucksByWeek(brewery: Brewery): FoodTruck[] {
  return [...brewery.taproom.foodTrucks].sort((a, b) => WEEK.indexOf(a.day) - WEEK.indexOf(b.day));
}

/** Shops whose name, street, city or region contains the search. An empty search keeps every shop. */
export function searchRetailers(brewery: Brewery, query: string) {
  const term = query.trim().toLowerCase();
  return brewery.findUs.regions
    .map((region) => ({
      name: region.name,
      stores: term
        ? region.stores.filter((store) =>
            [store.name, store.address, store.city, region.name].some((value) => value.toLowerCase().includes(term)),
          )
        : region.stores,
    }))
    .filter((region) => region.stores.length > 0);
}

/** "$16" for whole dollars, "$16.50" otherwise. */
export function price(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

/** A map link for the address: the brewery's own, or an OpenStreetMap search. */
export function mapUrl(brewery: Brewery): string {
  const { contact } = brewery;
  if (contact.mapUrl) return contact.mapUrl;
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${contact.street}, ${contact.city}`)}`;
}
