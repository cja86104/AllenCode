// @ts-check

/**
 * Source for the Crew Advisors product chapter: how the board finds which advisors owe a founder a check-in. Shown still being typed: the product is coming soon.
 * @type {import('./index.js').Excerpt}
 */
const productCrewAdvisors = {
  id: 'product-crew-advisors',
  file: 'crew-advisors.ts',
  repo: 'cja86104/crewadvisors',
  path: 'lib/advisor/checkin-scheduler.ts',
  lines: [9, 38],
  commit: '4b4c3b45ca7f49ac91008318ce5b8493b58abaef',
  code: [
    "/**",
    " * Returns this user's due check-ins (pending, follow_up_at in the past),",
    " * joined with advisor display names. Service-role client required — the",
    " * cron path has no user session.",
    " */",
    "export async function getAdvisorsForCheckin(",
    "  admin: SupabaseClient<Database>,",
    "  userId: string",
    "): Promise<AdvisorCheckinTarget[]> {",
    "  const now = new Date().toISOString();",
    "",
    "  const { data, error } = await admin",
    "    .from(\"advisor_checkins\")",
    "    .select(\"*, advisors(name)\")",
    "    .eq(\"user_id\", userId)",
    "    .eq(\"status\", \"pending\")",
    "    .lte(\"follow_up_at\", now)",
    "    .order(\"follow_up_at\", { ascending: true })",
    "    .limit(20);",
    "",
    "  if (error || !data) return [];",
    "",
    "  return data.map((row) => {",
    "    const { advisors, ...checkin } = row;",
    "    return {",
    "      checkin: checkin as AdvisorCheckin,",
    "      advisorName: advisors?.name ?? \"Your advisor\",",
    "    };",
    "  });",
    "}",
  ].join('\n'),
  becomes: 'Crew Advisors, still being written',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default productCrewAdvisors;
