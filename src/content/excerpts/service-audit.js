// @ts-check

/**
 * Source for the audit service chapter: an audit, checked line by line.
 * @type {import('./index.js').Excerpt}
 */
const serviceAudit = {
  id: 'service-audit',
  file: 'middleware.ts',
  repo: 'cja86104/crewadvisors',
  path: 'middleware.ts',
  lines: [51, 73],
  commit: '4b4c3b45ca7f49ac91008318ce5b8493b58abaef',
  code: [
    "  const {",
    "    data: { user },",
    "  } = await supabase.auth.getUser();",
    "",
    "  const { pathname } = request.nextUrl;",
    "",
    "  if (!user && matchesPrefix(pathname, PROTECTED_PREFIXES)) {",
    "    const url = request.nextUrl.clone();",
    "    url.pathname = \"/login\";",
    "    url.search = \"\";",
    "    url.searchParams.set(\"redirect\", pathname);",
    "    return NextResponse.redirect(url);",
    "  }",
    "",
    "  if (user && matchesPrefix(pathname, AUTH_ROUTES)) {",
    "    const url = request.nextUrl.clone();",
    "    url.pathname = \"/dashboard\";",
    "    url.search = \"\";",
    "    return NextResponse.redirect(url);",
    "  }",
    "",
    "  return supabaseResponse;",
    "}",
  ].join('\n'),
  becomes: 'an audit, checked line by line',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default serviceAudit;
