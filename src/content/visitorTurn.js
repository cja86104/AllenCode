// @ts-check

/**
 * Words for the visitor's turn (spec section 4, steps 8 and 9): type your idea, then the close with
 * the project brief. Chris reviews this copy at the Phase 6 stop; it lives here so it can be edited
 * in one place.
 */

export const IDEA_CHAPTER = Object.freeze({
  eyebrow: 'Your turn',
  title: 'Type your idea in one line.',
  body: 'A booking site for a bakery. A memorial page for a grandmother. A dashboard for a road crew. Type yours into the file below and watch the words turn into a rough sketch of it.',
  note: 'This is a quick sketch, not the finished thing. The real one starts with a conversation.',
  label: 'Your idea',
  placeholder: 'A booking site for my bakery',
  submit: 'Sketch it',
  empty: 'Type a few words first.',
  file: 'your-idea.txt',
  typeHere: 'click and type',
  demoNote: 'example: click to type yours',
  sketchCaption: 'Sketch of your idea',
  waiting: 'Your sketch shows up here.',
  carried: 'That line is now the first line of your brief.',
  carriedLink: 'Finish the brief',
});

export const BRIEF_CHAPTER = Object.freeze({
  eyebrow: 'The brief',
  title: 'Now it’s your file.',
  file: 'your-project.md',
  a: Object.freeze({
    body: 'Tell me what you’re building. I read every message myself and reply within one business day.',
    action: 'Start your project',
  }),
  b: Object.freeze({
    body: 'Pick a design to start from, or tell me about your site here and I’ll take it from there.',
    action: 'Browse templates',
  }),
});
