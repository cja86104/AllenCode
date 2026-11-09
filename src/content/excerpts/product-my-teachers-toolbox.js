// @ts-check

/**
 * Source for the My Teachers Toolbox product chapter: the home page hero it renders, headline word for word.
 * @type {import('./index.js').Excerpt}
 */
const productMyTeachersToolbox = {
  id: 'product-my-teachers-toolbox',
  file: 'teachers-toolbox.tsx',
  repo: 'cja86104/My-Teachers-Toolbox',
  path: 'app/_landing/Hero.tsx',
  lines: [58, 86],
  commit: 'e9bc8fc267cbbd6ffe4d0355df81a5c58921893c',
  code: [
    "          <motion.p",
    "            initial={{ opacity: 0, x: -18 }}",
    "            animate={{ opacity: 1, x: 0 }}",
    "            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}",
    "            className=\"wide-kern flex items-center gap-3 text-[11px] font-semibold uppercase text-sky-400\"",
    "          >",
    "            <span className=\"h-px w-8 bg-sky-500/70\" />",
    "            For the teachers who never stop",
    "          </motion.p>",
    "",
    "          <motion.h1",
    "            initial={{ opacity: 0, y: 34 }}",
    "            animate={{ opacity: 1, y: 0 }}",
    "            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}",
    "            className=\"font-display mt-7 text-[42px] leading-[0.98] text-white sm:text-[56px] lg:text-[68px] xl:text-[76px]\"",
    "          >",
    "            You didn&apos;t become a teacher",
    "            <span className=\"block text-slate-400\">to make worksheets at midnight.</span>",
    "          </motion.h1>",
    "",
    "          <motion.p",
    "            initial={{ opacity: 0, y: 24 }}",
    "            animate={{ opacity: 1, y: 0 }}",
    "            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}",
    "            className=\"mt-8 max-w-[36ch] text-[17px] leading-relaxed text-slate-300 sm:text-[18px]\"",
    "          >",
    "            AI tools built for K–5 classrooms. Plans, worksheets, parent emails — handled in",
    "            seconds.",
    "          </motion.p>",
  ].join('\n'),
  becomes: 'the My Teachers Toolbox home page it renders',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default productMyTeachersToolbox;
