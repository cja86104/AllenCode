import type { Brewery } from './types';

/** A stock photograph from Unsplash, linked from Unsplash's servers. Replace with your own files in `public/`. */
const stock = (id: string, width = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

/**
 * The brewery's content. This is the one file a buyer edits.
 *
 * The demonstration below is a fictional brewery, Founding Fathoms Brewing. Its people, beers, prices,
 * retailers, food trucks and quotes are invented for the template preview; the photographs are stock
 * photography.
 */
export const brewery: Brewery = {
  site: {
    name: 'Founding Fathoms Brewing',
    shortName: 'Founding Fathoms',
    tagline: 'Brewing · Harbor',
    description:
      'Founding Fathoms Brewing: craft beer brewed on a working harbor. Taproom on the east pier, fresh four-packs, food trucks and the Can Club.',
    demonstration: true,
    indexable: false,
  },

  contact: {
    street: '4 East Pier, Warehouse Row',
    city: 'Seaport Harbor',
    email: 'hello@foundingfathoms.example',
    tradeEmail: 'trade@foundingfathoms.example',
  },

  hours: {
    schedule: [
      { day: 3, opens: '15:00', closes: '22:00' },
      { day: 4, opens: '15:00', closes: '22:00' },
      { day: 5, opens: '12:00', closes: '23:00' },
      { day: 6, opens: '12:00', closes: '23:00' },
      { day: 0, opens: '12:00', closes: '20:00' },
    ],
    closedNote: 'brew days',
    note: 'The kitchen is the food truck out back. Dogs welcome on the pier patio.',
  },

  home: {
    hero: {
      eyebrow: 'Est. Warehouse 4 · East Pier',
      lines: ['Founding', 'Fathoms', 'Brewing'],
      intro: 'Craft beer on a working harbor. Process first. Pours without pretense.',
      photo: {
        src: stock('1758978911880-5e50cf2c9988', 1920),
        alt: 'Rows of stainless steel fermenters down a long, dim brewhouse aisle',
      },
    },
    pouring: {
      eyebrow: 'Live board',
      heading: 'Currently pouring',
      note: 'What’s on draft right now. Styles rotate with the tanks.',
    },
    canClub: {
      eyebrow: 'Membership',
      heading: 'The Can Club',
      body: 'Four cans a month from what actually left the bright tank, not a static list. Members get release-day priority, a stamped pickup window, and first crack at barrel projects before they reach the retail cold box.',
      points: ['A monthly drop, picked up on the pier', 'Skip or pause any month', 'Member pricing on extra four-packs'],
      stamp: 'FF Cans',
      photo: {
        src: stock('1743732345166-cd434e5dada2'),
        alt: 'Four open cans lined up on a steel rail',
      },
    },
    regulars: {
      eyebrow: 'From the regulars',
      quotes: [
        {
          quote:
            'I work the morning boats. End of shift, Keel Line on nitro is the only thing that feels honest after salt air and diesel.',
          name: 'Tom R.',
          role: 'Harbor regular',
        },
        {
          quote: 'The Can Club isn’t a gimmick here. You get what they actually made that month, not shelf leftovers in a fancy box.',
          name: 'Aisha K.',
          role: 'Can Club member',
        },
        {
          quote: 'The taproom smells like grain and wet steel. That’s a compliment. You can tell they brew on site.',
          name: 'Diego M.',
          role: 'Visiting brewer',
        },
      ],
      photo: {
        src: stock('1514933651103-005eec06c04b', 1920),
        alt: 'A dim taproom with tap handles along the bar',
      },
    },
    floor: {
      eyebrow: 'On the floor',
      heading: 'Brewed where the boats tie up',
      body: 'Tours on select Saturdays. The taproom doors open onto the working water: grain in, cans out, and nothing between you and the tanks.',
      photos: [
        { src: stock('1574323347407-f5e1ad6d020b'), alt: 'Malted grain, close up' },
        { src: stock('1792955104636-be03d0fb1756'), alt: 'Stainless steel fermenters with red hoses on a wet concrete floor' },
        { src: stock('1532634740-6837b2a21d39'), alt: 'A brewer moving kegs across a wet brewhouse floor' },
      ],
      batch: { label: 'Batch on deck', number: '1847', detail: 'Harbor Lights IPA · 6.8% ABV' },
    },
  },

  beer: {
    intro: 'The full draft list by style, with the strength and bitterness up front so you can find what you’re after.',
    groups: ['IPA', 'Lager', 'Stout', 'Sour', 'Seasonal'],
    beers: [
      {
        id: 'harbor-lights',
        name: 'Harbor Lights IPA',
        style: 'West Coast IPA',
        abv: 6.8,
        ibu: 68,
        note: 'Pine resin, grapefruit pith, dry snap finish.',
        group: 'IPA',
        onTap: true,
      },
      {
        id: 'keel-line',
        name: 'Keel Line Lager',
        style: 'Helles',
        abv: 4.9,
        ibu: 18,
        note: 'Cracker malt, soft noble hop, clean finish.',
        group: 'Lager',
        onTap: true,
      },
      {
        id: 'blackwater',
        name: 'Blackwater Stout',
        style: 'Dry Irish Stout',
        abv: 4.4,
        ibu: 36,
        note: 'Roasted barley, espresso, silky nitrogen pour.',
        group: 'Stout',
        onTap: true,
      },
      {
        id: 'pier-7',
        name: 'Pier 7 Pils',
        style: 'Czech Pilsner',
        abv: 5.1,
        ibu: 38,
        note: 'Saaz spice, white pepper, snappy bitterness.',
        group: 'Lager',
        onTap: true,
      },
      {
        id: 'fog-bank',
        name: 'Fog Bank Hazy',
        style: 'New England IPA',
        abv: 6.4,
        ibu: 32,
        note: 'Mango, soft oat body, low bitterness.',
        group: 'IPA',
        onTap: true,
      },
      {
        id: 'barnacle-berry',
        name: 'Barnacle Berry',
        style: 'Kettle Sour',
        abv: 5.0,
        ibu: 8,
        note: 'Blackberry, bright tartness, clean finish.',
        group: 'Sour',
        onTap: true,
      },
      {
        id: 'winter-mooring',
        name: 'Winter Mooring',
        style: 'Barrel-Aged Imperial Stout',
        abv: 11.2,
        ibu: 45,
        note: 'Bourbon oak, dark chocolate, molasses depth.',
        group: 'Seasonal',
        onTap: true,
      },
      {
        id: 'rigging-rope',
        name: 'Rigging Rope Red',
        style: 'Irish Red Ale',
        abv: 5.3,
        ibu: 24,
        note: 'Toffee crust, light roast, restrained hop.',
        group: 'Seasonal',
        onTap: true,
      },
      {
        id: 'channel-marker',
        name: 'Channel Marker DIPA',
        style: 'Double IPA',
        abv: 8.4,
        ibu: 85,
        note: 'Resinous, orange oil, lingering bitterness.',
        group: 'IPA',
        onTap: false,
      },
      {
        id: 'slipway',
        name: 'Slipway Session',
        style: 'Session IPA',
        abv: 4.6,
        ibu: 42,
        note: 'Citrus zest, cracker malt, easy drinking.',
        group: 'IPA',
        onTap: false,
      },
      {
        id: 'dry-dock',
        name: 'Dry Dock Dunkel',
        style: 'Munich Dunkel',
        abv: 5.2,
        ibu: 22,
        note: 'Bread crust, cocoa nib, soft lager finish.',
        group: 'Lager',
        onTap: false,
      },
      {
        id: 'mooring-milk',
        name: 'Mooring Milk Stout',
        style: 'Milk Stout',
        abv: 5.8,
        ibu: 28,
        note: 'Lactose sweetness, cocoa, velvet body.',
        group: 'Stout',
        onTap: false,
      },
      {
        id: 'citrus-buoy',
        name: 'Citrus Buoy',
        style: 'Gose',
        abv: 4.2,
        ibu: 6,
        note: 'A touch of sea salt, lemon peel, coriander.',
        group: 'Sour',
        onTap: false,
      },
      {
        id: 'autumn-plimsoll',
        name: 'Autumn Plimsoll',
        style: 'Oktoberfest',
        abv: 5.6,
        ibu: 24,
        note: 'Toasted malt, gentle spice, copper pour.',
        group: 'Seasonal',
        onTap: false,
      },
    ],
    releases: {
      eyebrow: 'Cold box',
      heading: 'Four-packs to go',
      note: 'Limited releases go to the Can Club first. Order ahead and pick up at the taproom.',
    },
    freshness: {
      heading: 'Freshness is a logistics problem',
      body: 'We can mid-week so shops get beer that still remembers the tank. Check the date code on the base of the can: if an IPA is older than 90 days, drink something else.',
    },
  },

  taproom: {
    eyebrow: 'Warehouse 4',
    intro: 'Come in work boots. Stay for a pint with a view of the actual harbor: nets, diesels, tide charts and all.',
    foodTrucks: [
      { day: 3, name: 'Smoke Stack BBQ', fare: 'Brisket sandwiches, burnt ends' },
      { day: 4, name: 'Salt & Hull', fare: 'Fish tacos, chowder cups' },
      { day: 5, name: 'Pier Pie Co.', fare: 'Wood-fired slices, garlic knots' },
      { day: 6, name: 'Rotating guest', fare: 'Check the board. Always local.' },
      { day: 0, name: 'Sweet Ballast', fare: 'Doughnuts and coffee until 3 PM' },
    ],
    events: [
      {
        id: 'trivia',
        title: 'Harbor Trivia Night',
        when: 'Every Thursday · 7 PM',
        detail: 'Teams of up to six. Prizes in free pints and merch credit.',
      },
      {
        id: 'live-music',
        title: 'Live music on the mezzanine',
        when: 'Every Saturday · 8 PM',
        detail: 'Local folk and rock on the mezzanine stage. No cover.',
      },
      {
        id: 'tour',
        title: 'Brewery process tour',
        when: 'First Saturday of the month · 2 PM',
        detail: 'Walk the floor with head brewer Mara Quinn. Limited to 20.',
      },
      {
        id: 'vinyl',
        title: 'Sunday vinyl hour',
        when: 'Every Sunday · 3 PM',
        detail: 'Staff-spun records, half pours of the seasonals, quiet harbor light.',
      },
    ],
    eventsNote: 'Just show up. No tickets needed.',
    roomNote: 'Steel, grain dust and good light at last call.',
    photos: [
      { src: stock('1763626343502-b0b1f26b43d4'), alt: 'A long row of beer taps along the bar' },
      { src: stock('1779591211763-7a54431e16ab'), alt: 'Taproom tables beside the brewhouse, with steel tanks behind' },
      { src: stock('1784521817377-412b7e53975b'), alt: 'Sailboats on the harbor through a tall warehouse window' },
      { src: stock('1630265412337-226d546f2436'), alt: 'Wooden tables and chairs under industrial beams' },
      { src: stock('1572442933721-91dec35cdcc5'), alt: 'A wall of glass-door coolers stocked with bottled beer' },
      { src: stock('1767552989991-0fac1fe88491'), alt: 'A steel door with heavy hinges set in a brick wall' },
    ],
  },

  story: {
    eyebrow: 'From the pier office',
    quote: 'We brew where the boats tie up, and we mean it.',
    paragraphs: [
      'Founding Fathoms started in a leased corner of Warehouse 4 on the east pier: two open fermenters, a borrowed cold box, and a conviction that harbor towns deserve beer that tastes like the work done around them.',
      'Head brewer Mara Quinn learned the trade on production floors up and down the coast before coming home to build a brewery that didn’t apologize for being local. Co-founder Ellis Drake ran logistics for the fishing co-op, and he still talks about packaging like a supply-chain problem worth solving right.',
      'We don’t chase every trend that comes off the mainland. We do double-batch the beers the dock crews finish before the trucks leave. We can on a mid-week line so what reaches the shelves is still close to the tank. And we keep a taproom that opens onto the working water.',
      'Batch numbers still start with FF. The brass on the door is original to the pier office. If you want the story short: we brew where the boats tie up.',
    ],
    brewer: {
      name: 'Mara Quinn',
      role: 'Head brewer',
      photo: { src: stock('1551837818-f52fc6991b70'), alt: 'A brewer crouched at work beside the fermenters' },
    },
    process: {
      eyebrow: 'Process',
      heading: 'How it leaves the floor',
      note: 'Grain in before dawn. Cans out before the afternoon tide turns.',
      steps: [
        { label: 'Brew kettle', photo: { src: stock('1719752486418-202cd730147c'), alt: 'A copper brew kettle, close up' } },
        { label: 'Quality lab', photo: { src: stock('1748261347807-4e54ec728ecc'), alt: 'A pipette adding a sample to a glass bottle' } },
        { label: 'Hops', photo: { src: stock('1600956306204-d6a5c6aab472'), alt: 'Fresh hop cones on a wooden table' } },
        { label: 'Canning line', photo: { src: stock('1727373203579-7b8984cb8120'), alt: 'Empty cans moving along a conveyor belt' } },
        { label: 'Barrel room', photo: { src: stock('1534655882117-f9eff36a1574'), alt: 'Oak barrels stacked in low light' } },
      ],
    },
    stats: [
      { value: '2', label: 'Open fermenters on day one' },
      { value: '7', label: 'Years on the east pier' },
      { value: '42', label: 'Barrels under the mezzanine' },
    ],
  },

  findUs: {
    eyebrow: 'In shops',
    intro:
      'Our cans go to independent shops first, then a short list of chains that keep them cold. Search by shop, street, city or region.',
    regions: [
      {
        name: 'Waterfront & Harbor District',
        stores: [
          { name: 'Dockside Bottle Shop', address: '18 Wharf Lane', city: 'Seaport' },
          { name: 'The Sounding Line', address: '402 Pier Avenue', city: 'Seaport' },
          { name: 'Harbor Co-op Market', address: '77 Basin Street', city: 'Seaport' },
        ],
      },
      {
        name: 'North Shore',
        stores: [
          { name: 'Cliffside Provisions', address: '210 Ridge Road', city: 'Northport' },
          { name: 'Gull & Grain', address: '9 Lighthouse Way', city: 'Cape Rowan' },
        ],
      },
      {
        name: 'Inland & Metro',
        stores: [
          { name: 'Ironworks Bottle Bar', address: '1450 Foundry Boulevard', city: 'Midland' },
          { name: 'Cedar & Hop', address: '88 Market Square', city: 'Midland' },
          { name: 'Railcar Craft Cellar', address: '3 Depot Circle', city: 'Westfield' },
        ],
      },
      {
        name: 'Statewide chains',
        stores: [
          { name: 'Coastal Grocers (select stores)', address: 'Multiple locations', city: 'Statewide' },
          { name: 'Beacon Wine & Spirits', address: 'Regional chain', city: 'Statewide' },
        ],
      },
    ],
    trade: {
      heading: 'Distributor inquiries',
      body: 'We work with one distributor per territory. If you’d like Founding Fathoms on your trucks, tell us your territory, how many accounts you serve, and how you keep beer cold.',
    },
    photo: {
      src: stock('1769477145932-edd5a9d7567c'),
      alt: 'A driver unloading cases from a delivery truck onto a hand truck',
    },
  },

  shop: {
    eyebrow: 'Ship store',
    intro: 'Four-packs and gear, ordered ahead and picked up at the taproom.',
    products: [
      {
        id: 'harbor-lights-4',
        name: 'Harbor Lights IPA',
        category: 'Beer',
        pack: '4-pack · 16 oz cans',
        price: 16,
        description: 'West Coast classic. Pine, grapefruit, dry finish.',
      },
      {
        id: 'fog-bank-4',
        name: 'Fog Bank Hazy',
        category: 'Beer',
        pack: '4-pack · 16 oz cans',
        price: 17,
        description: 'Soft, juicy and low on bitterness.',
      },
      {
        id: 'keel-line-4',
        name: 'Keel Line Lager',
        category: 'Beer',
        pack: '4-pack · 16 oz cans',
        price: 15,
        description: 'Fresh helles, canned this week.',
      },
      {
        id: 'barnacle-berry-4',
        name: 'Barnacle Berry',
        category: 'Beer',
        pack: '4-pack · 16 oz cans',
        price: 16,
        description: 'Blackberry kettle sour, bright and tart.',
      },
      {
        id: 'winter-mooring-4',
        name: 'Winter Mooring',
        category: 'Beer',
        pack: '4-pack · 12 oz cans',
        price: 24,
        limited: true,
        description: 'Barrel-aged imperial stout. Bourbon oak and dark chocolate.',
      },
      {
        id: 'channel-marker-4',
        name: 'Channel Marker DIPA',
        category: 'Beer',
        pack: '4-pack · 16 oz cans',
        price: 20,
        limited: true,
        description: 'Resinous double IPA with orange oil.',
      },
      {
        id: 'mixed-4',
        name: 'Mixed Fresh 4-Pack',
        category: 'Beer',
        pack: '4-pack · 16 oz cans',
        price: 18,
        description: 'The brewer’s pick of what’s coming off the line.',
      },
      { id: 'work-cap', name: 'Work Cap', category: 'Apparel', price: 28, description: 'Washed cotton cap with an embroidered mark.' },
      {
        id: 'crew-tee',
        name: 'Brewhouse Crew Tee',
        category: 'Apparel',
        price: 32,
        description: 'Heavyweight navy tee with the batch stamp on the back.',
      },
      {
        id: 'pint-glass',
        name: 'Harbor Pint Glass',
        category: 'Glassware',
        price: 14,
        description: 'Nonic pint etched with the sounding-line mark.',
      },
      { id: 'tin-tote', name: 'Can Club Tote', category: 'Gear', price: 22, description: 'Waxed canvas tote sized for a monthly drop.' },
      { id: 'camp-mug', name: 'Enamel Camp Mug', category: 'Gear', price: 26, description: 'Speckled cream enamel with a stamped logo.' },
    ],
    pickupOptions: [
      { id: 'taproom', label: 'Pick up at the taproom bar' },
      { id: 'curbside', label: 'Curbside: call when you arrive' },
    ],
    paymentNote: 'Pay at pickup. Tax is added at the register.',
    minimumAge: 21,
  },

  contactPage: {
    eyebrow: 'Pier office',
    intro: 'Questions about the taproom, private events or press: send us a note and the pier office will answer within two business days.',
    topics: [
      { id: 'general', label: 'General' },
      { id: 'events', label: 'Events' },
      { id: 'private', label: 'Private hire' },
      { id: 'press', label: 'Press' },
    ],
    photo: { src: stock('1640130541949-aa5d40f9635d'), alt: 'An old roll-top desk and chair in a wood-panelled office' },
  },

  canClub: {
    eyebrow: 'Members',
    heading: 'Join the Can Club',
    intro:
      'Pick a plan and we’ll hold your drop for pickup each month. You’ll get an email when it’s ready, and you can skip or pause any month.',
    plans: [
      { id: 'monthly', label: 'Monthly', price: 20, cans: 4, cadence: 'every month' },
      { id: 'quarterly', label: 'Quarterly', price: 54, cans: 12, cadence: 'every three months', note: 'Saves $6 over monthly' },
    ],
  },

  footer: {
    blurb: 'Craft beer brewed on a working harbor. Unpretentious pours, honest process, cans that leave the line still cold.',
    stamp: { mark: 'FF–1847', label: 'Est. on the pier' },
    closing: 'Please drink responsibly, and recycle your cans.',
  },
};
