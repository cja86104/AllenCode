# Code World: the long family road — design

Date: 2026-11-17. Asked for by Chris: "as for business side you nailed it. perfect length good spacing …
extend the family side as well. just like you did for business. since it is a longer path you can keep
some steep hills in it … the longer family road will also leave me room to add to it in the future."
Hills: "Mix: one tall, then rolling." Then: "with curves of course"; curves: "Corners + gentle bends."

## Intent

The family road gets the business road's length and spacing: one landmark in view at a time, room
between stops, and room to add stops later. Unlike the business road's gentle hills, it keeps steep
ground, because on a long road the hills come between landmarks rather than on top of them.

## Goals

- The family road's stops are 42 units apart, as the business road's are (3 × `ROAD_STEP`), with 240vh
  of page between them.
- Between each pair of stops the ground alternates: one tall hill (7 units), then rolling ground
  (two 2.5-unit hills; three were too narrow for the camera to ride, see below), and so on. Every stop still sits in a hollow at height 0.
- The family road's two 35° corners stay where they are (after Hearth, and back before Done for you),
  and each turns over the same share of its stretch as it does today.
- Every other stretch bends gently, 12° either way, alternating, so the long road curves all along
  without copying the business road's steady winding.
- The whole family road fits each tier's budget, drawn only around the camera, with each landmark
  keeping about as many glyphs as it has today.

## Non-goals

- No change to the business road, the opening, the fork, the bend, the shared road where the roads
  meet, or the inner pages' stretches.
- No new stops. The length only leaves room for them.

## Anti-goals

- A hill so steep that the camera jumps: no 4 px of scroll may move the eye more than 0.15 (the same
  test as today).
- A landmark half-hidden behind a crest while it is resting in view.

## Approaches

1. **Alternate tall and rolling (chosen by Chris).** One 7-unit hill, then two 2.5-unit hills, gap by
   gap. Each tall hill's steepest slope (π·7/42 ≈ 0.52) matches today's family hills (π·2.5/14 ≈ 0.56),
   and so does each rolling hill's.
2. Taller hills in every gap: every stretch would be the same, and every crest would hide the next
   landmark.
3. Three rolling hills in every gap: the same steepness as today, but with no variety along the road.
4. Gentle hills, as on the business road: not steep.

## The how (my calls, each open to correction)

- `roadStepFor('b')` returns 42, as `roadStepFor('a')` does, and the page between family stops is
  240vh. The lab's journey stretches each family stop's timing the same way it already does for business.
- The ground between stops is a function of which gap it is in: even gaps (the first, third, …) get
  the tall hill, odd gaps the rolling ground. Two rolling hills, not three: the camera's travel is keyed
  every tenth of a stretch, and over three hills its eye drifted 0.28 off its height (limit 0.15); finer
  keys break the never-jumps limit. Both are flat at each stop. Before the first stop and after
  the last, it eases in and out as today.
- Each corner turns over 12/14 of its stretch's length (36 units), so it keeps today's flow; the
  business road has no corners and is unchanged.
- A bend is a 12° swing of the heading over a stretch ((1 − cos 2πf)/2 over the stretch, flat at both
  ends, the sign alternating by stretch, nothing at each stop), only in stretches without a corner, eased in and out as the hills are.
  At each stop the heading is the road's own, so each landmark still faces the road.
- `WORLD_SCALE.b` is set by measurement, as it was for business: each family landmark keeps about its
  current glyph count, the opening stays full, and no cut holds more than the tier's budget.

## Left to the builder

The exact `WORLD_SCALE.b` values, from the measurement.
