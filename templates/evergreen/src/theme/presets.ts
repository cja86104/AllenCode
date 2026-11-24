import type { AppearancePreset } from '../content/types';

/**
 * The colour roles every preset fills. Layout, spacing and type never change between presets; only
 * these values do, and `tests/contrast.test.ts` checks every text pairing in every preset.
 */
export interface PresetTokens {
  /** Page background. */
  paper: string;
  /** A slightly deeper paper for the few grouped surfaces (recipe card, form fields, placeholders). */
  surface: string;
  /** Body text. */
  ink: string;
  /** Headings, the name, primary actions. */
  accent: string;
  /** Captions, dates, secondary text. */
  muted: string;
  /** Hairline dividers. Decorative only, never carries meaning. */
  rule: string;
  /** Small annotations and the occasional link. Used sparingly. */
  warm: string;
  /** Keyboard focus outline. */
  focus: string;
  /** Text on an accent-coloured button. */
  onAccent: string;
}

export interface Preset {
  id: AppearancePreset;
  name: string;
  description: string;
  tokens: PresetTokens;
}

export const PRESETS: Record<AppearancePreset, Preset> = {
  'paper-and-pine': {
    id: 'paper-and-pine',
    name: 'Paper and Pine',
    description: 'Warm paper and deep green.',
    tokens: {
      paper: '#F5F1E9',
      surface: '#ECE6DA',
      ink: '#282D28',
      accent: '#33483F',
      muted: '#61645B',
      rule: '#D9D4C9',
      warm: '#92533B',
      focus: '#33483F',
      onAccent: '#F5F1E9',
    },
  },
  'linen-and-ink': {
    id: 'linen-and-ink',
    name: 'Linen and Ink',
    description: 'Pale neutral and charcoal.',
    tokens: {
      paper: '#F4F3EF',
      surface: '#EAE8E2',
      ink: '#232427',
      accent: '#2E3238',
      muted: '#5F6166',
      rule: '#D9D7D0',
      warm: '#7E5541',
      focus: '#2E3238',
      onAccent: '#F4F3EF',
    },
  },
  'dusk-and-clay': {
    id: 'dusk-and-clay',
    name: 'Dusk and Clay',
    description: 'Soft warm gray and muted terracotta.',
    tokens: {
      paper: '#EDE9E5',
      surface: '#E3DDD7',
      ink: '#2B2725',
      accent: '#7E4331',
      muted: '#635C57',
      rule: '#D5CDC6',
      warm: '#7E4331',
      focus: '#7E4331',
      onAccent: '#F6F2EE',
    },
  },
};

const VARIABLE_NAMES: Record<keyof PresetTokens, string> = {
  paper: '--paper',
  surface: '--surface',
  ink: '--ink',
  accent: '--accent',
  muted: '--muted',
  rule: '--rule',
  warm: '--warm',
  focus: '--focus',
  onAccent: '--on-accent',
};

/** CSS custom property declarations for a preset, for the page head and for live previews. */
export function presetVariables(preset: AppearancePreset): [string, string][] {
  const tokens = PRESETS[preset].tokens;
  return (Object.keys(VARIABLE_NAMES) as (keyof PresetTokens)[]).map((key) => [VARIABLE_NAMES[key], tokens[key]]);
}

/** A `:root` rule for a preset, injected into `index.html` at build time so colour never waits for JavaScript. */
export function presetCss(preset: AppearancePreset): string {
  const declarations = presetVariables(preset)
    .map(([name, value]) => `${name}:${value}`)
    .join(';');
  return `:root{${declarations}}`;
}
