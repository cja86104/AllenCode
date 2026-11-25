import type { Restaurant } from './types';

/** Builds a stock-photo address at a given width. Replace with your own files in `public/` when you have them. */
const stock = (id: string, width: number) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

/**
 * The restaurant's content. This is the one file a buyer edits.
 *
 * The demonstration below is a fictional restaurant, The Copper Thistle. Its chef, address, reviews and
 * press quotes are invented for the template preview; the photographs are stock photography.
 */
export const restaurant: Restaurant = {
  site: {
    name: 'The Copper Thistle',
    tagline: 'Hudson Valley',
    description:
      'The Copper Thistle is a farm-to-table restaurant in the Hudson Valley, serving seasonal tasting menus built each morning from the local harvest.',
    demonstration: true,
    indexable: false,
  },

  contact: {
    street: '123 Harvest Lane',
    city: 'Rhinebeck',
    region: 'NY',
    postalCode: '12572',
    phone: '(845) 555-0192',
    email: 'hello@copperthistle.example',
    parking:
      'Complimentary valet Friday to Sunday after 5pm. Self-parking is available on Harvest Lane and in the municipal lot one block east.',
    social: {},
  },

  hours: {
    schedule: [
      { day: 0, opens: '16:30', closes: '21:00' },
      { day: 2, opens: '17:30', closes: '21:30' },
      { day: 3, opens: '17:30', closes: '21:30' },
      { day: 4, opens: '17:30', closes: '21:30' },
      { day: 5, opens: '17:00', closes: '22:00' },
      { day: 6, opens: '17:00', closes: '22:00' },
    ],
  },

  home: {
    hero: {
      eyebrow: 'Hudson Valley · Est. 2014',
      headline: ['Rooted in the', 'Land We Love'],
      intro: 'Seasonal tasting menus built each morning from what our farm partners harvest at dawn.',
      photo: { src: stock('1550966871-3ed3cdb5ed0c', 1920), alt: 'A candlelit dining room set for the evening' },
      action: 'Reserve a table',
    },
    signature: {
      eyebrow: 'Chef’s selection',
      heading: 'Signature Dishes',
      note: 'The menu changes with the season; these rarely leave the table.',
    },
    press: {
      eyebrow: 'In the press',
      quotes: [
        {
          quote: 'Every course felt like it was harvested that morning, because it was. The most honest fine dining we’ve found in years.',
          source: 'The Valley Table Review',
        },
        {
          quote: 'The Copper Thistle doesn’t just serve dinner. It tells the story of a valley, one plate at a time.',
          source: 'Rhinebeck Ledger',
        },
        {
          quote: 'Intimate, unpretentious and unforgettable. Elena Marchetti cooks like she means it.',
          source: 'Hudson Line Dining Guide',
        },
      ],
    },
    events: {
      eyebrow: 'Private events',
      heading: 'Gather Around Our Table',
      body: 'From intimate rehearsal dinners to milestone celebrations, our private dining room and chef’s table seat up to 24 guests beneath copper chandeliers, with menus built entirely around your story.',
      action: 'Plan your event',
      photo: { src: stock('1519671482749-fd09be7ccebf', 1200), alt: 'A long table set with glassware and candles for a private dinner' },
    },
  },

  menu: {
    eyebrow: 'Seasonal · Changes weekly',
    heading: 'The Menu',
    categories: [
      {
        id: 'starters',
        label: 'Starters',
        items: [
          {
            name: 'Heirloom Beet Carpaccio',
            description: 'Whipped chèvre, candied walnuts, aged sherry vinegar.',
            price: '$19',
            tags: ['vegetarian'],
            signature: true,
            photo: { src: stock('1512621776951-a57141f2eefd', 640), alt: 'A bright plate of sliced beets and greens' },
          },
          {
            name: 'Charred Octopus',
            description: 'Smoked paprika, fingerling potato, salsa verde.',
            price: '$22',
            tags: ['seafood', 'spicy'],
          },
          {
            name: 'Roasted Bone Marrow',
            description: 'Grilled sourdough, parsley and shallot salad, sea salt.',
            price: '$18',
            tags: ['gluten'],
          },
          { name: 'Autumn Squash Bisque', description: 'Brown butter, sage, toasted pumpkin seed.', price: '$14', tags: ['vegetarian'] },
          { name: 'Diver Scallop Crudo', description: 'Yuzu, finger lime, chili oil.', price: '$21', tags: ['seafood', 'spicy'] },
          { name: 'Wild Mushroom Toast', description: 'Taleggio, truffle honey, thyme.', price: '$17', tags: ['vegetarian', 'gluten'] },
          { name: 'Burrata & Stone Fruit', description: 'Basil oil, aged balsamic, flaky salt.', price: '$16', tags: ['vegetarian'] },
          { name: 'Duck Liver Mousse', description: 'Fig jam, brioche, pickled shallot.', price: '$20', tags: ['gluten'] },
        ],
      },
      {
        id: 'mains',
        label: 'Mains',
        items: [
          {
            name: 'Slow Roasted Lamb Shoulder',
            description: 'Charred eggplant, mint yogurt, pomegranate.',
            price: '$42',
            tags: [],
            signature: true,
            photo: { src: stock('1544025162-d76694265947', 640), alt: 'Roasted meat on a board with herbs' },
          },
          {
            name: 'Seared Hudson Duck Breast',
            description: 'Cherry gastrique, duck-fat potato, charred scallion.',
            price: '$38',
            tags: [],
            signature: true,
            photo: { src: stock('1432139555190-58524dae6a55', 640), alt: 'A plated main course with a glossy sauce' },
          },
          {
            name: 'Brown Butter Diver Scallops',
            description: 'Corn silk purée, brown butter, micro basil.',
            price: '$34',
            tags: ['seafood'],
            signature: true,
            photo: { src: stock('1580476262798-bddd9f4b7369', 640), alt: 'Seared scallops on a small plate' },
          },
          { name: 'Whole Roasted Branzino', description: 'Fennel, citrus, olive oil, herb salsa.', price: '$36', tags: ['seafood'] },
          { name: 'Dry-Aged Ribeye, 14oz', description: 'Bone marrow butter, roasted garlic, red wine jus.', price: '$52', tags: [] },
          {
            name: 'Wild Mushroom Risotto',
            description: 'Aged parmesan, truffle, chive oil.',
            price: '$27',
            tags: ['vegetarian'],
            signature: true,
            photo: { src: stock('1476124369491-e7addf5db371', 640), alt: 'A bowl of creamy mushroom risotto' },
          },
          { name: 'Braised Short Rib', description: 'Celery root purée, pearl onion, horseradish gremolata.', price: '$39', tags: [] },
          { name: 'Heritage Pork Chop', description: 'Apple mostarda, charred cabbage, natural jus.', price: '$33', tags: [] },
        ],
      },
      {
        id: 'garden',
        label: 'From the Garden',
        items: [
          { name: 'Roasted Root Vegetables', description: 'Whipped ricotta, hazelnut, herb oil.', price: '$16', tags: ['vegetarian'] },
          { name: 'Charred Broccolini', description: 'Chili crunch, lemon, garlic.', price: '$14', tags: ['vegetarian', 'spicy'] },
          { name: 'Farmers Market Salad', description: 'Seasonal greens, radish, sherry vinaigrette.', price: '$15', tags: ['vegetarian'] },
          { name: 'Truffle Fingerling Potatoes', description: 'Parmesan, rosemary.', price: '$13', tags: ['vegetarian'] },
          { name: 'Grilled Asparagus', description: 'Romesco, marcona almond, mint.', price: '$15', tags: ['vegetarian'] },
          { name: 'Heirloom Tomato Salad', description: 'Burrata, basil, aged balsamic. In season.', price: '$17', tags: ['vegetarian'] },
          { name: 'Sautéed Wild Greens', description: 'Garlic, chili flake, lemon.', price: '$12', tags: ['vegetarian', 'spicy'] },
        ],
      },
      {
        id: 'desserts',
        label: 'Desserts',
        items: [
          {
            name: 'Stone Fruit Galette',
            description: 'Vanilla bean chantilly, thyme honey.',
            price: '$14',
            tags: ['vegetarian', 'gluten'],
            signature: true,
            photo: { src: stock('1488477181946-6428a0291777', 640), alt: 'A rustic fruit dessert with cream' },
          },
          { name: 'Dark Chocolate Tart', description: 'Sea salt caramel, hazelnut crumble.', price: '$15', tags: ['vegetarian', 'gluten'] },
          { name: 'Bourbon Butterscotch Pudding', description: 'Whipped cream, toffee.', price: '$12', tags: ['vegetarian'] },
          {
            name: 'Farmhouse Cheese Board',
            description: 'Local honey, marcona almonds, seasonal preserve.',
            price: '$22',
            tags: ['vegetarian'],
          },
          { name: 'Olive Oil Cake', description: 'Citrus glaze, crème fraîche.', price: '$13', tags: ['vegetarian', 'gluten'] },
          { name: 'Maple Panna Cotta', description: 'Candied pecan, sea salt.', price: '$12', tags: ['vegetarian'] },
        ],
      },
      {
        id: 'wine',
        label: 'Wine & Spirits',
        items: [
          { name: 'Reserve Pinot Noir', description: 'Hudson Valley.', price: 'Glass $18 · Bottle $68', tags: [] },
          { name: 'Sauvignon Blanc', description: 'Finger Lakes.', price: 'Glass $14 · Bottle $52', tags: [] },
          { name: 'Copper Thistle Old Fashioned', description: 'Bourbon, thistle honey, orange bitters.', price: '$16', tags: [] },
          { name: 'Smoked Rosemary Negroni', description: 'Gin, Campari, sweet vermouth.', price: '$17', tags: [] },
          { name: 'Craft Cider, Local Orchard', description: 'Dry-hopped, barrel finished.', price: '$12', tags: [] },
          { name: 'Amaro Digestivo Flight', description: 'Three regional selections.', price: '$22', tags: [] },
        ],
      },
    ],
    notes: ['A 20% gratuity is added for parties of six or more.', 'Please tell your server about any allergies before ordering.'],
  },

  about: {
    eyebrow: 'Our story',
    heading: 'A Table Set by the Seasons',
    chef: {
      name: 'Elena Marchetti',
      title: 'Executive Chef & Owner',
      photo: {
        src: stock('1583394293214-28ded15ee548', 900),
        alt: 'A chef in whites at work in a professional kitchen',
        position: 'center 30%',
      },
    },
    quote: 'I don’t cook from a menu. I cook from what the farmers hand me at six in the morning, still warm from the field.',
    story: [
      'Elena Marchetti grew up on a fifth-generation apple orchard just north of Rhinebeck, where dinner was never a question of what she wanted, only of what the season allowed. After culinary training in Lyon and six years working the pass in kitchens across France and California, she came home with one conviction: the best meal in the world is the one closest to its source.',
      'The Copper Thistle opened in 2014 with a single promise. Every dish is built the morning it’s served, around whatever some forty local farms, foragers and fishmongers deliver at dawn. There is no standing menu, only a living one.',
      'Off the clock, Elena teaches seasonal cooking classes to local students and volunteers with a farmland preservation trust in the valley.',
    ],
    processHeading: 'In the kitchen',
    process: [
      { src: stock('1556910103-1c02745aae4d', 520), alt: 'Cooks working side by side at a kitchen pass' },
      { src: stock('1500937386664-56d1dfef3854', 520), alt: 'Rows of crops on a farm at harvest time' },
      { src: stock('1517248135467-4c7edcad34c4', 520), alt: 'A warmly lit restaurant interior' },
      { src: stock('1555939594-58d7cb561ad1', 520), alt: 'Skewers over an open flame grill' },
    ],
  },

  gallery: {
    eyebrow: 'Moments at the table',
    heading: 'Gallery',
    intro: 'A glimpse of the dining room, the pass and the plates that leave it, through every season.',
    photos: [
      { src: stock('1414235077428-338989a2e8c0', 720), alt: 'A dining table set for two with wine glasses', size: 'tall' },
      { src: stock('1432139555190-58524dae6a55', 720), alt: 'A plated main course with a glossy sauce', size: 'short' },
      { src: stock('1506377247377-2a5b3b417ebb', 720), alt: 'Wine bottles racked in a cellar', size: 'tall' },
      { src: stock('1466692476868-aef1dfb1e735', 720), alt: 'Herbs growing in a kitchen garden', size: 'short' },
      { src: stock('1577106263724-2c8e03bfe9cf', 720), alt: 'A chef finishing a plate with tweezers', size: 'medium' },
      { src: stock('1509440159596-0249088772ff', 720), alt: 'Freshly baked loaves of bread', size: 'short' },
      { src: stock('1592861956120-e524fc739696', 720), alt: 'A dining room in the evening, lit by pendant lamps', size: 'tall' },
      { src: stock('1470337458703-46ad1756a187', 720), alt: 'A cocktail being poured at the bar', size: 'short' },
      { src: stock('1587314168485-3236d6710814', 720), alt: 'A plated seasonal dessert', size: 'medium' },
    ],
    strip: {
      heading: 'Follow the Harvest',
      photos: [
        { src: stock('1519708227418-c8fd9a32b7a2', 600), alt: 'Fresh fish on ice' },
        { src: stock('1560785496-3c9d27877182', 600), alt: 'A basket of just-picked vegetables' },
        { src: stock('1414235077428-338989a2e8c0', 600), alt: 'A dining table set for two with wine glasses' },
        { src: stock('1590794056486-16a133ae4bb0', 600), alt: 'Copper pots hanging in a kitchen' },
        { src: stock('1600891964092-4316c288032e', 600), alt: 'A steak dinner on a patio at golden hour' },
        { src: stock('1551024506-0bccd828d307', 600), alt: 'A close-up of a plated dessert' },
      ],
    },
  },

  reservations: {
    eyebrow: 'Join us',
    heading: 'Reservations',
    note: 'Tables are held for 15 minutes past the reservation time.',
    bookingWindowDays: 60,
    largestParty: 12,
    lastSeatingMinutes: 60,
    slotMinutes: 30,
    ambiance: {
      eyebrow: 'Beyond the table',
      heading: 'Host With Us',
      body: 'Our chef’s table and private room welcome up to 24 guests for celebrations built entirely around your occasion.',
      action: 'Inquire about an event',
      photo: { src: stock('1464366400600-7168b8af9bc3', 1000), alt: 'Guests raising glasses at a private celebration' },
    },
  },

  privateEvents: {
    eyebrow: 'Private events inquiry',
    heading: 'Plan a Gathering',
    capacity: 24,
    occasions: ['Wedding celebration', 'Corporate dinner', 'Birthday', 'Anniversary', 'Holiday party', 'Other'],
    received: 'Our events team will reach out within one business day to start planning.',
  },

  contactPage: {
    eyebrow: 'We’d love to hear from you',
    heading: 'Contact',
    reviewsHeading: 'What guests are saying',
    reviews: [
      {
        name: 'Margaret H.',
        location: 'Poughkeepsie, NY',
        rating: 5,
        quote: 'The most thoughtful tasting menu we’ve had outside of the city. Every course had a story.',
      },
      {
        name: 'David R.',
        location: 'Hyde Park, NY',
        rating: 5,
        quote: 'Warm, unhurried service and a wine list that actually matches the food. We’ll be back for our anniversary.',
      },
      {
        name: 'Priya S.',
        location: 'Kingston, NY',
        rating: 4,
        quote: 'Booked the chef’s table for a birthday and it was worth every penny. The duck breast still haunts me.',
      },
      {
        name: 'Tom & Lily W.',
        location: 'Millbrook, NY',
        rating: 5,
        quote: 'You can taste that everything was picked that morning. Best restaurant in the valley, full stop.',
      },
      {
        name: 'Isabelle C.',
        location: 'Beacon, NY',
        rating: 5,
        quote: 'We hosted our engagement dinner in the private room. The staff made it feel effortless and personal.',
      },
    ],
  },

  newsletter: {
    heading: 'Taste the Seasons First',
    body: 'Join our table list for early word on seasonal menus, harvest dinners and private event dates.',
  },

  footer: {
    about: 'An intimate, farm-driven dining room in the heart of the Hudson Valley, where the harvest writes the menu every single day.',
  },
};
