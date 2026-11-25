import { describe, expect, it } from 'vitest';
import { memorial } from '../src/content/memorial';
import type { Memorial } from '../src/content/types';
import { featuredPhotos, validateMemorial } from '../src/lib/content';
import { documentTitle, headTags, robotsContent } from '../src/lib/head';
import { orderMemories } from '../src/lib/memories';
import { mainNavigation } from '../src/lib/navigation';

const clone = (): Memorial => structuredClone(memorial);

describe('the demonstration content', () => {
  it('has no problems', () => {
    expect(validateMemorial(memorial, { serverAccessControl: false })).toEqual([]);
  });

  it('uses the same names and dates throughout', () => {
    expect(memorial.person.fullName).toBe('Eleanor “Nell” Whitaker');
    expect(memorial.person.born).toEqual({ year: 1946, month: 5, day: 12 });
    expect(memorial.person.died).toEqual({ year: 2026, month: 9, day: 18 });
    expect(memorial.gathering?.events[0]?.start).toBe('2026-10-03T14:00');
    expect(memorial.gathering?.events[0]?.venue).toBe('The Whitaker Family Garden');
  });

  it('uses “There’s room for one more.” as a detail, not a slogan', () => {
    const text = JSON.stringify(memorial);
    expect(text.split('room for one more').length - 1).toBeLessThanOrEqual(2);
  });

  it('ships every demonstration photograph as a sized stock photograph, cropped to its own shape', () => {
    for (const photo of memorial.photos.items) {
      expect(photo.placeholder, photo.id).toBeUndefined();
      const url = new URL(photo.src);
      expect(url.hostname, photo.id).toBe('images.unsplash.com');
      expect(Number(url.searchParams.get('w')), photo.id).toBe(photo.width);
      expect(Number(url.searchParams.get('h')), photo.id).toBe(photo.height);
      expect(
        photo.sources?.map((source) => source.width),
        photo.id,
      ).toEqual([Math.round(photo.width / 2), photo.width]);
    }
  });

  it('features six photographs on the main memorial', () => {
    expect(featuredPhotos(memorial).map((photo) => photo.id)).toEqual(memorial.photos.featured);
  });
});

describe('validateMemorial', () => {
  it('catches a reference to a missing photograph', () => {
    const content = clone();
    content.opening.portraitId = 'not-there';
    expect(validateMemorial(content, { serverAccessControl: false })).toContain(
      'The opening portrait refers to a photograph “not-there” that is not in photos.items.',
    );
  });

  it('refuses a private memorial without server-enforced access control', () => {
    const content = clone();
    content.privacy.mode = 'private';
    expect(validateMemorial(content, { serverAccessControl: false }).join(' ')).toMatch(/server-enforced access control/);
    expect(validateMemorial(content, { serverAccessControl: true })).toEqual([]);
  });

  it('refuses audio without a transcript and a donation link that is not https', () => {
    const content = clone();
    content.modules.audio = { enabled: true, heading: 'Her voice', src: '/a.mp3', transcript: [] };
    content.modules.donation = { enabled: true, heading: 'Give', text: 'x', link: { label: 'Give', url: 'http://example.org' } };
    const problems = validateMemorial(content, { serverAccessControl: false });
    expect(problems).toContain('The audio memory needs a transcript before it can be shown.');
    expect(problems).toContain('The donation link must be a secure https address the family supplied.');
  });

  it('catches an unknown time zone', () => {
    const content = clone();
    const event = content.gathering?.events[0];
    if (!event) throw new Error('fixture');
    event.timeZone = 'Mars/Olympus';
    expect(validateMemorial(content, { serverAccessControl: false }).join(' ')).toMatch(/unknown time zone/);
  });
});

describe('memories ordering', () => {
  it('puts pinned memories first, then the rest in the order they were shared', () => {
    expect(orderMemories(memorial.memories.items).map((memory) => memory.id)).toEqual([
      'ruth-pinned',
      'mara',
      'daniel',
      'dot',
      'bev',
      'june',
      'theo',
      'tom',
    ]);
  });
});

describe('navigation', () => {
  it('offers the four sections', () => {
    expect(mainNavigation(memorial).map((item) => item.label)).toEqual(['Her life', 'Photographs', 'Gathering', 'Memories']);
  });

  it('follows the family’s own label and leaves out empty sections', () => {
    const content = clone();
    content.person.pronouns = { subject: 'they', object: 'them', possessive: 'their', lifeLabel: 'Their life' };
    content.photos.items = [];
    content.photos.featured = [];
    delete content.gathering;
    content.memories.items = [];
    content.privacy.acceptMemories = false;
    expect(mainNavigation(content).map((item) => item.label)).toEqual(['Their life']);
  });
});

describe('page head', () => {
  it('keeps an unlisted memorial out of search results', () => {
    expect(robotsContent(memorial)).toBe('noindex, nofollow, noarchive');
    const content = clone();
    content.privacy.mode = 'public';
    expect(robotsContent(content)).toBe('index, follow');
  });

  it('titles the page from the content', () => {
    expect(documentTitle(memorial)).toBe('Eleanor “Nell” Whitaker, 1946–2026');
  });

  it('never offers a placeholder as the social image, and escapes text', () => {
    const content = clone();
    content.site.url = 'https://example.org/nell';
    content.site.description = 'A "quoted" <b>description</b>';
    const portrait = content.photos.items.find((item) => item.id === content.site.socialImageId);
    if (!portrait) throw new Error('fixture');
    portrait.placeholder = true;
    const tags = headTags(content);
    expect(tags).not.toContain('og:image');
    expect(tags).toContain('A &quot;quoted&quot; &lt;b&gt;description&lt;/b&gt;');
    const photo = content.photos.items[0];
    if (!photo) throw new Error('fixture');
    photo.placeholder = false;
    photo.src = '/photos/porch.jpg';
    expect(headTags(content)).toContain('<meta property="og:image" content="https://example.org/photos/porch.jpg" />');
  });

  it('offers the shipped stock portrait, already absolute, as the social image once a URL is set', () => {
    const content = clone();
    content.site.url = 'https://example.org/nell';
    const portrait = content.photos.items.find((item) => item.id === content.site.socialImageId);
    if (!portrait) throw new Error('fixture');
    expect(headTags(content)).toContain(`<meta property="og:image" content="${portrait.src.replace(/&/g, '&amp;')}" />`);
  });
});
