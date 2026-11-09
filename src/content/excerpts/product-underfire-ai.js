// @ts-check

/**
 * Source for the UnderFire AI product chapter: how the interviewer's hidden mood reacts to each kind of answer.
 * @type {import('./index.js').Excerpt}
 */
const productUnderfireAi = {
  id: 'product-underfire-ai',
  file: 'underfire.ts',
  repo: 'cja86104/underfireai',
  path: 'lib/ai/mood-engine.ts',
  lines: [37, 52],
  commit: 'bee33d286dd020011ca90409dafc374927247353',
  code: [
    "const TRIGGER_DELTAS: Record<MoodTrigger, number> = {",
    "  strong_answer: 12,",
    "  weak_answer: -12,",
    "  specific_example: 10,",
    "  vague_response: -10,",
    "  star_format_used: 8,",
    "  star_format_missing: -8,",
    "  red_flag_triggered: -15,",
    "  green_flag_triggered: 15,",
    "  pet_peeve_triggered: -12,",
    "  favorite_topic_discussed: 10,",
    "  follow_up_answered_well: 10,",
    "  follow_up_dodged: -10,",
    "  honesty_detected: 8,",
    "  deflection_detected: -12,",
    "};",
  ].join('\n'),
  becomes: 'UnderFire AI, whose interviewers react to every answer',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default productUnderfireAi;
