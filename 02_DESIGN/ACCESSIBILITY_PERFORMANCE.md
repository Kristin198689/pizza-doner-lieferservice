# Accessibility and performance acceptance

- Scroll as normal: no body overflow lock, no custom wheel listener or forced scroll smoothing.
- `prefers-reduced-motion` branches to static/quick fades with CTA still visible.
- Desktop motion 60fps target on ordinary devices; profile 390x844 mobile iOS; keep 3D-like perspective mostly CSS transforms/opacity.
- Use compressed product WebP/AVIF where possible, but transparent PNG originals in source assets untouched.
- Visual tests: 360×740, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080. No overlaps, no giant cut-off heading, visible language switcher.
- Strong contrast; 44px+ tap targets; focus outlines; semantic landmark nav/main/footer; images meaningful alt; avoid background content with no textual equivalence.
- Menu should not depend on animation to be usable; call option visible in every locale.
- Fonts loaded via next/font, prevent FOUT-induced layout shift; check heading lengths in Ukrainian.
- No false links/clickable disabled CTA. Actual phone only after filled config.
