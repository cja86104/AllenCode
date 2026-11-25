export interface NavItem {
  to: string;
  label: string;
}

/** The site's pages, in navigation order. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/beer', label: 'Beer' },
  { to: '/taproom', label: 'Taproom' },
  { to: '/story', label: 'Our Story' },
  { to: '/find-us', label: 'Find Us' },
  { to: '/shop', label: 'Shop' },
  { to: '/contact', label: 'Contact' },
];

/** Where the Can Club sign-up lives. */
export const CAN_CLUB_PATH = '/contact#can-club';
