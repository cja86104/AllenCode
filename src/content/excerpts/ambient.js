// @ts-check

/**
 * Source for the drifting background field: this site's own page-meta hook.
 * @type {import('./index.js').Excerpt}
 */
const ambient = {
  id: 'ambient',
  file: 'usePageMeta.js',
  repo: 'cja86104/AllenCode',
  path: 'src/hooks/usePageMeta.js',
  lines: [35, 52],
  commit: 'b6701932a0fb3c170f9e5c060cc0c47086633a64',
  code: [
    'export default function usePageMeta(title, description) {',
    '  const location = useLocation();',
    '',
    '  useEffect(() => {',
    '    const url = `${SITE_URL}${location.pathname}`;',
    '',
    '    document.title = title;',
    "    upsertMeta('name', 'description', description);",
    '    upsertCanonical(url);',
    '',
    "    upsertMeta('property', 'og:title', title);",
    "    upsertMeta('property', 'og:description', description);",
    "    upsertMeta('property', 'og:url', url);",
    '',
    "    upsertMeta('name', 'twitter:title', title);",
    "    upsertMeta('name', 'twitter:description', description);",
    '  }, [title, description, location.pathname]);',
    '}',
  ].join('\n'),
  becomes: 'the faint code drifting behind every chapter',
  approved: { by: 'Chris', on: '2026-11-08' },
};

export default ambient;
