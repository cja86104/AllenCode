export interface NavItem {
  to: string;
  label: string;
}

/** The site's pages, in navigation order. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/about', label: 'About' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/reservations', label: 'Reservations' },
  { to: '/contact', label: 'Contact' },
];
