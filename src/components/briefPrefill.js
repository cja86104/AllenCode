// @ts-check
import { templates } from '../data/templates.js';
import { capIdea } from '../scenes/sketchBlocks.js';

/**
 * How the brief starts from the address: `?idea=<line>` (from "Type your idea") is its first line,
 * then `?template=<id>` (from the Templates page) names the template it asks about and picks the
 * template project type. Unknown templates and empty ideas add nothing.
 *
 * @param {string | null} templateId
 * @param {string | null} idea
 * @returns {import('./ContactForm.jsx').Prefill}
 */
export function briefPrefill(templateId, idea) {
  const template = templates.find((t) => t.id === templateId);
  const line = capIdea(idea ?? '');
  const lines = [line, template ? `I'd like to talk about the ${template.name} template.` : ''].filter(Boolean);
  return {
    projectType: template ? 'Website from a template' : undefined,
    message: lines.join('\n\n'),
  };
}
