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
      'A suite of AI-assisted planning, worksheet, and report-writing tools built for elementary teachers drowning in admin work.',
    problem:
      'K-5 teachers spend 7–10 unpaid hours a week on lesson prep, differentiated worksheets, and report comments — work that AI could compress into minutes, but existing tools were built for generic "content creation," not the classroom.',
    solution:
      'A focused toolbox built by a developer whose wife has 20+ years of K-5 classroom experience: standards-aligned lesson generators, instant worksheet differentiation by reading level, and report-comment writers trained on real teacher voice — wrapped in an interface simple enough to use during a five-minute prep period.',
    stack: [
      'Next.js 15', 'React 19', 'TypeScript', 'Supabase', 'PostgreSQL',
      'Stripe', 'Tailwind CSS', 'DeepSeek', 'OpenAI Embeddings',
      'jsPDF', 'pdf-lib', 'docx', 'Zod', 'Sentry', 'Vercel',
    ],
    results: [
      { label: 'Avg. weekly time saved', value: '6.5 hrs' },
      { label: 'Uptime', value: '99.98%' },
      { label: 'Grade levels covered', value: 'K–5' },
    ],
    image: '/images/products/product-my-teachers-toolbox.svg',

    // ── Expanded showcase content ──────────────────────────────────────────────
    stats: [
      { number: '81K+', label: 'Lines of Code' },
      { number: '99', label: 'API Routes' },
      { number: '71', label: 'Components' },
      { number: '12', label: 'Emergency Sections' },
      { number: '5', label: 'AI Systems' },
      { number: '15', label: 'Dashboard Modules' },
    ],
    overview: [
      'My wife Criste has been teaching K-5 for over twenty years. Every morning she juggled five different apps, three browser tabs, and a paper binder just to plan one day of instruction. When she woke up sick at 5am, creating substitute plans meant an hour of frantic typing before the school day started. The tools available were designed for administrators, priced for districts, or built by people who\'d never stood in front of a classroom.',
      'So I built her one. Not a prototype — a real platform. AI-powered lesson plans in 90 seconds. Emergency sub plans ready before the bus arrives. Parent communication templates, standards alignment, behavior management tools, and an entire emergency toolkit with 12 categories of solutions for everything that can go wrong in a school day. She uses it every single day — not because she has to, but because it actually saves her time.',
    ],
    features: [
      {
        icon: '🧠',
        name: 'AI Week Planner',
        desc: 'Complete weekly lesson plans in 90 seconds. Enter your grade level, subjects, standards targets, and any special notes — the AI generates a full 5-day plan across all subjects with objectives, materials lists, differentiation strategies, and classroom management tips. Custom-engineered prompts (176 lines) ensure K-5 specificity rather than generic lesson content. Plans are standards-aligned by default and can be refined section-by-section with the inline refinement toolbar. Save plans to your library, duplicate and modify for the following week, or export directly to PDF and DOCX.',
        tags: '90-second generation · 5-day full coverage · standards-aligned · inline refinement · save, duplicate, export',
      },
      {
        icon: '🚨',
        name: 'Emergency Toolkit',
        desc: 'The most comprehensive emergency resource system built for K-5 teachers. 12 categories of solutions covering every scenario that disrupts a school day: substitute readiness, behavior intervention, safety protocols, SEL support, incident documentation, coverage coordination, parent communication, field trip logistics, assessment tools, planning pivots, timesaving shortcuts, and calming strategies. Sub plans generate in under 60 seconds — class routines, schedules, student notes, and activity instructions all in one document. Accessible from every page of the platform.',
        tags: '12 categories · sub plans in 60 seconds · behavior plans · safety protocols · always accessible',
      },
      {
        icon: '💬',
        name: 'Communication Hub',
        desc: 'Every parent-facing communication a teacher needs, built in and ready to use. The Newsletter Builder generates professional class newsletters with classroom updates, upcoming events, learning highlights, and volunteer opportunities — with tone customization between formal, warm, and casual. The Email Template Library covers 30+ scenarios: field trip reminders, behavior notices, positive updates, IEP invitations, conference scheduling, and more. A Communication Log tracks every parent interaction by student.',
        tags: 'newsletter builder · 30+ email templates · conference prep · communication log · PDF + email export',
      },
      {
        icon: '📐',
        name: 'Standards Search & Alignment',
        desc: 'A fully searchable standards library with semantic search powered by OpenAI Embeddings. Search by keyword, grade level, domain, or subject and get instant results with full standard descriptions and sub-components. Alignment tools let you attach standards directly to lesson plans and verify complete coverage across units. Coverage reporting shows standards addressed, frequency, and flagged gaps. Standards data organized by Common Core ELA and Math, NGSS Science, and Social Studies frameworks.',
        tags: 'semantic search · OpenAI Embeddings · coverage tracking · gap analysis · auto-tagging in AI plans',
      },
      {
        icon: '📋',
        name: 'Daily Runsheet',
        desc: 'Takes your weekly lesson plan and breaks it into an actionable minute-by-minute guide for each school day. The AI-generated runsheet adapts to your school\'s specific schedule blocks — specials, lunch, recess, intervention periods — and builds transitions, prep reminders, and material setup notes into the timing. Custom time blocks let you set your exact schedule. Runsheets print cleanly on a single page or display on-screen. Generated from your weekly plan automatically — no re-entering content.',
        tags: 'minute-by-minute scheduling · custom time blocks · transition reminders · prep notes · auto-generated from weekly plan',
      },
      {
        icon: '👥',
        name: 'Student Teams & Collaboration',
        desc: 'Full student roster management with grade team collaboration. Maintain a complete student list with grade level, notes, and flags. Professional-tier teachers can share resources across classrooms — send a lesson plan, activity, or document directly to another teacher on your grade team without leaving the platform. The collaboration system is designed around how actual grade teams work: asynchronous sharing, not real-time co-editing, because teachers are busy and have different prep periods.',
        tags: 'student roster management · grade team sharing · resource pooling · private notes · async collaboration',
      },
      {
        icon: '📄',
        name: 'Document Generator',
        desc: 'A complete document pipeline for classroom materials. PDF generation via jsPDF and pdf-lib handles lesson plan exports, runsheets, curriculum documents, and any structured content from the platform. DOCX generation via the docx package creates editable Word documents. The Name Label Generator produces classroom-ready printable name tags and desk labels — Avery-compatible sizes, ready to print. Curriculum document builder creates scope-and-sequence documentation formatted for professional presentation to administrators.',
        tags: 'PDF export · DOCX export · name label generator · curriculum documents · Avery-compatible label sizes',
      },
      {
        icon: '🎮',
        name: 'Activity Library',
        desc: 'A searchable database of classroom-ready activities built for K-5 instruction. Filter by subject (ELA, Math, Science, Social Studies, SEL), grade level (K through 5), activity type (whole class, small group, individual, station), time required, and materials needed. Each activity includes full instructions, differentiation suggestions, and implementation notes. A ratings system lets you mark favorites and rate after use. The AI Activity Generator creates custom activities on demand. Activities integrate directly into lesson plans.',
        tags: 'multi-filter search · subject · grade · type · time · ratings system · AI activity generation · plan integration',
      },
      {
        icon: '⚡',
        name: 'Timesavers',
        desc: 'The small tasks that steal hours from a teacher\'s week — automated. Automated reminders surface upcoming deadlines, parent communication follow-ups, and curriculum coverage gaps before they become problems. Batch documentation tools handle repetitive paperwork: generate multiple parent updates at once, process a full week of reflection notes in one session, or create a complete set of conference summaries from short bullet-point input. The Quick Wins section surfaces actions that take under two minutes but have high impact.',
        tags: 'automated reminders · batch documentation · quick wins panel · tech tutorials · coverage gap alerts',
      },
    ],
    architecture: [
      {
        label: 'Frontend',
        content: 'Next.js 15 App Router with React 19 Server Components. 71 components across 16 module directories — planner, communication, documents, emergency, standards, activities, AI, and more. Component library built on Radix UI with Tailwind CSS. Sonner for toast notifications. Lucide Icons throughout. Full responsive design for tablet and desktop.',
      },
      {
        label: 'Backend & Database',
        content: '99 API routes handling lesson generation, communication, document creation, export, Stripe billing, user management, standards search, and the complete emergency toolkit. Supabase PostgreSQL with tables for profiles, lesson plans, activities, standards, favorites, API usage tracking, and billing. Row Level Security on all tables for multi-tenant data isolation.',
      },
      {
        label: 'AI Layer',
        content: 'DeepSeek integration with 5 custom prompt systems — lesson generation, week planning, newsletter writing, runsheet creation, and reflection coaching. Each prompt is purpose-engineered for K-5 specificity, not generic education. OpenAI Embeddings power semantic standards search. Caching layer reduces AI API costs on repeated similar requests. AI usage tracked per user account for rate limiting on free tier.',
      },
      {
        label: 'Export & Documents',
        content: 'PDF generation via jsPDF and pdf-lib. DOCX generation via the docx package. Lesson plan exporter with formatting, layout options, and page break control. Name label generator with Avery-compatible label templates. Curriculum document builder with professional formatting for administration presentation. All exports handle multi-page documents with proper headers, footers, and page numbering.',
      },
      {
        label: 'Payments & Subscriptions',
        content: 'Stripe integration with full subscription lifecycle management. Two tiers: Essential ($19.99/mo) and Professional ($29.99/mo). Checkout flow, customer portal for self-service upgrades/downgrades, and webhook handling for subscription state changes. Free trial period with plan feature enforcement via subscription status checks on every protected route.',
      },
      {
        label: 'Monitoring & Infrastructure',
        content: 'Vercel deployment with edge functions for performance. Sentry error tracking with source maps for production debugging. Vercel Analytics for usage patterns and page performance. Zod validation on all API inputs. SEO-optimized blog with 3 published content articles, dynamic routing, sitemap.xml, and robots.txt. Middleware for auth verification on all protected routes.',
      },
    ],
    security: [
      { title: 'Row Level Security', desc: 'All database tables enforce RLS. Teachers only access their own students, plans, and data.' },
      { title: 'Auth Middleware', desc: 'Supabase Auth with session verification on every protected route. No unauthenticated API access.' },
      { title: 'Webhook Verification', desc: 'All Stripe events verified with signing secret before processing subscription changes.' },
      { title: 'Input Validation', desc: 'All API inputs validated with Zod schemas. Malformed requests rejected at the API layer.' },
      { title: 'AI Context Isolation', desc: 'No student or teacher data persists in AI model context between sessions.' },
      { title: 'Error Monitoring', desc: 'Sentry captures all production errors with source maps. No sensitive data in error payloads.' },
    ],
    pricing: {
      model: 'subscription',
      tiers: [
        {
          tier: 'Essential',
          price: '$19.99',
          period: '/mo',
          featured: false,
          features: [
            'Up to 20 AI lesson plans/month',
            'Full Emergency Toolkit access',
            'Standards search & alignment',
            'Newsletter & email builder',
            'PDF exports',
            'Tech tutorials library',
          ],
        },
        {
          tier: 'Professional',
          price: '$29.99',
          period: '/mo',
          featured: true,
          features: [
            'Unlimited AI lesson plans',
            'Everything in Essential, plus:',
            'Grade team resource sharing',
            'Student team collaboration',
            'Downloadable materials generation',
            'AI Activity Library',
            'Conference prep tools',
            'Priority support',
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
    image: '/images/products/product-underfire-ai.svg',
    video: '/UnderFireAI.mp4',
    showcaseImage: '/meet-underfire.png',

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
    image: '/images/products/product-founders-helm.svg',

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
    image: '/images/products/product-crew-advisors.svg',

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
