// @ts-check

/**
 * Source for the custom service chapter: the Founders Helm dashboard.
 * @type {import('./index.js').Excerpt}
 */
const serviceCustom = {
  id: 'service-custom',
  file: 'dashboard.tsx',
  repo: 'cja86104/Solo-Founder-OS',
  path: 'app/(dashboard)/dashboard/page.tsx',
  lines: [128, 152],
  commit: '80ffcd6ad571e7c797fd0a03fe16c52fef6da06b',
  code: [
    "  const workspaceId = membership?.workspace_id;",
    "",
    "  // Fetch real stats in parallel",
    "  const [mrrResult, dealsResult, projectsResult, snippetsResult, landingResult, contactsResult] = await Promise.all([",
    "    // Total MRR from Command Center customers",
    "    workspaceId",
    "      ? supabase.from(\"customers\")",
    "          .select(\"mrr\")",
    "          .eq(\"workspace_id\", workspaceId)",
    "          .in(\"status\", [\"active\", \"new\", \"at_risk\"])",
    "      : Promise.resolve({ data: null }),",
    "    // Open deals count",
    "    workspaceId",
    "      ? supabase.from(\"deals\")",
    "          .select(\"*\", { count: \"exact\", head: true })",
    "          .eq(\"workspace_id\", workspaceId)",
    "          .eq(\"status\", \"open\")",
    "      : Promise.resolve({ count: null }),",
    "    // Active projects count",
    "    workspaceId",
    "      ? supabase.from(\"projects\")",
    "          .select(\"*\", { count: \"exact\", head: true })",
    "          .eq(\"workspace_id\", workspaceId)",
    "          .eq(\"status\", \"active\")",
    "      : Promise.resolve({ count: null }),",
  ].join('\n'),
  becomes: 'the Founders Helm dashboard',
  approved: null,
};

export default serviceCustom;
