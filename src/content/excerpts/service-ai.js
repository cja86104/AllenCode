// @ts-check

/**
 * Source for the ai service chapter: an advisor reply in Crew Advisors.
 * @type {import('./index.js').Excerpt}
 */
const serviceAi = {
  id: 'service-ai',
  file: 'chat-client.ts',
  repo: 'cja86104/crewadvisors',
  path: 'lib/ai/chat-client.ts',
  lines: [31, 54],
  commit: '4b4c3b45ca7f49ac91008318ce5b8493b58abaef',
  code: [
    "export async function generateSimpleCompletion(",
    "  messages: ChatMessage[],",
    "  options: CompletionOptions = {}",
    "): Promise<string> {",
    "  const apiKey = process.env.OPENROUTER_API_KEY;",
    "  if (!apiKey) {",
    "    throw new Error(\"Missing OPENROUTER_API_KEY environment variable\");",
    "  }",
    "",
    "  const response = await fetch(OPENROUTER_URL, {",
    "    method: \"POST\",",
    "    headers: {",
    "      Authorization: `Bearer ${apiKey}`,",
    "      \"Content-Type\": \"application/json\",",
    "      \"HTTP-Referer\": process.env.NEXT_PUBLIC_APP_URL ?? \"http://localhost:3000\",",
    "      \"X-Title\": \"Crew Advisors\",",
    "    },",
    "    body: JSON.stringify({",
    "      model: options.model ?? DEFAULT_MODEL,",
    "      messages,",
    "      temperature: options.temperature ?? 0.7,",
    "      max_tokens: options.maxTokens ?? 1024,",
    "    }),",
    "  });",
  ].join('\n'),
  becomes: 'an advisor reply in Crew Advisors',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default serviceAi;
