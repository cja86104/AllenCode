# Code World: the hollow mist — design

Date: 2026-11-17. Asked for by Chris: "yes lets try the fog option but it has to be unique and nice not
simple. it must go with this." From three styles tried in the real renderer (screenshot sheet: Hollow
mist, Ember dusk, Signal haze), Chris chose: "i don't like the orange. i want to do hollow mist".

## Intent

A fog you can see, which belongs to this world: a cool, moonlit mist lying on the low ground, pooling
between the hills and drifting slowly, the crests, the road's code and the landmarks rising out of it.
Far off, the code sinks into the mist's colour as it fades, rather than simply going black.

## Goals

- **The mist on the ground.** Cool (#80A8CC, the colour of the spike's mist), drifting slowly. It is
  thickest on the low ground and gone above about 3.8 units, so crests rise clear of it. It thins away
  near the camera, so nothing in front of you is veiled, and fades out past the fog's far edge.
- **The horizon band.** A faint band of the same mist along the horizon, behind the ground, with the
  same slow movement.
- **Far code.** It tints toward the mist's colour, by just over half, as it fades with distance.
- **Where it shows.** The mist comes with the ground: hidden while the gate plays, it fades in as the
  world's own file shows. It is on the home page's roads only (the opening, both roads and the shared
  road).

## Non-goals

- No orange (Chris: "i don't like the orange").
- No mist on the inner pages' stretches, which have no ground.
- No change to the road, the landmarks, the camera or the ripples.

## Anti-goals

- Mist over the words of a chapter at rest: the scrim and the words stay as they are, and the mist is
  faint (at most 0.26 on the ground and 0.11 in the band).
- A gate that is not clean.

## Approaches (tried in the real renderer)

1. **Hollow mist (chosen).**
2. Ember dusk: a warm horizon glow with wisps. Rejected: orange.
3. Signal haze: a grey terminal haze with scanlines. Not chosen.
4. Mist with an ember glow behind it. First chosen, then dropped for the orange.

## The how (my calls)

- **The ground's shader adds the mist,** from fractal noise over the ground drifting with time, times
  how low the ground is, times its distance from the camera. A backdrop pass, drawn before the ground,
  gives the horizon band from the camera's ray through each pixel.
- **The renderer tints far code** into a colour passed with each frame (`haze`), so the stretches, which
  pass none, are unchanged.
- **The values are the spike's:** ground mist 0.26, band 0.11, deep haze 0.05, tint 0.55, drift 5e-5 /
  2e-5 units per ms.
