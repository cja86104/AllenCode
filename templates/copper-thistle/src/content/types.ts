/**
 * The Copper Thistle content model.
 *
 * Everything a restaurant personalizes lives in `src/content/restaurant.ts`, typed by this file. Layout
 * code holds no names, prices, hours or copy, so a buyer can make the site their own without touching a
 * component. Optional fields are left out of the page when they are not supplied.
 */

/** A photograph. Stock photos are linked from their host; replace `src` with your own files in `public/`. */
export interface Photo {
  src: string;
  /** What the photograph shows, for people who cannot see it. */
  alt: string;
  /** Where the important part of the image sits when it is cropped, as CSS `object-position`. */
  position?: string;
}

export interface LinkTarget {
  label: string;
  url: string;
}

/** 0 = Sunday … 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Opening hours for one day, as 24-hour `HH:mm`. A day missing from the schedule is closed. */
export interface Opening {
  day: Weekday;
  opens: string;
  closes: string;
}

export type DietaryTag = 'vegetarian' | 'spicy' | 'seafood' | 'gluten';

export interface MenuItem {
  name: string;
  description: string;
  /** Shown as written: "$19", "Glass $18 · Bottle $68", "Market price". */
  price: string;
  tags: DietaryTag[];
  /** A photograph, used when the dish is featured on the home page. */
  photo?: Photo;
  /** Featured among the home page's signature dishes. */
  signature?: boolean;
}

export interface MenuCategory {
  id: string;
  label: string;
  items: MenuItem[];
}

export interface PressQuote {
  quote: string;
  /** The publication or critic. */
  source: string;
}

export interface GuestReview {
  name: string;
  location?: string;
  /** 1 to 5. */
  rating: number;
  quote: string;
}

export interface GalleryPhoto extends Photo {
  /** Optional caption shown under the photograph. */
  caption?: string;
  /** Relative height in the masonry columns. */
  size: 'tall' | 'medium' | 'short';
}

export interface Restaurant {
  site: {
    name: string;
    /** A short line under the name: "Hudson Valley". */
    tagline: string;
    /** One sentence for search results and link previews. */
    description: string;
    /** The published address, for canonical links and link previews. */
    url?: string;
    /** Marks the site as the template's demonstration. Only the footer says so. */
    demonstration: boolean;
    /** Search engines may index the site. Turn off for staging or demonstration copies. */
    indexable: boolean;
  };

  contact: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    phone: string;
    email: string;
    /** A link that opens the address in a map. Defaults to an OpenStreetMap search for the address. */
    mapUrl?: string;
    parking?: string;
    /** Social profiles. Only those supplied are shown. */
    social: { instagram?: LinkTarget; facebook?: LinkTarget };
  };

  hours: {
    schedule: Opening[];
    /** Shown with the hours: holidays, seasonal closures. */
    note?: string;
  };

  home: {
    hero: {
      eyebrow: string;
      /** The headline, one string per line. */
      headline: string[];
      intro: string;
      photo: Photo;
      action: string;
    };
    signature: { eyebrow: string; heading: string; note: string };
    press: { eyebrow: string; quotes: PressQuote[] };
    events: { eyebrow: string; heading: string; body: string; action: string; photo: Photo };
  };

  menu: {
    eyebrow: string;
    heading: string;
    categories: MenuCategory[];
    /** Small print under the menu. */
    notes: string[];
  };

  about: {
    eyebrow: string;
    heading: string;
    chef: { name: string; title: string; photo: Photo };
    quote: string;
    story: string[];
    processHeading: string;
    process: Photo[];
  };

  gallery: {
    eyebrow: string;
    heading: string;
    intro: string;
    photos: GalleryPhoto[];
    strip: { heading: string; photos: Photo[] };
  };

  reservations: {
    eyebrow: string;
    heading: string;
    note: string;
    /**
     * Send guests to an outside booking service (for example OpenTable or Resy) instead of the form.
     * When set, the form is replaced with a link to it.
     */
    external?: LinkTarget;
    /** How far ahead guests may book. */
    bookingWindowDays: number;
    largestParty: number;
    /** Minutes before closing that the last table is seated. */
    lastSeatingMinutes: number;
    /** Minutes between bookable times. */
    slotMinutes: number;
    ambiance: { eyebrow: string; heading: string; body: string; action: string; photo: Photo };
  };

  privateEvents: {
    eyebrow: string;
    heading: string;
    capacity: number;
    occasions: string[];
    received: string;
  };

  contactPage: {
    eyebrow: string;
    heading: string;
    reviewsHeading: string;
    reviews: GuestReview[];
  };

  newsletter: { heading: string; body: string };

  footer: { about: string };
}
