# Code World: the inner pages' word roads — design

Date: 2026-11-17. Asked for by Chris: "in the inner sections (products, servics, templates... all of
them) … i want those boards gone and just have the path leading forward like it is but just have the
one screen at the end. i want it to be shorter as well just so it shows that frame at the end … for
these sections of road i want the moving text in the road using multiple small to make bigger letters
and i want it to spell out what it is … running forward so you just see the road with the screen at the
end and that word for what section being the scrolling road."

His answers:
- **Word order:** "First letter farthest" (it reads top to bottom on screen).
- **Road fill:** "Only the word" (with the green and orange edges).
- **A product's page:** "The product's name".

## What was built

- **One screen.** Every stretch (Products, each product page, Services, Templates, About, Contact) has
  one stop, its lead, standing across the end of a straight road 26 units down (`STRETCH_LEAD_AT`), so
  its screen is in view from the start. There are no boards beside the road.
- **Shorter.** A stretch is one screen of scroll (was 1.5): half a screen driving to the screen, then
  the landing from 0.55. The space held before the first paint (W6) is one screen too.
- **The word road.** The page's word lies along the road in big letters:
  - each a 5×7 dot-matrix letter, each lit dot a 4×4 cluster of the road's characters, about a third
    in the road's colours;
  - the first letter farthest;
  - shrunk together to fit the road from its origin to 2 units short of the screen;
  - the words: PRODUCTS, SERVICES, TEMPLATES, ABOUT, CONTACT, or the product's name in capitals
    (`wordFor`).
- **Running forward.** The letters run forward together on one belt (a negative loop in the renderer:
  every character moves the same distance and wraps at the belt's ends, fading in and out there), so
  they stay whole.
- **Read from above.** The camera starts the drive higher (3.4, looking down onto the road ahead)
  instead of at eye height, because at eye height the letters were too edge-on to read. It comes to
  rest on the screen as before.
- **Its own chunk.** The inner pages' world (`stretchWorld.js` and what only it uses) loads as its own
  chunk as soon as the world mounts. The home page no longer carries it, and nothing is drawn on an
  inner page until it is there. The world layer chunk is 9.06 kB (was 11.90), the inner pages' 4.57 kB.

## My calls

- **The letters' size:** 3.2 units long and 2.6 wide, with a 0.9 gap, stretched along the road like a
  painted road marking.
- **The camera height for the drive (3.4) and the 4×4 dot clusters:** chosen from screenshots (at 3×3
  and eye height the letters broke up).
- **The belt wraps where its distance along the road is a whole number of loops,** so the word starts
  at the road's origin.
- **The road scatter and the side boards are gone from the inner pages only.** The home road is
  unchanged.
