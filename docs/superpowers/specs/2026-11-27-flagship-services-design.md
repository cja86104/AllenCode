# Flagship services: Immersive Web Experiences and Intelligent AI Systems — design

Date: 2026-11-27. Site-wide (data, pages, both home experiences); kept apart from the 2D-only Living
Source docs. Supersedes Tasks 3.1–3.4 of `docs/superpowers/plans/2026-11-26-truth-pass-rail-jumps-3d-service.md`
(the 3D service, now named here); that plan's case-study page (Tasks 3.5–3.8) stands.

Chris (2026-11-27): "before you start building this the new services have not been added. the 3d
websites and the ai personall assistant … those have to be added to this new version." He supplied the
names, taglines and scopes below, and chose: both lead as flagships; their cards say terms are set per
project ("the prices very with service as well as down payment"); the AI chapter's code and screen come
from his agent build pipeline.

## The two services (Chris's words, verbatim)

**Immersive Web Experiences** — tagline "Beyond websites. Into experiences."
Summary: "Interactive 3D websites, digital environments and experiences designed to make the web
something people explore."
Scope:
- Interactive 3D websites and environments.
- WebGL-powered experiences.
- 3D storytelling and navigation.
- Immersive product presentations.
- Interactive brand experiences.
- Custom animated digital environments.
- Performance-optimized 3D experiences across devices.

**Intelligent AI Systems** — tagline "Not just AI that answers. AI that works."
Summary: "Purpose-built AI assistants, agent teams and intelligent operational systems that do more than
generate responses."
Scope:
- AI agents with specialized roles and responsibilities.
- Persistent memory and contextual understanding.
- Multi-agent collaboration and decision support.
- Tool execution and real-world workflows.
- Human approval and authorization systems.
- Business process automation.
- Monitoring, scheduling and proactive operations.
- Custom AI-powered applications and operational platforms.

**Terms line** on both cards and both chapters: "Timeline and deposit set per project, after scoping."
No price anywhere, and no `startingPrice` in the data.

## Where they appear
1. `src/data/services.js`: the two first, in the order above (flagships), with `slug`
   `immersive-web-experiences` and `intelligent-ai-systems`, `tagline`, `summary`, `scope`, and a `terms`
   field shown in place of "timeline · deposit". The other seven are unchanged and keep their order.
2. `/services`: their cards lead, each showing its tagline above its summary. Meta description and
   `llms.txt` name both. The Services ItemList structured data gains both.
3. Footer (built from the data) and the brief's project types: "Immersive Web Experience" and
   "Intelligent AI System" lead the list.
4. Home, both experiences: each gets a service chapter, first in `SERVICE_CHAPTERS`, so the business
   road's first two stops (world on) and the first two service chapters (world off) are these. The
   Living Source path bar reads them from the data.
5. Each chapter needs a real approved excerpt and a real screen; a chapter without both is left out, as
   today, so neither ships half-built.

## Excerpts and screens
- **Immersive Web Experiences:** `src/world/drive.js` lines 28–39, `driveAt` (repo `cja86104/AllenCode`,
  chosen 2026-11-26), approved by Chris before it ships. Screen: a new loop of this site recorded from
  the production build, slower than the 2026-11-16 loops (Chris: they "went too fast down the road"):
  the camera moves at most a third as fast, a sign stays readable at least a second, JPEG poster q90
  `subsampling=0` at most 400 KB, muted.
- **Intelligent AI Systems:** an excerpt from the agent build pipeline's repository (its folder to be
  connected), chosen with Chris and approved by him; its screen a real screenshot or loop of the
  pipeline running, supplied or approved by Chris. No invented code, no mock screen.

## Guards
- The business road grows by two stops: the world's guards (every landmark 97–101% of its glyphs; the
  camera's fastest 4 px within 0.15; each tier's budget) still pass; Chris's iPhone frame times re-run.
- Budget, Lighthouse accessibility and SEO 100, CLS no worse; `npm run excerpts:verify` covers both.
- No prices, no buy buttons, no sound. `// @ts-check`, no suppressions.
