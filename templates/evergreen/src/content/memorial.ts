import type { FocalPoint, Memorial, Photo } from './types';

/**
 * A stock photograph from Unsplash, cropped to the slot's own shape around `focus` (percent from the
 * original's top-left, like `focalPoint`), at full size and at half size for small screens. Replace with your own
 * files in `public/` when you have them (see `README.md`, “Adding photographs”).
 */
function stockPhoto(id: string, width: number, height: number, focus: FocalPoint): Pick<Photo, 'src' | 'width' | 'height' | 'sources'> {
  const at = (w: number) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=focalpoint&fp-x=${focus.x / 100}&fp-y=${focus.y / 100}&w=${w}&h=${Math.round((w * height) / width)}&q=80`;
  const half = Math.round(width / 2);
  return {
    src: at(width),
    width,
    height,
    sources: [
      { src: at(half), width: half },
      { src: at(width), width },
    ],
  };
}

/**
 * The memorial's content. This is the one file a family edits.
 *
 * The demonstration below remembers a fictional person, Eleanor “Nell” Whitaker. Every name, place,
 * venue and story in it is invented for the template preview; the photographs are stock photography
 * from Unsplash, chosen to match each moment, and their alt text describes what each one really shows.
 */
export const memorial: Memorial = {
  site: {
    appearance: 'paper-and-pine',
    socialImageId: 'porch-2019',
    description:
      'Remembering Eleanor “Nell” Whitaker, 1946–2026: school librarian, patient gardener, and the keeper of an extra chair in Asheville, North Carolina.',
    demonstration: true,
  },

  person: {
    displayName: 'Nell',
    fullName: 'Eleanor “Nell” Whitaker',
    shortName: 'Nell Whitaker',
    nameLines: ['Eleanor “Nell”', 'Whitaker'],
    pronouns: { subject: 'she', object: 'her', possessive: 'her', lifeLabel: 'Her life' },
    born: { year: 1946, month: 5, day: 12 },
    died: { year: 2026, month: 9, day: 18 },
    showDates: true,
    place: 'Asheville, North Carolina',
  },

  opening: {
    eyebrow: 'Remembering',
    intro: 'Nell kept books by every chair and an extra place at the table. This is a place for her stories—and yours.',
    portraitId: 'porch-2019',
  },

  objects: {
    heading: 'The things we remember',
    intro: 'Not the big events. The things that were always there.',
    items: [
      {
        id: 'recipe-tin',
        name: 'The blue recipe tin',
        drawing: 'recipe-tin',
        summary: 'A dented tin that once held her mother’s buttons, and later most of the family’s dinners.',
        story: [
          'The tin came from Edith Pressley’s sewing table. Nell emptied out the buttons in 1972, the week she and Hal moved into the house on Edgewood Road, and started filling it with index cards instead.',
          'Some cards are exact to the quarter teaspoon. Others say only “until it looks right,” which was not a joke. She expected you to learn what right looked like by standing next to her a few times.',
          'The tin sat on the shelf above the stove for fifty-four years. The lid still sticks on the left side.',
        ],
        attribution: 'Ruth, her daughter',
      },
      {
        id: 'dated-book',
        name: 'A book with the date inside',
        drawing: 'book',
        summary: 'She wrote the date inside every book she gave away, and nothing else.',
        story: [
          'No message, no “love, Nell.” Just the date, in pencil, at the top corner of the first page. She said a message tells you what someone wanted you to feel, and a date lets you remember what you actually did.',
          'Most of us have a shelf of them now. Open one and you know exactly which winter it was.',
        ],
        attribution: 'Sam, her son',
      },
      {
        id: 'extra-chair',
        name: 'The extra kitchen chair',
        drawing: 'chair',
        summary: 'It never matched the others. That was rather the point.',
        story: [
          'Hal found it at an estate sale on Charlotte Street in 1975 and refinished it in the garage. It was a spindle-back, a shade too tall, and it lived at the end of the kitchen table for whoever turned up: a neighbor, a lost student, somebody’s new boyfriend.',
          'When Daniel moved into his first apartment, she sent the chair with him. Hal had another one built by the following spring.',
          '“There’s room for one more,” she’d say, and pull it out before you had decided whether to stay.',
        ],
        attribution: 'Bev Holcomb, across the street',
      },
    ],
  },

  life: {
    heading: 'A life, in chapters.',
    intro: [
      'Nell lived nearly all of her eighty years within a few miles of the house she was born in. She did not think of that as a small life. She thought of it as a deep one: the same streets, the same families, three generations of children coming through the same library door.',
      'What follows is the version her children agreed on, which is not quite the version she would have told. She would have left out the parts where she was right.',
    ],
    attribution: 'Written by Ruth Whitaker Ames, with corrections from her brothers and from her aunt June.',
    chapters: [
      {
        id: 'growing-up',
        title: 'Growing up',
        years: '1946–1964',
        photoId: 'haywood-road-1952',
        excerpt: [
          'Eleanor Pressley was born in West Asheville on May 12, 1946, the second of four children, and grew up in the rooms above her father’s feed-and-seed store on Haywood Road.',
          'She learned to read from seed packets and the backs of feed sacks, and by eight she was the one who wrote out the store’s price cards because her handwriting was the neatest in the family.',
        ],
        body: [
          'Eleanor Pressley was born in West Asheville on May 12, 1946, the second of four children of Roy and Edith Pressley. The family lived in the rooms above Pressley Feed & Seed on Haywood Road, and the store was the center of everything: the radio, the gossip, the smell of cracked corn coming up through the floorboards.',
          'She learned to read from seed packets and the backs of feed sacks. By eight she was writing out the store’s price cards, because her handwriting was the neatest in the family and because she would not stop correcting her older brother Ray’s spelling.',
          'Her sister June, four years younger, remembers Nell reading under the counter during slow afternoons, and being sent upstairs for it, and reading on the stairs instead.',
          'The West Asheville branch library was a ten-minute walk. The librarian there, a Mrs. Lyda, let her take out six books at a time instead of the usual four. Nell said later that it was the first time an adult had made a rule bend for her, and she decided then that she would like to be the kind of person who bent it for someone else.',
          'She graduated from high school in 1964 and went up the mountain to Boone, to Appalachian State, on a scholarship and a borrowed suitcase.',
        ],
      },
      {
        id: 'library-years',
        title: 'The library years',
        years: '1969–2008',
        photoId: 'riverside-library-1983',
        aside: 'What kind of week have you had?',
        excerpt: [
          'For thirty-nine years Nell ran the library at Riverside Elementary. She knew which second graders were ready for chapter books before they did, and which fifth graders needed a book that would not ask anything of them for a while.',
          'She never recommended a book without asking a question first.',
        ],
        body: [
          'Nell finished her degree in library science in the spring of 1968 and started at Riverside Elementary the following year. She stayed for thirty-nine years, through four principals, two renovations and one flood that took the entire picture-book section in 1977.',
          'The library she built was not quiet. There was a rug that was always slightly damp, a beanbag nobody was allowed to stand on, and a card catalog she kept long after the district had computers, because she said children should know what it felt like to find something by hand.',
          'She knew which second graders were ready for chapter books before they did. She also knew which fifth graders needed a book that would not ask anything of them for a while, and she would put one in their hands without a word about why.',
          'She never recommended a book without asking what kind of week you’d had first. Former students still bring this up, decades later, usually as the thing they did not realize was unusual until they were grown.',
          'Dot Rankin, who taught fourth grade down the hall for twenty-two of those years, says Nell kept a drawer of granola bars and spare socks behind the circulation desk and never once mentioned it to the front office.',
          'She retired in June 2008. The staff gave her a cake shaped like a book. She pointed out that the spine was on the wrong side.',
        ],
      },
      {
        id: 'house-with-room',
        title: 'A house with room',
        years: '1972 onward',
        photoId: 'kitchen-table-1986',
        aside: 'There’s room for one more.',
        excerpt: [
          'Nell and Hal bought the house on Edgewood Road in 1972 with a down payment borrowed partly from her father and partly from the feed store’s cash box, which Roy did not mention to Edith for some years.',
          'The kitchen table was where homework happened, difficult conversations softened, and visitors were usually persuaded to stay for dinner.',
        ],
        body: [
          'Nell married Harold Whitaker, who everyone called Hal, at the Buncombe County courthouse in June 1969. He taught woodshop at the high school and could fix anything except a sense of direction.',
          'They bought the house on Edgewood Road in 1972, with a down payment borrowed partly from her father and partly from the feed store’s cash box, which Roy did not mention to Edith for some years. Daniel had been born the year before. Ruth followed in 1974, and Sam in 1979.',
          'The kitchen table was oak, too big for the room, and had come from Hal’s mother. It was where homework happened, where difficult conversations softened, and where visitors were usually persuaded to stay for dinner. There was always an extra chair at the end of it, one that did not match.',
          'She grew tomatoes badly for years. The first summer’s crop she described as “instructive.” It took her until the early 2000s, and a long conversation over the fence with Bev Holcomb about wire cages and watering in the morning, to grow a tomato she was proud of.',
          'Hal died in the spring of 2013. Nell kept the house as it was, kept the chair at the end of the table, and kept cooking for more people than lived there.',
        ],
      },
      {
        id: 'passed-on',
        title: 'What she passed on',
        years: '2008–2026',
        photoId: 'reading-thanksgiving-2015',
        excerpt: [
          'In retirement Nell and Hal built a small lending library at the end of the driveway. She stocked it every Saturday, wrote the date inside anything she put there, and kept a notebook of what disappeared fastest.',
          'She died at home on September 18, 2026, with the window open to the garden.',
        ],
        body: [
          'In 2010 Hal built a small lending library at the end of the driveway, with a roof that matched the house. Nell stocked it every Saturday morning, wrote the date inside anything she put there, and kept a notebook of what disappeared fastest. Mysteries, always. Poetry, never, though she kept trying.',
          'She read to her grandchildren, Theo and Lila, on the porch swing and at the kitchen table, and she let them choose, even when they chose the same book eleven times. Her youngest grandchild, Ivy, was born in 2021 and got the full treatment.',
          'In 2023 Sam rebuilt the garden beds so she could work them sitting down. She grumbled about it for a week and then grew the best tomatoes of her life.',
          'What she passed on is mostly in habits now: the date in the front of a book, a question before a recommendation, a spare chair pulled out before anyone asks for it.',
          'Nell died at home on September 18, 2026, with the window open to the garden. She was eighty.',
        ],
      },
    ],
  },

  photos: {
    heading: 'The moments that stayed.',
    intro: 'Shared by family and friends. Dates are as close as anyone could remember.',
    featured: ['graduation-1968', 'courthouse-1969', 'first-tomatoes-1973', 'porch-steps-1982', 'cherokee-purples-2004', 'garden-2023'],
    items: [
      {
        id: 'porch-2019',
        ...stockPhoto('1750979636275-9114d5fd3639', 1200, 1500, { x: 40, y: 40 }),
        alt: 'Nell in a brown sweater sitting out on the porch, resting at a table with a glass in front of her.',
        caption: 'Nell on the back porch, late summer, 2019.',
        date: { year: 2019, season: 'summer' },
        location: 'Edgewood Road, Asheville',
        contributor: 'Ruth',
        focalPoint: { x: 45, y: 35 },
        collections: ['everyday'],
        story: ['Theo had just asked whether she had been alive when dinosaurs were. She said only the small ones.'],
      },
      {
        id: 'haywood-road-1952',
        src: '/photos/haywood-road-1952.jpg',
        width: 1126,
        height: 1408,
        sources: [
          { src: '/photos/haywood-road-1952-563.jpg', width: 563 },
          { src: '/photos/haywood-road-1952.jpg', width: 1126 },
        ],
        alt: 'Nell in a blue gingham dress and belt, a burlap sack over her shoulder, on a dirt road outside a wooden feed store with an old truck parked in front.',
        caption: 'Nell on the dirt road out to the feed store on Haywood Road.',
        date: { year: 1952, approximate: true },
        location: 'West Asheville',
        contributor: 'June, her sister',
        focalPoint: { x: 50, y: 30 },
        collections: ['early-years'],
      },
      {
        id: 'graduation-1968',
        ...stockPhoto('1623461487986-9400110de28e', 1600, 1067, { x: 45, y: 60 }),
        alt: 'Nell in her graduation gown, seen from behind, holding her mortarboard up in front of a columned college building.',
        caption: 'Graduation day in Boone, cap held high before the wind could take it.',
        date: { year: 1968, season: 'spring' },
        location: 'Appalachian State, Boone',
        contributor: 'June, her sister',
        focalPoint: { x: 45, y: 55 },
        collections: ['early-years'],
      },
      {
        id: 'courthouse-1969',
        ...stockPhoto('1582184443157-b767b664ab98', 1200, 1500, { x: 60, y: 55 }),
        alt: 'Nell in a plain white dress and Hal in a suit, sitting close on a wooden bench in a tiled courthouse hallway.',
        caption: 'Nell and Hal waiting their turn at the courthouse, the day they married.',
        date: { year: 1969, month: 6 },
        location: 'Buncombe County Courthouse',
        contributor: 'Daniel',
        focalPoint: { x: 50, y: 55 },
        collections: ['early-years', 'family'],
      },
      {
        id: 'first-tomatoes-1973',
        ...stockPhoto('1646188162775-06455ea84121', 1600, 1067, { x: 40, y: 50 }),
        alt: 'Nell’s open hand holding out a few small tomatoes over the grass.',
        caption: 'The first crop, which she called “instructive.”',
        date: { year: 1973, season: 'summer' },
        location: 'Edgewood Road, Asheville',
        contributor: 'Daniel',
        focalPoint: { x: 45, y: 50 },
        collections: ['everyday'],
        story: ['Hal took this. She asked him not to, and then asked for a copy.'],
      },
      {
        id: 'porch-steps-1982',
        ...stockPhoto('1607453998774-d533f65dac99', 1600, 1067, { x: 50, y: 40 }),
        alt: 'Three small children squeezed together on the front steps, laughing.',
        caption: 'Daniel, Ruth and Sam on the porch steps.',
        date: { year: 1982, season: 'summer', approximate: true },
        location: 'Edgewood Road, Asheville',
        contributor: 'Ruth',
        focalPoint: { x: 50, y: 35 },
        collections: ['family'],
      },
      {
        id: 'riverside-library-1983',
        ...stockPhoto('1680178776508-41a276595b0f', 1600, 1067, { x: 50, y: 50 }),
        alt: 'A crowd of children gathered around a woman at the library shelves.',
        caption: 'Book Fair week in the Riverside library.',
        date: { year: 1983, approximate: true },
        location: 'Riverside Elementary',
        contributor: 'Dot Rankin',
        focalPoint: { x: 50, y: 45 },
        collections: ['everyday'],
      },
      {
        id: 'kitchen-table-1986',
        ...stockPhoto('1758525861793-9258e09708e2', 1600, 1067, { x: 50, y: 50 }),
        alt: 'Nell leaning over a girl’s shoulder at a wooden table, pointing to a page in her open book.',
        caption: 'Homework at the kitchen table.',
        date: { year: 1986, season: 'winter' },
        location: 'Edgewood Road, Asheville',
        contributor: 'Ruth',
        focalPoint: { x: 55, y: 40 },
        collections: ['family', 'everyday'],
      },
      {
        id: 'cherokee-purples-2004',
        ...stockPhoto('1768158988918-cc3fa9191f89', 1400, 1400, { x: 50, y: 50 }),
        alt: 'Heirloom tomatoes, yellow, green and one dark and ridged, in a blue speckled bowl on weathered boards.',
        caption: 'The year the tomatoes finally came in.',
        date: { year: 2004, month: 8 },
        location: 'Edgewood Road, Asheville',
        contributor: 'Bev Holcomb',
        focalPoint: { x: 50, y: 50 },
        collections: ['everyday'],
        story: ['She brought the first one across the street to me on a saucer, like it was a cake. She had earned it.'],
      },
      {
        id: 'last-day-2008',
        ...stockPhoto('1560789001-9243194667b1', 1600, 1067, { x: 50, y: 45 }),
        alt: 'Nell, seen from behind, carrying an armful of flowers over her shoulder past the library shelves.',
        caption: 'Her last day at Riverside, with an armful of flowers.',
        date: { year: 2008, month: 6 },
        location: 'Riverside Elementary',
        contributor: 'Dot Rankin',
        focalPoint: { x: 45, y: 45 },
        collections: ['everyday'],
      },
      {
        id: 'reading-thanksgiving-2015',
        ...stockPhoto('1532789339108-2ebc484efbf1', 1600, 1067, { x: 50, y: 50 }),
        alt: 'Theo and Lila leaning over an open picture book on the sofa, seen from where Nell sat reading.',
        caption: 'Reading to Theo and Lila, Thanksgiving weekend.',
        date: { year: 2015, month: 11 },
        location: 'Edgewood Road, Asheville',
        contributor: 'Ruth',
        focalPoint: { x: 50, y: 50 },
        collections: ['family'],
      },
      {
        id: 'garden-2023',
        ...stockPhoto('1631981784938-d14ae009fcc8', 1600, 1067, { x: 50, y: 50 }),
        alt: 'Tall tomato plants in a wooden raised bed, a ripe tomato resting on its edge.',
        caption: 'The new beds Sam built, so she could garden sitting down.',
        date: { year: 2023, month: 6 },
        location: 'Edgewood Road, Asheville',
        contributor: 'Sam',
        focalPoint: { x: 50, y: 50 },
        collections: ['family', 'everyday'],
      },
      {
        id: 'recipe-tin-2026',
        ...stockPhoto('1746422029252-de9841a2ef79', 1400, 1400, { x: 50, y: 55 }),
        alt: 'A worn blue tin with a fitted lid, its old coffee lettering still on the front.',
        caption: 'The blue tin, lid on, the recipes still inside.',
        date: { year: 2026, month: 10 },
        location: 'Edgewood Road, Asheville',
        contributor: 'Ruth',
        focalPoint: { x: 50, y: 50 },
        collections: ['everyday'],
      },
      {
        id: 'kitchen-table-2026',
        ...stockPhoto('1793143765092-dd507da9bffe', 1600, 900, { x: 50, y: 55 }),
        alt: 'An empty wooden table with spindle-back chairs and a bowl of apples, in late-day sun.',
        caption: 'The kitchen table on Edgewood Road.',
        date: { year: 2026, season: 'autumn' },
        location: 'Edgewood Road, Asheville',
        contributor: 'Sam',
        focalPoint: { x: 50, y: 55 },
        collections: ['everyday'],
      },
    ],
  },

  gathering: {
    heading: 'Gathering to remember Nell.',
    visibility: 'public',
    events: [
      {
        id: 'celebration-of-life',
        title: 'Celebration of life',
        start: '2026-10-03T14:00',
        durationMinutes: 180,
        timeZone: 'America/New_York',
        timeZoneLabel: 'Eastern Time',
        venue: 'The Whitaker Family Garden',
        city: 'Asheville, North Carolina',
        accessibility: 'The garden paths are level gravel, with chairs set out along them. The porch has a ramp at the side of the house.',
        parking: 'Please park on the street. Bev Holcomb has offered her driveway across the road to anyone who needs to be close.',
        reception: 'Something to eat on the porch afterward. Ruth is making the tomato pie.',
        note: 'Please wear whatever feels comfortable. We’ll share stories in the garden and have something to eat afterward.',
        offerCalendar: true,
        fictional: true,
      },
    ],
    afterNote:
      'Thank you to everyone who came to the garden on October 3. If you couldn’t be there, you are always welcome to share a memory here.',
    privateNote: 'The family will share details of the gathering directly with those invited.',
  },

  memories: {
    heading: 'What we carry with us.',
    intro: 'From family, friends, neighbors and former students. Each was read by the family before it appeared here.',
    items: [
      {
        id: 'ruth-pinned',
        author: 'Ruth',
        relationship: 'daughter',
        pinned: true,
        sharedOn: '2026-09-25',
        text: [
          'People keep telling me how generous she was, and she was, but I want to say something more specific than that. She paid attention. She remembered that your dog had been sick, or that you hated cilantro, or that you had a test on Thursday, and she would ask about it on Friday as though it had been on her mind all week. It usually had.',
          'The last thing she asked me for was a pencil, so she could write the date inside a book she was giving to the hospice nurse. She got the year right and the month wrong, and when I pointed it out she said the nurse would know what she meant.',
          'Thank you for coming here. Please pull up a chair.',
        ],
      },
      {
        id: 'mara',
        author: 'Mara',
        relationship: 'former student',
        sharedOn: '2026-09-21',
        text: ['She never recommended a book without asking what kind of week I’d had first.'],
      },
      {
        id: 'daniel',
        author: 'Daniel',
        relationship: 'son',
        sharedOn: '2026-09-22',
        text: [
          'When I moved into my first apartment, Mom sent me home with two plates, a saucepan, and the chair she said didn’t match anything anyway. It matched everything I owned.',
        ],
      },
      {
        id: 'dot',
        author: 'Dot Rankin',
        relationship: 'taught fourth grade down the hall at Riverside',
        sharedOn: '2026-09-23',
        text: [
          'For twenty-two years I sent her my hardest kids. Not as a punishment. I would just say, “Go see if Mrs. Whitaker needs help shelving,” and she would know. She never once sent one back early.',
          'There was a drawer behind the circulation desk with granola bars and clean socks. The front office never knew about it, and neither did the parents, and I am only telling you now because she can’t get in trouble for it anymore.',
          'When the flood took the picture books in 1977, she was there the next morning in rain boots, laying them out on the gym floor one by one to dry. We saved about a third of them. She kept a list of every one we lost and replaced them, one at a time, over the next four years, mostly out of her own pocket.',
        ],
      },
      {
        id: 'bev',
        author: 'Bev Holcomb',
        relationship: 'neighbor, across the street, since 1981',
        sharedOn: '2026-09-24',
        text: ['I borrowed that extra chair for my own Thanksgiving more than once. It always came back with a pie on it.'],
      },
      {
        id: 'june',
        author: 'June',
        relationship: 'sister',
        sharedOn: '2026-09-27',
        text: [
          'Our mother used to send her upstairs for reading under the store counter. She just read on the stairs. Then she read on the landing. By the end of the summer of 1955 she had read her way all the way up to our bedroom and our mother gave up.',
          'She was four years older than me and she was right about almost everything, which was hard to grow up beside, and I would give a great deal to be told I was wrong by her one more time.',
        ],
      },
      {
        id: 'theo',
        author: 'Theo',
        relationship: 'grandson',
        sharedOn: '2026-10-04',
        text: ['She let me pick the book every time, even when it was the dinosaur one again.'],
      },
      {
        id: 'tom',
        author: 'Tom',
        sharedOn: '2026-10-06',
        text: [
          'I took a mystery out of the little library at the end of her driveway every Saturday for about six years. I never met her properly. Every single one had a date written inside.',
        ],
      },
    ],
  },

  modules: {
    recipe: {
      enabled: true,
      heading: 'From the blue tin',
      name: 'Tomato pie',
      provenance:
        'Written by Nell around 1998 on the back of a Riverside library overdue slip, from a recipe of Bev Holcomb’s that she adjusted until Bev admitted it was better.',
      cardLines: [
        'Tomato Pie (Bev’s, mostly)',
        '1 pie crust, baked a little',
        '4 big tomatoes — slice, salt, drain on a towel. DON’T skip',
        '1 sweet onion, cooked down slow',
        'basil, a good handful',
        '1 c. sharp cheddar + ½ c. mozzarella',
        '½ c. mayonnaise',
        'lots of pepper',
        '375° until it looks right.',
      ],
      ingredients: [
        '1 pie crust, blind-baked until just set',
        '4 large ripe tomatoes, sliced about ¼ inch thick',
        'Salt, for drawing out the tomatoes',
        '1 sweet onion, thinly sliced',
        'A good handful of fresh basil, torn',
        '1 cup sharp cheddar, grated',
        '½ cup mozzarella, grated',
        '½ cup mayonnaise',
        'Plenty of black pepper',
      ],
      steps: [
        'Lay the tomato slices on a clean dish towel, salt them on both sides and leave them for at least 30 minutes. Pat them dry. Nell underlined this step twice.',
        'Cook the onion slowly in a little butter until soft and golden, about 20 minutes.',
        'Heat the oven to 375°F.',
        'Layer the onion, tomatoes and basil in the baked crust, seasoning each layer with pepper.',
        'Stir the cheeses and mayonnaise together and spread over the top, right to the edges of the crust.',
        'Bake until the top is browned and bubbling, usually 30 to 35 minutes. Let it rest for 15 minutes before cutting.',
      ],
      notes: ['In the margin, in pencil: “Ruth — less salt than you think.”'],
    },
  },

  closing: {
    photoId: 'kitchen-table-2026',
    note: 'Thank you for remembering Nell with us. Keep telling the stories.',
    signature: 'Daniel, Ruth and Sam',
  },

  privacy: {
    mode: 'unlisted',
    acceptMemories: true,
    acceptPhotos: true,
  },

  contact: {
    caretaker: 'Ruth Whitaker Ames',
    preference:
      'The family reads every memory shared here. If you would like a reply, leave an email address with your memory; it is never shown on the memorial.',
  },
};
