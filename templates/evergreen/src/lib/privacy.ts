import type { PrivacyMode } from '../content/types';

/** Plain descriptions of each privacy mode, shared by the privacy page and the family preview. */
export const PRIVACY_MODES: Record<PrivacyMode, { label: string; summary: string; detail: string }> = {
  public: {
    label: 'Public',
    summary: 'Anyone can find and read this memorial, and search engines may list it.',
    detail: 'Use this when the family is happy for the memorial to be found by searching for the person’s name.',
  },
  unlisted: {
    label: 'Unlisted',
    summary:
      'Search engines are asked not to list this memorial, so most people will only find it through a link. It is not private: anyone who has the link can read everything here.',
    detail:
      'Use this to keep the memorial out of search results while sharing the link freely. Do not use it for anything that must stay private.',
  },
  private: {
    label: 'Private',
    summary: 'Only people the family has invited can open this memorial. The memorial’s server checks every visit.',
    detail:
      'Needs real, server-enforced sign-in. A hidden address or a password typed into the page is not private, so the template will not publish in this mode until authentication is connected.',
  },
};
