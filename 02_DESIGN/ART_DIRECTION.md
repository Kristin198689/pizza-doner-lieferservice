# ART DIRECTION — BOLD CINEMATIC STREET FOOD / EDITORIAL

**Master reference:** `../06_ASSETS/references/HERO_APPROVED_SCREENSHOT_IMG_1945.jpeg`. Design lead must inspect it visually; it is NOT a production hero image.

## Three visual ingredients
1. **Cinema** — almost black stage, enormous photoreal hot food, volumetric backlight, steam and atmosphere, but no animated glitter overload.
2. **Street poster** — blocky oversized uppercase headings, urgent striking red italic accent, a hint of custom underlining and cropped text, punchy rather than cartoonish.
3. **Editorial whitespace** — strong grid, generous negative space, few elements per section. The previous mockups felt too crowded: new layout MUST be more spacious.

## Colors
- `ink #09090B` core dark; `inkRaised #171719`; `warmWhite #F6F2E9`; `red #F21D32`; `yellow #FFBF36`; `lime #C9FF27` (only 1-2 high-impact scenes); `kraft #C79A68`; subdued silver body `#C6C6C2`.
- Rich red CTAs; yellow only for tiny markers; lime one full-block editorial impact.
- Dark charcoal wood: use only select background passages, NOT as repetitive background on all sections.
- No washed-out pastels, beige UI cards, SaaS gradients, purple-blue glass effects.

## Fonts
- Display primary **Oswald, weight 700**, uppercase, compact leading; supports German, English, Ukrainian Cyrillic.
- Motion punch: **Roboto Condensed, 900 italic** for red emphasis; CSS skew/underline can add street-poster energy. Supports Ukrainian.
- UI body: **Manrope, 400/500/600/700**, accessible and neutral. Supports Cyrillic.
- In implementation: `next/font/google` with subsets `latin` + `cyrillic` where supported, fallback stacks; never bundle or distribute commercial font binaries in ZIP.

## Layout & spacing
- Desktop content max-width 1520, gutters clamp(24px, 4vw, 84px).
- Header height 72–88px. Hero a full viewport stage at desktop with large left copy around 40% and pizza visual ~60%.
- Desktop section top/bottom: 112–176px. Tablet 80–112px. Mobile 64–88px. More negative space than the previous visuals.
- Editorial asymmetric 12-col structure; microcaptions 10–12px letter-spaced; heroic headlines clamp(72px, 11vw, 196px) but avoid horizontal overflow.
- Use maximum one large hero object per shot plus supporting small details. On card-like menu, prefer horizontal magazine-like rows/tabs, not small repeated boxes.

## Distinct sections
- Hero: pure black/smoke, red/white giant typography, floating ingredient choreography.
- Transition: near-black with one red line and massive white wording, camera shift.
- Product runway: split pane with food images overlapping dark negative space.
- Box: cinematic warm cardboard and opening reveal, steam from hot pizza.
- Lime: loud neon-lime full-bleed section with almost black headline and yufka roll-in.
- Menu: calm warm-white/kraft surface; minimalist horizontal list rows; price placeholders hidden until supplied.
- Delivery: charred timber, oversized red phone call button, real information.
- Final CTA: black+kraft paper bag, typography like food-delivery poster.

## Interaction
- Motion is smooth and purposeful, no excessive random bounce. A small ease-out settling of ingredients on landing is good.
- Hover on food categories: gentle 2–4° tilt / parallax, accessible fallback.
- Scrolling transitions tied to visual story without forcing every user through a 10s animation. On mobile use reveal-based sequence not forced enormous pin distance.
- Navigation and contact always visible and fast. 44px touch targets. Focus visible and semantic `button`/`a`.

## Critical food visual rules
- Chicken, beef, fresh vegetables; no bacon and no pork.
- Existing salami-like PNG must be treated as generic design illustration, not evidence of halal beef/turkey. Replace or approve before public launch.
- No fabricated halal certification or unsupported promises about sourcing.
