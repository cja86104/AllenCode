/**
 * The Evergreen content model.
 *
 * Everything a family personalizes lives in `src/content/memorial.ts`, typed by this file. Layout code
 * never holds names, dates or stories, so a family can make the memorial their own without touching a
 * component. Every field that a family might not know is optional: a missing date, relationship or
 * location is left out of the page instead of being shown empty.
 */

/** A date that may be known only in part ("1952", "Summer, around 1982", "June 1969"). */
export interface PartialDate {
  year?: number;
  /** 1 to 12. */
  month?: number;
  /** 1 to 31. Ignored without a month. */
  day?: number;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  /** Shows "around" before the year. */
  approximate?: boolean;
  /** Free text that replaces the generated wording, for dates no rule describes ("The week of the flood"). */
  label?: string;
}

/** How the memorial refers to the person. */
export interface Pronouns {
  /** "she", "he", "they", or a name. */
  subject: string;
  /** "her", "him", "them". */
  object: string;
  /** "her", "his", "their". */
  possessive: string;
  /** The navigation and heading label for the life story: "Her life", "His life", "Their life", or custom. */
  lifeLabel: string;
}

/** Where the important part of a photograph sits, as percentages from the top-left corner. */
export interface FocalPoint {
  x: number;
  y: number;
}

export type PhotoCollection = 'early-years' | 'family' | 'everyday';

export interface PhotoSource {
  src: string;
  /** Intrinsic width of this file in pixels. */
  width: number;
}

export interface Photo {
  id: string;
  /** Path to the image file. */
  src: string;
  /** Intrinsic size of `src`, used to reserve space and avoid layout shift. */
  width: number;
  height: number;
  /** Extra resolutions of the same image for responsive loading. */
  sources?: PhotoSource[];
  /** Describes what the photograph shows, for people who cannot see it. */
  alt: string;
  caption: string;
  date?: PartialDate;
  location?: string;
  /** Who shared the photograph. */
  contributor?: string;
  /** An optional longer story, one string per paragraph. */
  story?: string[];
  focalPoint?: FocalPoint;
  collections: PhotoCollection[];
  /**
   * Marks a stand-in image used until the family adds their own photograph. Placeholders are labelled
   * as such on the page and to screen readers.
   */
  placeholder?: boolean;
}

/** A line drawing that ships with the template, used for personal objects. */
export type DrawingName = 'recipe-tin' | 'book' | 'chair' | 'tomato' | 'sprig';

/** One of the small personal things the memorial opens with. */
export interface RememberedObject {
  id: string;
  name: string;
  /** One line shown before the story is opened. */
  summary: string;
  /** The anecdote, one string per paragraph. */
  story: string[];
  /** Who remembered it. */
  attribution?: string;
  drawing?: DrawingName;
  /** A photograph of the object, used instead of the drawing when supplied. */
  photoId?: string;
}

export interface Chapter {
  id: string;
  title: string;
  /** Shown as written: "1946–1964", "The 1970s", "Always". */
  years?: string;
  /** The short version on the main memorial, one string per paragraph. */
  excerpt: string[];
  /** The full chapter for the reading view. Falls back to the excerpt when empty. */
  body: string[];
  /** A photograph placed beside the chapter. */
  photoId?: string;
  /** A remembered expression set in italic. */
  aside?: string;
}

export interface LifeStory {
  heading: string;
  intro: string[];
  chapters: Chapter[];
  /** "Written by her children…". Optional. */
  attribution?: string;
}

export interface Memory {
  id: string;
  author: string;
  relationship?: string;
  /** One string per paragraph. Plain text only; it is never rendered as HTML. */
  text: string[];
  /** Pinned by the family. Pinning is the only ordering the family controls; nothing is ranked. */
  pinned?: boolean;
  photoId?: string;
  /** When it was shared, as an ISO date. Used for ordering only. */
  sharedOn: string;
}

export type ServiceVisibility = 'public' | 'private';

export interface LinkOption {
  label: string;
  url: string;
}

export interface GatheringEvent {
  id: string;
  title: string;
  /** Local date and time of the start, written as `YYYY-MM-DDTHH:mm`. */
  start: string;
  /** Minutes. Used to decide when the gathering has taken place. Defaults to 180. */
  durationMinutes?: number;
  /** IANA time zone, for example `America/New_York`. */
  timeZone: string;
  /** A short label for the time zone, shown to visitors: "Eastern Time". */
  timeZoneLabel: string;
  venue: string;
  /** Only shown when supplied. A map link is only offered when an address exists. */
  address?: string;
  city?: string;
  directions?: string;
  accessibility?: string;
  parking?: string;
  dress?: string;
  reception?: string;
  /** A family note shown with the details. */
  note?: string;
  rsvp?: LinkOption;
  livestream?: LinkOption;
  /** Shows a calendar download while the gathering is still to come. */
  offerCalendar?: boolean;
  /** Marks a demonstration event so the template preview can say so. */
  fictional?: boolean;
}

export interface Gathering {
  heading: string;
  /**
   * `public`: details are shown, and the page changes by itself once the gathering has taken place.
   * `private`: the page says details will be shared privately, and no time or place is shown.
   */
  visibility: ServiceVisibility;
  events: GatheringEvent[];
  /** Shown after the gathering has taken place. */
  afterNote?: string;
  /** Shown when details are private. */
  privateNote?: string;
}

export interface RecipeModule {
  enabled: boolean;
  heading: string;
  name: string;
  /** Who wrote the card, when, and anything about it worth saying. */
  provenance?: string;
  /** The card as written, line by line, including crossings-out the family wants to keep. */
  cardLines: string[];
  /** A scan or photograph of the card. When absent, the written card is typeset instead. */
  cardPhotoId?: string;
  ingredients: string[];
  steps: string[];
  /** Notes in the margin, kept separate from the steps. */
  notes?: string[];
}

export interface ReadingListModule {
  enabled: boolean;
  heading: string;
  intro?: string;
  books: { title: string; author: string; note?: string }[];
}

export interface LetterModule {
  enabled: boolean;
  heading: string;
  paragraphs: string[];
  signature?: string;
}

export interface AudioModule {
  enabled: boolean;
  heading: string;
  src: string;
  /** Required: audio is never published without a transcript. */
  transcript: string[];
  /** Optional WebVTT captions, shown by the player when the visitor turns them on. */
  captions?: string;
  speaker?: string;
}

export interface RemembranceModule {
  enabled: boolean;
  heading: string;
  date: PartialDate;
  text?: string;
}

export interface DonationModule {
  enabled: boolean;
  heading: string;
  text: string;
  /** Must be a destination the family supplied. The template never processes payments. */
  link: LinkOption;
}

export interface ProgramModule {
  enabled: boolean;
  heading: string;
  file: LinkOption;
  /** For example "PDF, 2 pages, 1.1 MB". */
  description?: string;
}

export interface ObservanceModule {
  enabled: boolean;
  heading: string;
  paragraphs: string[];
}

export interface OptionalModules {
  recipe?: RecipeModule;
  readingList?: ReadingListModule;
  letter?: LetterModule;
  audio?: AudioModule;
  remembrance?: RemembranceModule;
  donation?: DonationModule;
  program?: ProgramModule;
  observances?: ObservanceModule;
}

/**
 * `public`: listed and indexable.
 * `unlisted`: not listed or indexed, but anyone with the link can open it. It is not private.
 * `private`: only for visitors the server lets in. Needs server-enforced access control.
 */
export type PrivacyMode = 'public' | 'unlisted' | 'private';

export interface PrivacySettings {
  mode: PrivacyMode;
  /** Whether visitors may send memories for the family to review. */
  acceptMemories: boolean;
  /** Whether visitors may attach a photograph to a memory. */
  acceptPhotos: boolean;
}

export type AppearancePreset = 'paper-and-pine' | 'linen-and-ink' | 'dusk-and-clay';

export interface FamilyContact {
  /** Who visitors are told is looking after the memorial. */
  caretaker?: string;
  /** Shown only when the family chooses to publish it. */
  publicEmail?: string;
  /** A sentence about how the family prefers to be reached, if at all. */
  preference?: string;
}

export interface Person {
  /** The name used in running text: "Nell". */
  displayName: string;
  /** The full name for the opening and metadata: "Eleanor “Nell” Whitaker". */
  fullName: string;
  /** A shorter form for the site header: "Nell Whitaker". Defaults to the full name. */
  shortName?: string;
  /**
   * How the full name breaks across lines in the opening, so a name is never split awkwardly.
   * Defaults to the full name on one line, wrapping only between words.
   */
  nameLines?: string[];
  pronouns: Pronouns;
  born?: PartialDate;
  died?: PartialDate;
  /** Some families prefer not to show dates. */
  showDates: boolean;
  place?: string;
}

export interface Opening {
  eyebrow: string;
  intro: string;
  portraitId?: string;
}

export interface Closing {
  photoId?: string;
  note: string;
  signature?: string;
}

export interface SiteSettings {
  /** The address the memorial is published at, used for the copied link and social previews. */
  url?: string;
  appearance: AppearancePreset;
  /** An image for link previews. Falls back to the portrait. */
  socialImageId?: string;
  /** A one-sentence description for link previews. Falls back to the opening introduction. */
  description?: string;
  /** Marks the whole memorial as the template's demonstration. Only the preview footer says so. */
  demonstration: boolean;
}

export interface Memorial {
  site: SiteSettings;
  person: Person;
  opening: Opening;
  objects: { heading: string; intro?: string; items: RememberedObject[] };
  life: LifeStory;
  photos: {
    heading: string;
    intro?: string;
    /** Up to six photograph ids shown on the main memorial, in order. Defaults to the first six. */
    featured?: string[];
    items: Photo[];
  };
  gathering?: Gathering;
  memories: { heading: string; intro?: string; items: Memory[] };
  modules: OptionalModules;
  closing: Closing;
  privacy: PrivacySettings;
  contact: FamilyContact;
}
