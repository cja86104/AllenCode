/** 0 is Sunday, as in JavaScript's `Date#getDay`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** One day's opening hours, as 24-hour `HH:mm` times. A day with no entry is closed. */
export interface Opening {
  day: Weekday;
  opens: string;
  closes: string;
}

export interface Photo {
  /** An https address, or a file in `public/` written as `/photos/...`. */
  src: string;
  /** What the photograph shows, for people who can't see it. */
  alt: string;
  /** CSS `object-position`, to keep the subject in frame when the photo is cropped. */
  position?: string;
}

export interface Beer {
  id: string;
  name: string;
  style: string;
  /** Alcohol by volume, in percent. */
  abv: number;
  /** International bitterness units. */
  ibu: number;
  /** A short tasting note. */
  note: string;
  /** One of `beer.groups`; the draft list is grouped by it. */
  group: string;
  /** On draft right now: shown in the home page's "Currently pouring" strip. */
  onTap: boolean;
}

export type ProductCategory = 'Beer' | 'Apparel' | 'Glassware' | 'Gear';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  /** Price in dollars, as charged at pickup. */
  price: number;
  description: string;
  /** For beer: the pack, e.g. "4-pack · 16 oz cans". */
  pack?: string;
  /** Allocated: Can Club members get first pick. */
  limited?: boolean;
}

export interface Quote {
  quote: string;
  name: string;
  role: string;
}

export interface FoodTruck {
  day: Weekday;
  name: string;
  fare: string;
}

export interface TaproomEvent {
  id: string;
  title: string;
  /** When it happens, in words that don't go out of date: "Every Thursday · 7 PM". */
  when: string;
  detail: string;
}

export interface Retailer {
  name: string;
  address: string;
  city: string;
}

export interface RetailRegion {
  name: string;
  stores: Retailer[];
}

export interface Plan {
  id: string;
  label: string;
  /** Price in dollars per delivery period. */
  price: number;
  cans: number;
  /** "every month", "every three months". */
  cadence: string;
  /** Optional line under the price, e.g. "Saves $6 over monthly". */
  note?: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Brewery {
  site: {
    name: string;
    /** The short name in the header and footer. */
    shortName: string;
    tagline: string;
    /** The search-result and link-preview description. */
    description: string;
    /** A template preview: forms say plainly that nothing is sent, and the footer says the brewery is fictional. */
    demonstration: boolean;
    /** Lets search engines list the site. Leave false until it's live. */
    indexable: boolean;
    /** The site's published address, once there is one. */
    url?: string;
  };

  contact: {
    street: string;
    city: string;
    email: string;
    /** For distributors and retail buyers. */
    tradeEmail: string;
    phone?: string;
    /** A map link of your own; otherwise an OpenStreetMap search for the address. */
    mapUrl?: string;
  };

  hours: {
    schedule: Opening[];
    /** Why the closed days are closed, shown beside them. */
    closedNote?: string;
    /** A line under the hours. */
    note?: string;
  };

  home: {
    hero: { eyebrow: string; lines: string[]; intro: string; photo: Photo };
    pouring: { eyebrow: string; heading: string; note: string };
    canClub: { eyebrow: string; heading: string; body: string; points: string[]; stamp: string; photo: Photo };
    regulars: { eyebrow: string; quotes: Quote[]; photo: Photo };
    floor: {
      eyebrow: string;
      heading: string;
      body: string;
      /** Three photographs of the brewhouse. */
      photos: Photo[];
      batch: { label: string; number: string; detail: string };
    };
  };

  beer: {
    intro: string;
    /** The draft list's groups, in the order they're shown. */
    groups: string[];
    beers: Beer[];
    releases: { eyebrow: string; heading: string; note: string };
    freshness: { heading: string; body: string };
  };

  taproom: {
    eyebrow: string;
    intro: string;
    foodTrucks: FoodTruck[];
    events: TaproomEvent[];
    eventsNote: string;
    roomNote: string;
    /** Six photographs of the room, shown as a gallery. */
    photos: Photo[];
  };

  story: {
    eyebrow: string;
    quote: string;
    paragraphs: string[];
    brewer: { name: string; role: string; photo: Photo };
    process: { eyebrow: string; heading: string; note: string; steps: { label: string; photo: Photo }[] };
    stats: Stat[];
  };

  findUs: {
    eyebrow: string;
    intro: string;
    regions: RetailRegion[];
    trade: { heading: string; body: string };
    photo: Photo;
  };

  shop: {
    eyebrow: string;
    intro: string;
    products: Product[];
    /** How orders are collected; the first is the default. */
    pickupOptions: { id: string; label: string }[];
    /** Shown beside the order total: taxes, payment at pickup. */
    paymentNote: string;
    /** The minimum age to buy beer, checked at pickup. */
    minimumAge: number;
  };

  contactPage: {
    eyebrow: string;
    intro: string;
    topics: { id: string; label: string }[];
    photo: Photo;
  };

  canClub: {
    eyebrow: string;
    heading: string;
    intro: string;
    plans: Plan[];
  };

  footer: { blurb: string; stamp: { mark: string; label: string }; closing: string };
}
