// @ts-check

/**
 * Source for the Founders Helm product chapter: the home page headline words and the scroll motion that tilts its dashboard.
 * @type {import('./index.js').Excerpt}
 */
const productFoundersHelm = {
  id: 'product-founders-helm',
  file: 'founders-helm.tsx',
  repo: 'cja86104/Solo-Founder-OS',
  path: 'components/marketing/sections/hero.tsx',
  lines: [19, 41],
  commit: '80ffcd6ad571e7c797fd0a03fe16c52fef6da06b',
  code: [
    "/**",
    " * Signature motion moment (used nowhere else on the page):",
    " * the headline words unfurl on a 3D X-axis rotation from a shared origin,",
    " * while the framed dashboard de-skews out of perspective as you scroll.",
    " */",
    "const words: HeadlineWord[] = [",
    "  { text: \"Your\", accent: false },",
    "  { text: \"entire\", accent: false },",
    "  { text: \"business.\", accent: false },",
    "  { text: \"One\", accent: false },",
    "  { text: \"dashboard.\", accent: true },",
    "];",
    "",
    "export default function Hero() {",
    "  const reduced = useReducedMotion();",
    "  const shellRef = useRef<HTMLElement | null>(null);",
    "  const { scrollYProgress } = useScroll({ target: shellRef, offset: [\"start start\", \"end start\"] });",
    "  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });",
    "",
    "  const frameRotate = useTransform(smooth, [0, 1], [8.5, -1.5]);",
    "  const frameY = useTransform(smooth, [0, 1], [0, -70]);",
    "  const frameScale = useTransform(smooth, [0, 1], [1, 1.05]);",
    "  const glowOpacity = useTransform(smooth, [0, 0.7], [0.85, 0.15]);",
  ].join('\n'),
  becomes: 'the Founders Helm home page it animates',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default productFoundersHelm;
