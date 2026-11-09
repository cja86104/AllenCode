// @ts-check
// Checks every excerpt against its repository at the recorded commit.
// Usage: EXCERPT_REPOS='{"cja86104/AllenCode":"C:/path/to/AllenCode"}' npm run excerpts:verify
import { execFileSync } from 'node:child_process';
import { excerpts } from '../../src/content/excerpts/index.js';

const raw = process.env.EXCERPT_REPOS;
if (!raw) {
  console.error('Set EXCERPT_REPOS to a JSON map of repository name to local checkout path.');
  process.exit(1);
}
/** @type {Record<string, string>} */
const repos = JSON.parse(raw);

let failures = 0;
for (const excerpt of Object.values(excerpts)) {
  const dir = repos[excerpt.repo];
  if (!dir) {
    console.log(`skipped   ${excerpt.id} (no checkout given for ${excerpt.repo})`);
    continue;
  }
  const source = execFileSync('git', ['-C', dir, 'show', `${excerpt.commit}:${excerpt.path}`], { encoding: 'utf8' });
  const [first, last] = excerpt.lines;
  const expected = source.replace(/\r\n/g, '\n').split('\n').slice(first - 1, last).join('\n');
  if (expected === excerpt.code) {
    console.log(`ok        ${excerpt.id} (${excerpt.repo}:${excerpt.path}#L${first}-L${last} @ ${excerpt.commit.slice(0, 7)})`);
  } else {
    failures += 1;
    console.log(`MISMATCH  ${excerpt.id} (${excerpt.repo}:${excerpt.path}#L${first}-L${last} @ ${excerpt.commit.slice(0, 7)})`);
  }
}
process.exit(failures > 0 ? 1 : 0);
