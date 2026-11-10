// @ts-check
export const products = [
  // ─── My Teachers Toolbox ────────────────────────────────────────────────────
  {
    slug: 'my-teachers-toolbox',
    name: 'My Teachers Toolbox',
    url: 'https://myteacherstoolbox.com',
    tagline: 'AI tools for K-5 teachers, built in real classrooms.',
    status: 'live',
    category: 'EdTech SaaS',
    summary:
      'A production planning, communication, and emergency-response platform for elementary teachers — AI week plans, sub bundles in under a minute, live standards search for all 50 states, and a parent portal, on one subscription.',
    problem:
      'K-5 teachers lose 7–10 unpaid hours a week to lesson prep, sub plans, standards paperwork, and parent communication. The tools that exist are priced for districts, designed for administrators, or generic "content generators" that have never met a five-minute prep period — and none of them help at 5am when a teacher wakes up sick and still owes a substitute a full day of plans.',
    solution:
      'One platform, built by a developer whose wife has taught K-5 for twenty years and who uses it every day. A full week of standards-aligned plans generates in about ninety seconds, streamed so she watches it build. An emergency sub bundle — routines, schedule, student notes, activities — comes out in under a minute. Standards search runs live against the actual framework for whichever of the 50 states she teaches in, not a generic Common Core dump. Parents get a read-only class portal with no account to create. And anyone can walk the entire product without signing up, through a fenced public demo.',
    stack: [
      'Next.js 15', 'React 19', 'TypeScript 5.7', 'Supabase', 'PostgreSQL',
      'Row Level Security', 'Stripe v17', 'Tailwind CSS', 'Radix UI',
      'Framer Motion', 'OpenRouter', 'DeepSeek V3', 'Perplexity Sonar Pro',
      'OpenAI Embeddings', 'Groq Whisper', 'jsPDF', 'pdf-lib', 'docx',
      'mammoth', 'Zod', 'Vitest', 'Google Drive API', 'Vercel', 'Node 22',
    ],
    results: [
      { label: 'Avg. weekly time saved', value: '6.5 hrs' },
      { label: 'State standards frameworks', value: '50' },
      { label: 'Grade levels covered', value: 'K–5' },
    ],
    image: '/images/products/product-my-teachers-toolbox.jpg',
    // Real-screen loop and its poster (tools/media): the home chapter, the products grid and the showcase hero.
    previewVideo: '/media/products/my-teachers-toolbox.mp4',
    poster: '/media/products/my-teachers-toolbox.jpg',
    // 4:3 source — the detail hero renders at 4:3 so the logo and the desk
    // shot below it survive; every other product stays on the 16:10 default.
    heroAspect: '4/3',

    // ── Expanded showcase content ──────────────────────────────────────────────
    stats: [
      { number: '78K+', label: 'Lines of TypeScript' },
      { number: '105', label: 'API Routes' },
      { number: '68', label: 'Database Tables' },
      { number: '41', label: 'Dashboard Screens' },
      { number: '50', label: 'States Covered' },
      { number: '10', label: 'Emergency Categories' },
    ],
    overview: [
      'My wife Criste has taught K-5 for over twenty years. Every morning she juggled five apps, three browser tabs, and a paper binder just to plan one day of instruction. When she woke up sick at 5am, writing substitute plans meant an hour of frantic typing before the first bus. The tools on the market were priced for districts, designed for administrators, or built by people who had never stood in front of twenty-four seven-year-olds.',
      'So I built her one — and then I kept building. It is now 105 API routes and 68 database tables behind a 41-screen workspace: AI week plans in about ninety seconds, an emergency toolkit covering the ten categories of things that actually go wrong in a school day, standards search that queries the real framework for any of the 50 states, curriculum mapping, a parent portal, Google Drive export, and a public demo anyone can walk into without signing up. She still uses it every day. That is the only feature test that has ever mattered here.',
    ],
    features: [
      {
        icon: '🧠',
        name: 'AI Week Planner',
        desc: 'A complete five-day plan across every subject in about ninety seconds. Enter grade level, subjects, standards targets and any notes, and the planner returns objectives, materials, differentiation, and management notes for each day. The prompt behind it is 194 lines of K-5-specific engineering rather than a generic education template, and generation streams over server-sent events so the teacher watches the week build instead of staring at a spinner. Any single day or single subject can be regenerated on its own without disturbing the rest of the week, and any section can be refined inline. Plans save to a library, duplicate forward for the following week, and export to PDF or DOCX.',
        tags: '~90-second full week · streamed generation · regenerate one day or one subject · inline refinement · PDF + DOCX export',
      },
      {
        icon: '🚨',
        name: 'Emergency Toolkit',
        desc: 'Ten categories covering what actually goes wrong in a school day: sub readiness, student safety and medical, coverage and schedule changes, planning triage, classroom management, assessment crunch, parent communication, SEL and student support, logistics and materials, and time savers. Thirty-nine dedicated endpoints sit behind them — sub bundles, behavior plans, incident reports, allergy cards, calming strategies, room reset checklists, supply lists, conference kits, translated parent emails. The emergency sub bundle assembles routines, schedule, student notes, and activities into one document in under a minute. Four one-tap actions are pinned at the top of the page for the moments when there is no time to browse anything.',
        tags: '10 categories · 39 endpoints · sub bundle in under a minute · incident + allergy documentation · one-tap emergency actions',
      },
      {
        icon: '📐',
        name: 'Standards Search — All 50 States',
        desc: 'Most standards tools ship a Common Core dump and call it national coverage. This one carries the real framework name and Department of Education domain for all fifty states — Texas TEKS, Virginia SOL, Alabama Course of Study, and forty-seven others — and runs each query through Perplexity Sonar Pro with live web search scoped to that state\'s own DOE domain. Results come back as current standards with codes and full descriptions, attachable straight to a lesson plan. Coverage reporting shows what has been addressed across a unit and what has been missed. Common Core and NGSS remain available for the states that use them.',
        tags: '50 state frameworks · live search scoped to each state DOE · codes + full descriptions · attach to plans · coverage gap reporting',
      },
      {
        icon: '🏫',
        name: 'Parent Portal',
        desc: 'A public, read-only class page parents reach with a short code — no account, no app, no password reset email at 9pm. The teacher posts newsletters, homework, events, and announcements from the dashboard, pins what matters, and toggles each section on or off independently. Welcome message, grade level, and theme color are configurable, and the whole portal switches off in one click at the end of the year. It closes the loop the Communication Hub opens: templates and newsletters go out, and the portal is where they live afterwards.',
        tags: 'code-based access · no parent account required · newsletters, homework, events, announcements · per-section visibility · one-click off',
      },
      {
        icon: '💬',
        name: 'Communication Hub',
        desc: 'A newsletter builder with tone control between formal, warm, and casual. A template library covering the messages teachers actually have to write — behavior notices, positive updates, field trip reminders, IEP invitations, conference scheduling. A conference prep tool that assembles talking points per student. And a communication log that records every parent interaction against the student it concerned, so the history exists when it is needed. Emergency parent emails have their own generator, including translation, for the messages that cannot wait for a good moment.',
        tags: 'newsletter builder · tone control · template library · conference prep · per-student communication log · translated parent emails',
      },
      {
        icon: '🗺️',
        name: 'Curriculum Mapping',
        desc: 'Scope and sequence above the week level. Curriculum units and year-long maps hold the long-range shape of instruction, and the week planner draws from them so daily plans and the map cannot quietly drift apart over a term. Pacing tools flag when a unit is running behind. Curriculum documents export in a format that survives being handed to an administrator without reformatting.',
        tags: 'units + year-long maps · feeds the week planner · pacing triage · administrator-ready document export',
      },
      {
        icon: '📋',
        name: 'Daily Runsheet',
        desc: 'Takes the weekly plan and breaks each day into a minute-by-minute guide that respects the school\'s real schedule — specials, lunch, recess, intervention blocks — with transitions, prep reminders, and material setup built into the timing rather than bolted on. Custom time blocks match the actual bell schedule. It is generated from the plan already written, so nothing is entered twice, and it prints cleanly on a single page for the desk.',
        tags: 'minute-by-minute · custom bell schedule · transition + prep reminders · auto-generated from the weekly plan · single-page print',
      },
      {
        icon: '👥',
        name: 'Students & Grade Teams',
        desc: 'Full roster management with per-student notes, goals, action items, and communication history. Grade teams share resources asynchronously — send a plan, activity, or document to a colleague on the grade team, with version history and threaded comments on each shared resource. Asynchronous by design, not by limitation: grade teams have different prep periods, and real-time co-editing was never the shape of that problem.',
        tags: 'roster + private notes · student goals and action items · async grade-team sharing · resource versions · threaded comments',
      },
      {
        icon: '📄',
        name: 'Documents & Google Drive',
        desc: 'PDF generation through jsPDF and pdf-lib, DOCX through the docx package, with multi-page headers, footers, and page numbering handled properly. The name label generator outputs Avery-compatible desk labels and name tags ready to print. Existing material can be read back in — mammoth for DOCX, pdf-parse for PDF — so a teacher\'s own documents can feed the tools rather than being retyped. Google Drive is wired in with full OAuth connect, callback, and disconnect, encrypted token storage, and direct save-to-Drive on anything generated.',
        tags: 'PDF + DOCX export · Avery-compatible labels · DOCX + PDF import · Google Drive OAuth · encrypted token storage',
      },
      {
        icon: '🎮',
        name: 'Activity Generator',
        desc: 'There is no preset library here — every activity is written fresh, on demand, for the class asking. Pick the grade, the subject (eight of them, from math and ELA through PE, music, and SEL/character ed), how many minutes are actually left, the grouping (individual, partner, small group, whole class, or centers), and what materials are within reach — including "none, no prep" for the days that call for it. DeepSeek V3 returns a title, step-by-step instructions, a materials list, an assessment strategy, and differentiation for both ends of the room, streamed as it writes. If it lands close but not right, refine it inline and revert to the original in one click. Save the keepers to your own collection. Nothing comes out of a canned bank, so it fits the classroom you actually have rather than the one a content library imagined.',
        tags: 'nothing preset — generated per request · 8 subjects · 10–60 minutes · 5 grouping types · materials-aware, including no-prep · inline refine + revert · save your own',
      },
      {
        icon: '🎙️',
        name: 'Reflection Coach',
        desc: 'Teachers talk their reflection instead of typing it at the end of a day that has already taken everything. Audio goes to Groq Whisper for transcription, the text is embedded with OpenAI text-embedding-3-small, and the coach reads across the whole reflection history semantically rather than only the last entry — so it surfaces the pattern the teacher has stopped noticing. Reflection insights feed professional goals, which are tracked as first-class records rather than a free-text field nobody revisits.',
        tags: 'voice-first · Groq Whisper transcription · semantic history via embeddings · pattern surfacing · linked to professional goals',
      },
    ],
    architecture: [
      {
        label: 'Frontend',
        content: 'Next.js 15 App Router with React 19 Server Components. 72 components across 17 module directories — planner, emergency, communication, documents, standards, activities, teams, analytics, notifications, onboarding, demo and more — built on Radix UI primitives with Tailwind CSS. Framer Motion for transitions, Lucide for icons. 41 dashboard screens sit behind auth, alongside a public marketing surface: landing, our story, schools, parents, and a seven-article SEO blog.',
      },
      {
        label: 'Backend & Database',
        content: '105 API routes over Supabase Postgres with 68 tables. Row Level Security on user-owned data, so a teacher can only ever read their own plans, students, and communications. Auth runs through @supabase/ssr with session refresh in middleware on every non-asset request. Per-route rate limiting is enforced by a Postgres RPC and tiered by output-token cost — heavy generation endpoints get 5 requests a minute, light ones 10 — so exhausting the planner budget never locks a teacher out of the emergency toolkit.',
      },
      {
        label: 'AI Layer',
        content: 'OpenRouter is the single gateway. DeepSeek V3 handles generation with a pinned provider order (deepseek → novita → fireworks), a hard 90-second timeout, and OpenRouter usage accounting switched on so every call logs its real dollar cost rather than an estimate. Perplexity Sonar Pro handles state standards search with live web access. OpenAI text-embedding-3-small powers semantic reflection search, and Groq Whisper handles transcription at roughly a tenth of OpenAI\'s rate. Purpose-built prompt systems for week planning, runsheets, newsletters, and reflection coaching — no shared generic template.',
      },
      {
        label: 'Export & Integrations',
        content: 'PDF through jsPDF and pdf-lib, DOCX through the docx package, with dedicated exporters for lesson plans, curriculum documents, and printable classroom resources. Inbound parsing through mammoth and pdf-parse. Google Drive integration with OAuth connect, callback and disconnect, encrypted token storage, and direct save-to-Drive. An in-app notification system with per-user records, unread counts, and mark-all-read.',
      },
      {
        label: 'Billing & Access Control',
        content: 'Stripe v17 with one product at two billing intervals — $10/month and $69/year — and no feature gating between them. A 14-day trial activates at signup without a card. Webhooks verify the Stripe signature before touching subscription state, and processed event IDs are recorded so a replay cannot double-apply. Access is checked server-side on every protected route through requireActiveSubscription, which owns a 3-day past-due grace window; the client-side check is display-only and never guards data. Tier values written by the retired two-tier model still resolve as paying customers, so no live account needed a migration.',
      },
      {
        label: 'Public Live Demo',
        content: 'The entire product is walkable without an account. Visitors are signed into one shared Supabase account behind a default-deny path allowlist in middleware: nothing is reachable unless it is on the list, so a route added anywhere in the app can never accidentally become publicly reachable. Section slugs are opaque keys resolved server-side rather than redirect targets, which removes the open-redirect class outright. Writes are refused separately from reads and return a structured demo_locked response the UI turns into a signup prompt. A nightly cron wipes demo content while preserving the rolling usage budget.',
      },
    ],
    security: [
      { title: 'Row Level Security', desc: 'RLS on user-owned tables. A teacher\'s plans, students, notes, and communications are unreachable from any other account.' },
      { title: 'Session Middleware', desc: 'Supabase auth session refreshed in middleware on every non-asset request. Protected routes verify server-side, never in the client.' },
      { title: 'Zod Request Validation', desc: 'Request bodies parsed through strict Zod schemas via a shared parseRequestBody helper — 85 of the 105 API routes carry one.' },
      { title: 'Webhook Verification', desc: 'Stripe events verified with the signing secret before any subscription write, and processed event IDs stored so replays are idempotent.' },
      { title: 'Tiered Rate Limiting', desc: 'Per-user, per-route limits enforced by a Postgres RPC and tiered by request cost. Anonymous endpoints carry their own separate budget.' },
      { title: 'Demo Default-Deny Fence', desc: 'The public demo account reaches only an explicit path allowlist. New routes are unreachable by default rather than reachable by default.' },
    ],
    pricing: {
      model: 'subscription',
      note: 'One plan, one feature set. Monthly and yearly unlock exactly the same product — the yearly option exists so teachers who do not want to pay through the summer can buy the year up front. Every account starts with a 14-day free trial, no card required.',
      tiers: [
        {
          tier: 'Full Access — Monthly',
          price: '$10',
          period: '/mo',
          featured: false,
          features: [
            'Unlimited AI lesson plans',
            'Full Emergency Toolkit access',
            'Standards search & alignment',
            'Newsletter & email builder',
            'Student team collaboration',
            'Grade team resource sharing',
            'Downloadable materials generation',
            'AI activity library',
            'Conference prep tools',
            'PDF exports',
            'Tech tutorials library',
            'Priority support',
          ],
        },
        {
          tier: 'Full Access — Yearly',
          price: '$69',
          period: '/yr',
          featured: true,
          features: [
            'Identical feature set — nothing is gated',
            'Saves $51 against twelve months of monthly',
            'Covers July and August without pausing',
            'Billed once a year',
            '14-day free trial, no card to start',
          ],
        },
      ],
    },
  },
  // ─── UnderFire AI ────────────────────────────────────────────────────────────
  {
    slug: 'underfire-ai',
    name: 'UnderFire AI',
    url: 'https://underfireai.com',
    tagline: 'Interview and salary negotiation coaching, on demand.',
    status: 'live',
    category: 'Career SaaS',
    summary:
      'A practice-under-pressure platform that simulates hostile interviewers and hard-nosed hiring managers so candidates walk in prepared, not hopeful.',
    problem:
      'Candidates lose offers and leave money on the table not from lack of skill, but from lack of reps against real pressure — mock interviews with friends are too polite and coaches are too expensive for most job seekers.',
    solution:
      'UnderFire AI runs adversarial, role-specific interview simulations with AI interviewers that have hidden personalities — discovered and adapted to in real time, exactly as you would with a real person. Includes a full salary negotiation simulator, resume vulnerability scanning, live coding challenges in 7 languages, a 3D HUD overlay, and a debrief that scores tone, hedging, and leverage.',
    stack: [
      'Next.js 15', 'React 19', 'TypeScript 5.7', 'Supabase', 'PostgreSQL',
      'Stripe SDK v17', 'Tailwind CSS', 'Radix UI', 'Framer Motion 11',
      'GSAP 3.14', 'Zustand 5', 'TanStack Query 5', 'Zod', 'Recharts',
      'React Three Fiber', 'Three.js r169', 'Cartesia Sonic 3', 'OpenRouter', 'Judge0', 'Lenis',
    ],
    results: [
      { label: 'Interviewer archetypes', value: '8' },
      { label: 'Interview types', value: '6' },
      { label: 'Time to first session', value: '<90 sec' },
    ],
    image: '/images/products/product-underfire-ai.jpg',
    // Real-screen loop and its poster (tools/media): the home chapter, the products grid and the showcase hero.
    previewVideo: '/media/products/underfire-ai.mp4',
    poster: '/media/products/underfire-ai.jpg',

    stats: [
      { number: '239', label: 'Source Files' },
      { number: '47K+', label: 'Lines of Code' },
      { number: '8', label: 'Archetypes' },
      { number: '17', label: 'DB Tables' },
      { number: '37', label: 'API Routes' },
      { number: '6', label: 'Interview Types' },
    ],
    overview: [
      'UnderFire AI is an AI-powered interview coaching platform built on a single insight: real interviews are unpredictable. Traditional prep gives you questions to rehearse. UnderFire AI gives you an AI interviewer with a hidden personality — and makes you discover and adapt to it in real time, exactly as you would with a real person across the table.',
      'Beyond mock interviews, the platform includes a full salary negotiation simulator, resume vulnerability scanning, job description gap analysis, live code execution in 7 languages, deep progress tracking, and a 3D HUD overlay built with React Three Fiber. Pricing is credit-based — one-time packs, every feature unlocked with every purchase, no subscriptions, no tiers. Production-deployed and ready to monetize immediately.',
    ],
    archetypes: [
      { name: 'The Skeptic', quote: '"Can you give me a specific example? With numbers?"', desc: 'Skepticism: 90/100. Doubts everything, demands proof. Will challenge every claim you make — and every claim you can\'t back up.', traits: 'Red flags: vague answers, buzzwords · Green flags: data, concrete outcomes' },
      { name: 'The Griller', quote: '"Let\'s go five levels deeper on that."', desc: 'Depth preference: 95/100. Follow-up tendency: 95%. Goes deep on every topic. Surface knowledge gets exposed immediately.', traits: 'Red flags: bluffing, memorized answers · Green flags: depth, honest gaps' },
      { name: 'The Friendly', quote: '"That\'s great! Tell me about the hardest part."', desc: 'Warmth: 90/100. Warm and supportive — then throws curveballs when your guard is down. 50% curveball frequency.', traits: 'Red flags: arrogance, taking all credit · Green flags: humility, team focus' },
      { name: 'The Silent Judge', quote: '"Mm-hm. Continue."', desc: 'Verbosity: 20/100. Zero feedback, zero reassurance. Poker face the entire time. Tests whether you can drive without validation.', traits: 'Red flags: need for approval, rambling · Green flags: confidence, structure' },
      { name: 'The Rapid Fire', quote: '"Good. Next — 30 seconds."', desc: 'Patience: 20/100. Curveball frequency: 70%. Fast-paced, may interrupt. Punishes long-winded answers and rewards crisp delivery.', traits: 'Red flags: rambling, slow thinking · Green flags: concise, prioritized' },
      { name: 'The Culture Fit', quote: '"Tell me about a time your team disagreed."', desc: 'Warmth: 70/100. Obsessed with team dynamics, collaboration, and conflict resolution. Follow-up tendency: 70%.', traits: 'Red flags: blame-shifting, lone wolf · Green flags: collaboration stories, humility' },
      { name: 'The Technical Expert', quote: '"Walk me through the time and space complexity."', desc: 'Technical focus: 100/100. Depth preference: 90/100. Tests architecture decisions, trade-offs, and current best practices without mercy.', traits: 'Red flags: buzzword soup, overconfidence · Green flags: nuanced reasoning' },
      { name: 'The Executive', quote: '"How does this align with the broader strategy?"', desc: 'Formality: 80/100. Big picture over tactics. Cares about business impact, leadership presence, and clear communication of outcomes.', traits: 'Red flags: narrow focus, passive attitude · Green flags: vision, strategic clarity' },
    ],
    features: [
      {
        icon: '🔥',
        name: 'AI Mock Interviews',
        desc: 'Six complete interview types: Behavioral (STAR method, 5–8 questions), Technical (system design, 80% follow-up intensity), Case Study (90% follow-up rate), HR Screen (culture fit, 6–10 questions), Panel (multiple AI interviewers simultaneously with distinct archetypes), and Phone Screen (rapid-fire first impression rounds). Six company styles: FAANG (+20 technical depth), Startup (−20 formality, +20 pace), Consulting (+30 formality, case focus), Finance, Enterprise, and Government. Difficulty 1–10 with configurable session length.',
        tags: '6 interview types · panel multi-interviewer · 6 company styles · difficulty 1–10 · configurable length',
      },
      {
        icon: '🎤',
        name: 'Voice Interview Mode',
        desc: 'Speak naturally and the AI interviewer responds via Cartesia Sonic 3 — 40ms time-to-first-audio, streaming delivery. Six selectable AI voices matched to interviewer personality: Kiefer (Skeptic, Griller), Kyle (Rapid Fire), Leo (Executive, Technical Expert), Katie (Silent Judge), Tessa (Culture Fit, Friendly), Maya (Friendly, Culture Fit). Reading answers is easy. Delivering them confidently out loud under pressure is the skill that actually closes offers.',
        tags: 'Cartesia Sonic 3 · 6 AI voices · 40ms latency · streaming · personality-matched voice suggestions',
      },
      {
        icon: '💻',
        name: 'Live Coding Interviews',
        desc: 'Real code execution via Judge0 sandboxed environment. Seven languages: JavaScript, TypeScript, Python, Java, Go, Rust, and C++. Syntax-highlighted editor with challenge description, starter code, and optional hints. Run against visible test cases, then submit for evaluation against full hidden test suite. Timer counts down. Hints system tracks usage and factors into score. Submissions evaluated on Correctness, Efficiency (time/space complexity), Code Quality, and Problem Solving approach.',
        tags: 'Judge0 sandboxed execution · 7 languages · visible + hidden tests · hints system · complexity analysis · code replay',
      },
      {
        icon: '📊',
        name: 'Real-Time STAR Scoring',
        desc: 'Every response analyzed across six dimensions with type-specific weighting. Behavioral: STAR 25%, Communication 15%. Technical: Depth 35%, STAR 5%. Case Study: STAR 0%, Depth 30%. HR: Confidence 20%, Communication 20%. Filler word detection with exact counts per response. Response time and word count tracked. Session scorecard: overall score, five category breakdowns, Strengths, Improvements, Key Moments, and an AI-generated Interviewer Impression written from the hidden personality\'s actual point of view.',
        tags: '6 dimensions · type-weighted scoring · filler word counts · coaching notes per response · interviewer impression',
      },
      {
        icon: '💰',
        name: 'Salary Negotiation Simulator',
        desc: 'A fully separate module — dedicated session management, its own API routes, and independent scoring pipeline. Enter your offer and target, then negotiate against an AI recruiter who pushes back hard and makes counter-offers. The recruiter won\'t volunteer extra budget — you have to earn it. Scored on four dimensions: Confidence, Framing, Strategy, and Composure. AI generates a Simulated Final Offer — a concrete figure showing exactly what your technique closed and what you left on the table.',
        tags: 'dedicated session module · realistic AI recruiter · 4 scoring dimensions · simulated final offer · replay',
      },
      {
        icon: '📄',
        name: 'Resume Vulnerability Scanner',
        desc: 'Upload your resume for analysis from a simulated skeptical senior interviewer. Produces an overall health score, then identifies specific vulnerabilities: vague metrics without numbers, buzzword stacking, unverifiable claims, employment gaps, scope overstatement, and technical depth concerns. For every vulnerability you get the exact probing questions an interviewer would ask, severity (high/medium/low), and copy-paste rewritten resume text — not advice like "add metrics," but actual replacement language.',
        tags: 'health score · vulnerability categories · exact probing questions · copy-paste fixes · session context injection',
      },
      {
        icon: '🎯',
        name: 'Job Description Analysis',
        desc: 'Paste any job description and get instant AI gap analysis. Skill gap breakdown between JD requirements and your resume — must-have vs. nice-to-have. Match percentage with coverage by technical skills, soft skills, experience level, and industry knowledge. Save JDs to profile. Generate practice questions specific to the job\'s requirements and your identified gaps. Run interview sessions that specifically target where you\'re exposed for the role — resume alignment context injected automatically.',
        tags: 'skill gap analysis · match percentage · saved jobs · targeted practice generation · auto-injected session context',
      },
      {
        icon: '🎭',
        name: 'Custom Interviewer Builder',
        desc: 'Build AI interviewers from scratch. Blend two archetypes with configurable mix ratios. Override all six personality trait sliders independently — directness, depth preference, warmth, patience, technical focus, skepticism — all 0–100. Set custom red flags, green flags, pet peeves, and favorite topics. Add behavioral constraints: heavy follow-ups, time pressure, compensation pushback, requires specific examples. For panel interviews, select preset panel configurations or build a fully custom panel.',
        tags: 'archetype blending with ratios · 6 trait sliders · behavioral constraints · panel presets · saved library',
      },
      {
        icon: '⏪',
        name: 'Full Interview Replay',
        desc: 'Every session recorded and available for detailed playback. Playback controls with play/pause, skip, jump, and speed (0.5×, 1×, 1.5×, 2×). Visual timeline marks strong moments, weak moments, and turning points. Stats bar shows average scores across all six dimensions. Click any message to expand per-response analysis. Code replay panel for technical interviews shows every submission. Mood evolution chart shows exactly when the interviewer warmed up, went cold, or shifted — message by message.',
        tags: 'playback controls · visual timeline · per-message expansion · code replay panel · mood evolution chart',
      },
      {
        icon: '📈',
        name: 'Progress & Badge System',
        desc: 'Track improvement with data. Dashboard shows total sessions, practice hours logged, current streak, and longest streak. Recharts-powered score trends show trajectory across all six scoring dimensions over time. Breakdowns by interview type reveal which formats need work. Badge system across four categories: Milestone (first interview, 5, 10, 25 sessions), Performance (first 80+ score, first 90+), Streak (3-day, 7-day, 30-day consistency), and Special achievements. Four badge tiers: Bronze, Silver, Gold, Platinum.',
        tags: 'streak tracking · 6-dimension score trends · type breakdowns · 4 badge categories · 4 tiers · Recharts',
      },
      {
        icon: '🔗',
        name: 'Webhook API Integration',
        desc: 'Connect UnderFire AI to any external tool with outbound webhooks. Receive real-time session.completed events with full session data: all scores, coaching feedback, strengths, improvements, and AI interviewer impression. HMAC-SHA256 signature verification on every payload. Exponential backoff retry up to 3 attempts with full delivery log history. Configure multiple endpoints per account targeting specific events. Test delivery from the UI before going live. Pipe results into Notion, Slack, Airtable, or custom analytics dashboards.',
        tags: 'session.completed events · HMAC-SHA256 · retry with backoff · delivery logging · test from UI',
      },
      {
        icon: '🌐',
        name: '3D HUD Overlay',
        desc: 'A React Three Fiber powered 3D overlay rendered live during interview sessions, built on Three.js r169. Four HUD components: MetricGauges (real-time dimension scores as 3D gauges), StarRing (STAR method completion as a 3D ring), HistoryChart (score history in three-dimensional space), and MoodIndicator (interviewer mood rendered dynamically). WebGL detection built in — checks at session start, gracefully falls back to the standard 2D layout when unavailable. Feature-flagged via NEXT_PUBLIC_ENABLE_3D_HUD.',
        tags: 'React Three Fiber · Three.js r169 · WebGL detection · graceful fallback · env feature flag · audio context',
      },
    ],
    architecture: [
      {
        label: 'Frontend',
        content: 'Next.js 15 App Router with React 19. Full component library on Radix UI with Tailwind CSS. Framer Motion 11 and GSAP 3.14 for animations. Zustand 5 for client state. TanStack Query 5 for server state. Recharts for analytics. React Three Fiber + Three.js r169 for 3D HUD — WebGL-detected with automatic 2D fallback. Lenis for smooth scroll. Sonner for toasts.',
      },
      {
        label: 'Backend & Database',
        content: 'Supabase (PostgreSQL) with SSR Auth integration. 17 database tables: interview_sessions, interview_messages, session_scores, session_interviewers, interviewers, interviewer_personality, coding_challenges, code_submissions, negotiation_sessions, user_resumes, resume_insights, job_descriptions, user_progress, interview_purchases, profiles, webhooks, webhook_deliveries. Row Level Security enforced on every table.',
      },
      {
        label: 'AI Pipeline',
        content: 'Multi-model via OpenRouter. DeepSeek (deepseek-chat) for live interviews — temperature 0.8, frequency_penalty 0.3. Mistral Small 3.1 24B for analysis — separate provider to avoid rate limit collisions, temperature 0.3. Claude Haiku as fallback for complex reasoning. Cartesia Sonic 3 for TTS with 6 voice options. Full backstory generator, mood engine (−100 to +100), and response sanitizer running per session.',
      },
      {
        label: 'Payments & API',
        content: 'Stripe SDK v17 with checkout, customer portal, and webhook lifecycle. Credit-based pricing: Starter Pack ($25 / 6 credits), Pro Pack ($35 / 11 credits), Refill Pack ($10 / 5 credits) — all one-time, no subscriptions. 37 API routes across interview creation, session chat, STAR analysis, voice synthesis, resume upload/analysis/insights, job description parsing, code execution, negotiation sessions, progress, webhooks, and Stripe. Outbound webhook system with HMAC-SHA256 and exponential backoff retry.',
      },
    ],
    security: [
      { title: 'Row Level Security', desc: 'All 17 tables enforce RLS policies. Users can only read and write their own data. No cross-user data access possible at any level.' },
      { title: 'Auth Middleware', desc: 'Supabase SSR Auth with session verification on every protected route. Middleware runs before any page or API handler executes.' },
      { title: 'Stripe Webhook Verification', desc: 'All incoming Stripe events verified against signing secret before processing. Replay and spoofed events rejected at the gate.' },
      { title: 'HMAC Outbound Webhooks', desc: 'Every outbound webhook payload signed with HMAC-SHA256. Receiving systems can verify authenticity on their end.' },
      { title: 'Sandboxed Code Execution', desc: 'Live coding challenges run inside Judge0\'s isolated execution sandbox. No user code ever touches the application server.' },
      { title: 'Input Validation', desc: 'All API inputs validated with Zod schemas before any processing. TypeScript 5.7 enforces type safety end to end.' },
    ],
    pricing: {
      model: 'credits',
      note: 'Every purchase unlocks every feature immediately — no tiers, no feature gating, no recurring charges. Credits never expire.',
      tiers: [
        {
          tier: 'Starter Pack',
          price: '$25',
          period: ' one-time',
          perUnit: '~$4.17 per interview',
          featured: false,
          features: [
            '6 interview credits',
            'All 6 interview types',
            'Voice mode (Cartesia Sonic 3)',
            'All 8 interviewer archetypes',
            'STAR scoring & coaching',
            'Resume vulnerability scanner',
            'Salary negotiation simulator',
            'Full analytics & replay',
          ],
        },
        {
          tier: 'Pro Pack — Best Value',
          price: '$35',
          period: ' one-time',
          perUnit: '~$3.18 per interview',
          featured: true,
          features: [
            '11 interview credits',
            'All 6 interview types',
            'Voice mode (Cartesia Sonic 3)',
            'All 8 interviewer archetypes',
            'STAR scoring & coaching',
            'Resume vulnerability scanner',
            'Salary negotiation simulator',
            'Full analytics & replay',
          ],
        },
        {
          tier: 'Refill Pack',
          price: '$10',
          period: ' per refill',
          perUnit: '$2.00 per interview',
          featured: false,
          features: [
            '+5 interview credits',
            'Add credits anytime',
            'Lowest per-interview rate',
            'All features included',
          ],
        },
      ],
    },
  },

  // ─── Founders Helm ───────────────────────────────────────────────────────────
  {
    slug: 'founders-helm',
    name: 'Founders Helm',
    url: 'https://foundershelm.com',
    tagline: 'A solo founder operating system.',
    status: 'live',
    category: 'Productivity SaaS',
    summary:
      'The command center for solo operators running a company without a co-founder, ops team, or COO — ten integrated business tools under one login, one subscription, and one unified workspace.',
    problem:
      'Solo founders run finance, product, marketing, and support out of eleven disconnected tools and a mess of spreadsheets, losing hours a week to context-switching instead of building.',
    solution:
      'Founders Helm replaces the patchwork of tools most solo founders cobble together during their first year of business. CRM, landing page builder, invoicing, project management, content engine, AI business advisor, analytics dashboard, automation engine, code vault, and a SaaS metrics command center — all production-grade, all under one workspace.',
    stack: [
      'Next.js 16', 'React 19', 'TypeScript 5.7', 'Supabase', 'PostgreSQL',
      'Stripe', 'OpenRouter', 'DeepSeek', 'Radix UI', 'Tailwind CSS',
      'shadcn/ui', 'Tiptap', 'Recharts', 'Zustand', 'React Query',
      'React Hook Form', 'Zod', 'Vercel', 'Resend',
    ],
    results: [
      { label: 'Integrated tools', value: '10' },
      { label: 'Weekly admin time saved', value: '4+ hrs' },
      { label: 'TypeScript errors', value: '0' },
    ],
    image: '/images/products/product-founders-helm.jpg',
    // Real-screen loop and its poster (tools/media): the home chapter, the products grid and the showcase hero.
    previewVideo: '/media/products/founders-helm.mp4',
    poster: '/media/products/founders-helm.jpg',

    stats: [
      { number: '10', label: 'Integrated Tools' },
      { number: '55+', label: 'API Routes' },
      { number: '40+', label: 'Database Tables' },
      { number: '0', label: 'TypeScript Errors' },
      { number: '100%', label: 'RLS Coverage' },
    ],
    overview: [
      'Founders Helm is a full-stack SaaS application that replaces the patchwork of tools most solo founders and small teams cobble together during their first year of business. Instead of paying separately for a CRM, a landing page builder, an invoicing tool, a project manager, a content engine, a feedback system, an analytics dashboard, a code vault, an AI advisor, and an automation engine — this platform puts all ten under one login, one subscription, and one unified workspace.',
      'Every feature is production-grade. There are no placeholder components, no mock data, no half-built modules waiting to be finished someday. The authentication system supports email/password and OAuth with full session management. The billing integration handles subscriptions, one-time lifetime purchases, and self-service portal access through Stripe. The database layer enforces Row Level Security across every single table. The workspace system supports multi-tenant operations with role-based access control at four levels: owner, admin, editor, and viewer.',
      'This is not a template or a boilerplate. It\'s a deployed, working application that a buyer could rebrand, reconfigure, and begin selling to their own audience within days — or run as-is under the existing Founders Helm brand.',
    ],
    modules: [
      { icon: '⊞', name: 'CRM & Contacts', desc: 'Full contact management with tags, source tracking, status lifecycle, and a deal pipeline with customizable stages. Includes duplicate email detection, contact notes, and export functionality. Every contact is workspace-scoped with role-based edit permissions.', featureList: 'contacts · deals · pipeline stages · tags · notes · CSV export' },
      { icon: '◈', name: 'Landing Page Builder', desc: 'A no-code page builder with section-based layouts, theme customization, custom CSS injection, and publishable slugs. Pages are served at public URLs with built-in analytics tracking and a lead capture system that prevents duplicate submissions within a one-hour window.', featureList: 'visual editor · themes · custom CSS · lead capture · analytics · public URLs' },
      { icon: '✦', name: 'Content Engine', desc: 'Write, generate, and manage content posts and articles with a rich text editor powered by Tiptap. Integrated AI generation through OpenRouter supports multiple modes — generate from scratch, improve existing drafts, or brainstorm ideas — with platform-specific formatting for social and long-form content.', featureList: 'Tiptap editor · AI generation · multi-platform · drafts · scheduling' },
      { icon: '◆', name: 'Invoicing', desc: 'Create and send professional invoices with line items, tax calculations, and auto-generated invoice numbers via a database function. Public invoice views are accessible via secure token links, with automatic status tracking from sent to viewed to paid. Supports PDF generation for download.', featureList: 'line items · tax calc · public links · status tracking · PDF export' },
      { icon: '⊡', name: 'Project Management', desc: 'Organize work into projects with tasks, assignees, priorities, and due dates. Includes time tracking with start/stop entries and a complete time log per task. Role-based permissions ensure viewers can see progress without accidentally modifying deliverables.', featureList: 'projects · tasks · time tracking · assignees · priorities · due dates' },
      { icon: '◇', name: 'Code & Prompt Vault', desc: 'A personal library for storing reusable code snippets, prompt templates, and reference material organized into collections. Supports syntax highlighting, search, and quick-copy workflows. Designed for founders who constantly context-switch between tools and need a reliable place to keep the things that work.', featureList: 'collections · snippets · prompts · syntax highlighting · search · quick copy' },
      { icon: '✧', name: 'AI Business Advisor', desc: 'An AI-powered conversational advisor built on DeepSeek via OpenRouter. Maintains full conversation history with persistent storage, extracts follow-up questions and action items from each response, and tracks token usage per workspace. Conversations are scoped to the workspace so team members share context.', featureList: 'conversation history · action items · follow-ups · token tracking' },
      { icon: '◉', name: 'Analytics Dashboard', desc: 'Privacy-first analytics that track page views, unique visitors, referral sources, and user behavior without relying on third-party scripts. The collection endpoint is excluded from auth middleware for performance, and the dashboard renders charts via Recharts with filterable date ranges and comparison views.', featureList: 'page views · referrals · Recharts · date filtering · privacy-first' },
      { icon: '⚡', name: 'Automation Engine', desc: 'A workflow automation system supporting scheduled triggers via a daily cron job and external webhook triggers with IP allowlisting and HMAC signature verification using constant-time comparison. Automations create run records with full trigger data, and the webhook endpoint strips sensitive headers before logging.', featureList: 'cron scheduling · webhooks · HMAC auth · IP allowlisting · run logs' },
      { icon: '⊘', name: 'Feedback & Command Center', desc: 'An embeddable feedback widget system that accepts anonymous submissions from external sites, paired with a SaaS metrics command center that tracks customers, subscriptions, MRR, and churn. The command center syncs from Stripe webhook events so metrics stay current without manual reconciliation.', featureList: 'embeddable widgets · anonymous submissions · MRR · churn · Stripe sync' },
    ],
    architecture: [
      {
        label: 'Frontend',
        content: 'Next.js 16 with App Router, React 19, and TypeScript 5.7. UI components built on Radix UI primitives with Tailwind CSS and shadcn/ui patterns. Rich text editing via Tiptap. Data visualization through Recharts. State management with Zustand for global state and TanStack React Query for server state. Form handling via React Hook Form with Zod runtime validation.',
      },
      {
        label: 'Backend & Database',
        content: 'Supabase (PostgreSQL) with Row Level Security enforced on every table. Three client patterns: browser client, server client, and admin client (for webhooks and cron). 40+ tables with comprehensive migration files. Auto-generated TypeScript types from the database schema ensure type safety from API to UI. All queries go through the Supabase client with RLS — no raw SQL exposed to the frontend.',
      },
      {
        label: 'Billing & Payments',
        content: 'Stripe integration with webhook signature verification. Supports three pricing tiers: Pro Monthly, Pro Yearly, and Lifetime (one-time payment). Webhook handler processes checkout completions, subscription changes, and invoice events. Lifetime subscribers are explicitly protected from accidental downgrade. Customer portal access for self-service management.',
      },
      {
        label: 'AI Integration',
        content: 'OpenRouter with DeepSeek models for the business advisor and content generation engine. The advisor maintains persistent conversation history and extracts structured data (action items, follow-up questions, suggestions) from each response. The content engine supports generate, improve, and ideation modes with platform-specific formatting. Token usage is tracked per workspace.',
      },
      {
        label: 'Auth & Permissions',
        content: 'Supabase Auth with email/password and OAuth support. Session refresh handled through middleware on every request. Four-tier role system: owner, admin, editor, viewer — each with granular permissions for create, update, and delete operations. Open redirect protection on both login forms and OAuth callback. API keys hashed with SHA-256, full key shown only once on creation.',
      },
      {
        label: 'Deployment',
        content: 'Deployed on Vercel with edge functions. Daily cron job for automation scheduling protected by bearer token. Security headers configured in next.config: X-Frame-Options DENY, HSTS with 1-year max-age, strict referrer policy, permissions policy blocking camera/mic/geo. Turbopack enabled for development.',
      },
    ],
    security: [
      { title: 'Row Level Security on Every Table', desc: 'All 40+ database tables enforce RLS policies. Users can only access data within their workspace, and write operations are gated by role.' },
      { title: 'Consistent API Authentication', desc: 'Every API route follows the same pattern: verify session, extract workspace ID, confirm membership, check role permissions. No route skips a step.' },
      { title: 'Stripe Webhook Signature Verification', desc: 'All Stripe events are verified using constructEvent() with the webhook signing secret. Explicitly protects lifetime subscribers from being downgraded by stale events.' },
      { title: 'HMAC Webhook Authentication', desc: 'External webhook endpoints verify payloads using HMAC-SHA256 signatures with timingSafeEqual for constant-time comparison. IP allowlisting adds a second layer of validation.' },
      { title: 'Open Redirect Protection', desc: 'Both the login form and OAuth callback validate redirect URLs, rejecting any path that doesn\'t start with a single forward slash. Protocol-relative URLs are explicitly blocked.' },
      { title: 'Hashed API Keys', desc: 'API keys are generated as 32-byte random hex strings, stored as SHA-256 hashes, and the full key is returned exactly once on creation. Only owners and admins can create or revoke keys.' },
      { title: 'Security Headers', desc: 'X-Frame-Options DENY, X-Content-Type-Options nosniff, HSTS with 1-year max-age and includeSubDomains, strict-origin-when-cross-origin referrer policy, and permissions policy blocking camera, microphone, and geolocation.' },
      { title: 'Audit Trail & Data Export', desc: 'Security-relevant actions are logged to the audit_logs table. Data export is restricted to owners and admins and supports JSON/CSV formats. Export events are themselves audited with record counts.' },
    ],
    pricing: {
      model: 'subscription',
      tiers: [
        {
          tier: 'Pro Monthly',
          price: '$29',
          period: '/mo',
          featured: false,
          features: [
            'All 10 integrated tools',
            'Unlimited workspaces',
            'Up to 5 team members',
            'AI Business Advisor',
            'Full billing integration',
            'Priority support',
          ],
        },
        {
          tier: 'Lifetime',
          price: '$299',
          period: ' one-time',
          featured: true,
          features: [
            'Everything in Pro Monthly',
            'One-time payment — own it forever',
            'No recurring charges',
            'All future updates included',
            'Lifetime priority support',
          ],
        },
      ],
    },
  },

  // ─── Crew Advisors ───────────────────────────────────────────────────────────
  {
    slug: 'crew-advisors',
    name: 'Crew Advisors',
    url: null,
    tagline: 'Your AI advisory board. Advisors who remember everything.',
    status: 'coming-soon',
    category: 'AI SaaS',
    summary:
      'A full AI advisory board platform — expert personas with deep domain knowledge who remember your business, your decisions, and your goals across every single conversation.',
    problem:
      'Generic AI chatbots don\'t know your business, forget everything between sessions, and aren\'t built for the specific domain expertise you actually need. You get the same surface-level answers whether you\'re asking about SaaS pricing strategy or restaurant kitchen operations.',
    solution:
      'Crew Advisors gives you a full advisory board of expert AI personas — each with a distinct specialty, a distinct point of view, and persistent memory of your business. Launch with a deep library of ready-to-go advisors or build any advisor you need for your specific domain. Your board. Your rules. Advisors who remember everything.',
    stack: [
      'Next.js', 'TypeScript', 'Supabase', 'PostgreSQL',
      'OpenRouter', 'DeepSeek', 'Tailwind CSS', 'Stripe', 'Vercel',
    ],
    results: [
      { label: 'Launch library', value: '7+ advisors' },
      { label: 'Memory', value: 'Cross-session' },
      { label: 'Status', value: 'Launching soon' },
    ],
    image: '/images/products/product-crew-advisors.jpg',

    overview: [
      'Crew Advisors is not another generic AI chatbot. It\'s a full advisory board of expert personas who remember your business, your decisions, and your goals across every single conversation — so you never have to re-explain context.',
      'Launch with a deep library of ready-to-go advisors across sales, marketing, finance, operations, M&A, copy, and PR. Then build any custom advisor you need for your specific domain — a no-nonsense restaurant operations consultant, a real estate investor who specializes in short-term rentals, a DTC brand strategist who lives in the Shopify ecosystem, a healthcare compliance advisor who speaks plain English. Your board. Your rules.',
    ],
    features: [
      {
        icon: '🧑‍💼',
        name: 'Expert Advisor Library',
        desc: 'Launch with a curated roster of battle-tested AI advisors: Marcus Webb (SaaS Sales Strategist who will challenge every deal in your pipeline), Jordan Reeves (GTM Marketing Strategist who shuts down vanity metrics on sight), Ray Callahan (M&A Advisor who\'s brokered 28 SaaS acquisitions and knows exactly what buyers actually care about), Sam Okafor (Financial Analyst who builds the unit economics models that get you funded), Alex Torres (Operations Manager who turns chaos into documented, repeatable systems), Dana Kline (Conversion Copywriter behind $40M in attributed revenue), and Morgan Ellis (PR Strategist who has placed stories in TechCrunch, Forbes, and Fast Company).',
        tags: '7+ launch advisors · sales · marketing · M&A · finance · ops · copy · PR',
      },
      {
        icon: '🔨',
        name: 'Custom Advisor Builder',
        desc: 'Not limited to the library. Build any advisor you need: a no-nonsense restaurant operations consultant who\'s run 50-seat kitchens, a real estate investor who specializes in short-term rental markets, a DTC brand strategist who lives in the Shopify ecosystem, a healthcare compliance advisor who speaks plain English, a negotiation coach for freelancers and consultants closing $10K+ contracts, a product designer who thinks like your customer, a grant writing advisor who knows exactly what foundations want to see.',
        tags: 'any domain · any specialty · any point of view · built in minutes',
      },
      {
        icon: '🧠',
        name: 'Persistent Cross-Session Memory',
        desc: 'Every advisor remembers your business, your decisions, your goals, and your past conversations — across every session. When Marcus asks "Have you followed up with that enterprise lead we discussed?", he actually remembers the lead. No re-explaining context. No starting from scratch. The advisory relationship compounds over time exactly the way a real advisor relationship does.',
        tags: 'cross-session memory · business context · decision history · goal tracking',
      },
      {
        icon: '🎯',
        name: 'Domain-Specific Expertise',
        desc: 'Each advisor is built with deep, specific domain knowledge — not a generic "business expert" persona. Marcus Webb knows the SaaS sales cycle, deal stages, and objection handling. Ray Callahan knows SaaS multiples, due diligence, and what makes a buyer walk away. Sam Okafor builds real unit economics models and knows how investors read a P&L. The expertise is specific enough to be useful.',
        tags: 'deep domain knowledge · specific expertise · opinionated advice · real perspective',
      },
    ],
  },
];
