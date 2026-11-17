# Code World W7: retirement, as decided — design

Date: 2026-11-17. Parent: `2026-11-10-code-world-design.md`, phase W7 ("Retirement: the pinned flight
chapters, their timelines and the flat code field that the world replaced; `/lab/world` removed").
Decided by Chris (2026-11-17):
- "Plain view": "Keep the animated plain site". So the flat code field and the pinned flight chapters
  stay, as the site a visitor gets with the world switched off.
- Checkout success and the 404 page: "Their own word road".

## Goals

1. **Remove the lab.** Delete `/lab/world` (its page, its route, its chunk's budget line, the robots.txt
   lines for `/lab/`) and the code only it uses:
   - `src/world/stops.js`;
   - `resolveAt` in `landmark.js`;
   - the canvas's single-scene mode (`getProgress`, `keys`, `landmarkResolve`, `onFrame`): the canvas
     draws only the home's world and the stretches.

   Three of its browser checks cover the shared engine and move to the home page's tests: the atlas's
   exact font loaded before the first frame, the frame meter, and the canvas following a resize.
2. **Word roads for the last two pages.**
   - Checkout success spells THANK YOU, and the 404 page (any unknown address) spells LOST.
   - Each ends at the empty file's slab, whose code lands as the page's headline.
   - The landing follows the headline's own alignment (these two are centred).
   - The space is held before the first paint where the address is known (`/checkout-success`). The 404
     page's address cannot be known before the app runs, so it is measured.

## Non-goals

- The field, the pinned chapters and their timelines stay ("Keep the animated plain site").
- No change to the home road or the other stretches.

## My calls

- **The empty file as both pages' screen,** as on Contact.
- **The word "LOST"** for 404 (Chris's option text); **"THANK YOU"** for checkout success.
