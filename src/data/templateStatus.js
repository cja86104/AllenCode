// @ts-check
// What a template's status means on the page: the line under its name, and the text alternative for its
// loop. A `concept` is a stand-in for an idea; a `ready` template is built (templates/<id>) and its loop is
// filmed from it.

/** @typedef {{ name: string, category: string, status: string }} TemplateLike */

/**
 * The line shown under a template's name, or null when there is nothing to say.
 * @param {TemplateLike} template
 */
export function templateStatusLabel(template) {
  if (template.status === 'concept') return 'Concept preview, coming soon';
  if (template.status === 'ready') return 'Ready to build';
  return null;
}

/**
 * The text alternative for a template's loop and poster.
 * @param {TemplateLike} template
 */
export function templateLoopAlt(template) {
  const title = template.name.split(' — ')[0];
  const kind = template.category.toLowerCase();
  return template.status === 'concept' ? `${title}, a concept preview of the ${kind} template` : `${title}, a preview of the ${kind} template`;
}
