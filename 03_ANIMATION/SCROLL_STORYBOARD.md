# Scroll storyboard — shots, transitions, responsive motion

This is a concrete motion sequence, not a collection of random parallax effects.

## Hero — desktop: THREE narrative beats over approximately 2.4–3.2 viewport lengths (refine by real-device testing)

| Scene | Nominal scroll progress | Camera/food | Typography | Notes |
|---|---:|---|---|---|
| A Opening shot | 0–15% | Huge complete pizza, stage right; persistent steam | Left block title, red action word, clear CALL CTA | Composition match IMG_1945; no busy particles |
| B Ingredient lift | 15–38% | 10–18 separated topping sprites rise 80–260px with rotation; a few cheese/stretch wisps; subtle smoke | Text mostly stable, microcaption changes | Individual sprites move, don't fake using global image crossfade |
| C Ingredient fall | 38–57% | Ingredients descend on easing curves to registered landing spots; slight 0.98→1 scale settle | Red word shifts / line slides | Land at matching coordinates; avoid scatter at bottom |
| D Camera pivot | 57–78% | Perspective illusion (rotateY ~8–14deg + pan + scale), smoke drifts; change to close-up or distinct food shot with matching perspective | Headline dissolves/moves to new SHORT editorial text, not all text at once | If actual continuous 3D unavailable, use cinematic shot-cut with occlusion, **not pretend to be physical 3D** |
| E Next shot & exit | 78–100% | Giant pizza slice with cheese pull / alternative pizza shot moves to foreground; exiting food reveals next section | New text appears; call CTA remains accessible | Responsive mobile optimized |

### Mobile changes
- Hero no sticky-long 3D scroll trap. Deliver A→B→C with short scroll/well-timed autoplay after first interaction, or split short intersection-based sequences; preserve ability to reach menu with one/two swipes.
- 6–9 large individual topping sprites instead of 18; no heavy blur shaders; stable height and render path.
- Prefer motion-reduced immediate scene with static pizza and CTA when OS motion reduction enabled.
- For tablet, preserve composition with headline above/left; never overlap critical CTA.

## Next scene — Yufka roll-in
- Massive photo from `food/yufka_wrap.png` enters from right side; `x: 110vw → 0`, small rotation -16° → 0°, soft deceleration as it crosses a visually oversized title.
- Background one **acid lime** field, black text and minimal UI. Avoid obstruction of button and readable copy.
- Product shot must remain crisp and not repeat as three tiny cards.

## Pizza-box reveal
- From black to warm kraft paper through a top-to-bottom masked `clip-path` or high-quality CSS transition: the feel of a pizza-box lid lifting.
- `packaging/pizza_box_open_steam.png` is one composite asset and cannot physically hinge. For authentic animation, create distinct box lid/base sprites or 3D mesh (we have only a provisional single PNG).
- Smoke soft overlay independent of box. A subtle folded paper edge and shadow sells effect better than random transitions.

## Döner spit scene
- `food/doner_spit_provisional.png` is only a FRONT PNG. A flat `rotate(360deg)` tilts it like a clock, which is incorrect; do NOT fake vertical spin that way.
- Initial phase use a small 3–5deg hover/tilt and staged firelight flicker. For real continuous yaw request GLB or 12/16/24 turntable photos with same lighting/axis and animate sequence.

## Menu and footer
- Menu entering split mask, type reveal by line, minimal product hover (not huge scroll pinned menu).
- Delivery/pickup two clear paths. Paper bag composition in final CTA. Keep button static, easy to click.

## Technical recipe
- GSAP with `ScrollTrigger` + `@gsap/react/useGSAP` scoping/cleanup, `gsap.matchMedia()` for desktop/mobile/reduced motion.
- Only animate transforms/opacity; avoid layout properties/large filters. Pre-calculate top coordinates; call refresh once fonts and hero images load.
- Manage pointer events with header layering; no scroll blocking; maintain browser back/forward and anchor links.
- Explicit acceptance: at viewport widths 360, 390, 768, 1024, 1440, 1920 no clipping/misaligned labels, smooth native scrolling, visible CTA, robust fast-swipe handling.
