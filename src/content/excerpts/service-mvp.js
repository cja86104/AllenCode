// @ts-check

/**
 * Source for the mvp service chapter: the UnderFire AI landing hero, which lands as the live page it
 * renders (badge, headline and pitch, word for word).
 * @type {import('./index.js').Excerpt}
 */
const serviceMvp = {
  id: 'service-mvp',
  file: 'page.tsx',
  repo: 'cja86104/underfireai',
  path: 'app/page.tsx',
  lines: [334, 352],
  commit: 'bee33d286dd020011ca90409dafc374927247353',
  code: [
    "              <div className=\"inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8\">",
    "                <div className=\"w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse\" />",
    "                <span className=\"text-base text-[#a1a1aa] font-medium\">AI-powered interview coaching</span>",
    "              </div>",
    "",
    "              <h1 className=\"text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-7\">",
    "                <span className=\"text-[#fafafa]\">Master Your Interviews</span>",
    "                <br />",
    "                <span className=\"bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent\">",
    "                  WE PUT YOU<br className=\"hidden sm:block\" />{' '}UNDER FIRE<br className=\"hidden sm:block\" />{' '}FIRST",
    "                </span>",
    "              </h1>",
    "",
    "              <p className=\"text-xl lg:text-2xl text-[#a1a1aa] leading-relaxed max-w-xl mb-8\">",
    "                Practice with AI interviewers who have{' '}",
    "                <strong className=\"text-[#fafafa]\">hidden personalities</strong> you must discover.",
    "                Get <strong className=\"text-[#fafafa]\">real-time STAR analysis</strong>, brutally honest feedback,",
    "                and track your improvement over time.",
    "              </p>",
  ].join('\n'),
  becomes: 'the UnderFire AI landing page it renders',
  approved: null,
};

export default serviceMvp;
