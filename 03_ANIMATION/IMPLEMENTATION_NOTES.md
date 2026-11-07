# Implementation: PNG layers vs continuous 3D

**Assets available:** one standalone pizza hero, one generated composite «ingredient explosion» reference, 12 transparent ingredient sprites, two large food cutouts, background textures, smoke sprite, open-box composite, low-res isolated döner spit.

**What is physically possible immediately:** GSAP scripted 2.5D sprite choreography, perspective camera illusion on a plane, type changes, pop/fall, yufka roll, mask-based box reveal, gentle smoke, scalable high-impact product reveal.

**What is not physically accurate yet:** natural rope-like cheese strands growing continuously from each attached flying topping; exact same pizza texture from all camera angles; true vertical 360° döner spit rotation; actual hinged lid opening. These require manually matched asset layers, 3D modeling or a pre-rendered animation. Do not bluff the client.

**Hero layering suggested:** `.hero__base` (pizza), `.hero__smoke` (translucent effects), `.hero__topping` each absolute and independently tracked. On the initial state sprites should align with known topping locations on the pizza; if exact match not available, add floating toppings as foreground and keep baked hero pizza still to avoid impossible double layers. At scene D introduce an editorial cut (whip pan/mask) to second shot rather than false 3D rotation of a 2D photograph.

**Asset optimization:** keep original PNG source and build compressed AVIF/WebP for live site; remote-free `next/image` or raster where necessary; never convert background with alpha to opaque. `backgrounds/charred_wood_provisional.jpg` is upscaled crop and must be inspected at 1440px; consider CSS grain/overlay to hide low-resolution grain.

**Fonts**: next/font/google Oswald, Roboto Condensed, Manrope, ensuring Cyrillic. No bundled font binaries.

**License**: GSAP standard no-charge license covers typical commercial sites as of Nov 2026; check current official license at https://gsap.com/standard-license before production. Fonts from Google Fonts under appropriate open-source licenses; do not export binary font files to client. No paid MCP, animated template or subscriptions.
