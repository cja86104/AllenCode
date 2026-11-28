// @ts-check

/**
 * Source for the Intelligent AI Systems chapter: AI Website Powerhouse pausing on a blocker and
 * resuming on the person's word. DRAFT: not approved by Chris yet, so it is listed in drafts.js and
 * not in the site's registry (index.js), which keeps it out of the public bundle; `approved` stays
 * null until he approves these lines, and then it moves into index.js (plan, Task 6).
 * @type {import('./index.js').Excerpt}
 */
const serviceAiSystems = {
  id: 'service-ai-systems',
  file: 'blocker-notes.ts',
  repo: 'cja86104/ai-website-powerhouse',
  path: 'lib/generation/blocker-notes.ts',
  lines: [30, 46],
  commit: 'b6db4aed3cf9536539a92919a06f017b1269d4fc',
  code: [
    "/** The known \"waiting on you\" blocker classes AIWP can pause on. */",
    "export type BlockerType = \"supabase-schema\" | \"stripe-backend\";",
    "",
    "const RESUME_MESSAGES: Record<BlockerType, string> = {",
    "  \"supabase-schema\":",
    "    \"The SQL in supabase/schema.sql has been applied in the Supabase \" +",
    "    \"SQL editor and the tables now exist. Continue building the \" +",
    "    \"previous request using them.\",",
    "  \"stripe-backend\":",
    "    \"The create-payment-intent Edge Function has been deployed (supabase \" +",
    "    \"functions deploy create-payment-intent) and STRIPE_SECRET_KEY has \" +",
    "    \"been set as its secret. Continue — checkout can now complete a \" +",
    "    \"real charge.\",",
    "};",
    "",
    "/** Label for the resume action shown in the chat UI. */",
    "export const RESUME_BUTTON_LABEL = \"I've done this — continue\";",
  ].join('\n'),
  becomes: 'AI Website Powerhouse pausing for a person, then resuming on their word',
  approved: null,
};

export default serviceAiSystems;
