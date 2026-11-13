# Asset sources

## WhatsApp iPhone app icon

- File: `whatsapp-ios.jpg` (512 × 512).
- App: WhatsApp Messenger, App Store ID 310633997, seller WhatsApp Inc.
- Listing: https://apps.apple.com/in/app/whatsapp-messenger/id310633997
- Metadata: https://itunes.apple.com/lookup?id=310633997&country=in
- Artwork URL returned by Apple: https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/15/eb/39/15eb3965-bec3-4737-950a-9d9df5303e93/AppIcon-0-0-1x_U007epad-0-0-0-1-0-0-sRGB-0-85-220.png/512x512bb.jpg
- Retrieved: 7 November 2026. Original artwork is unedited; CSS supplies rounded corners at display size. Used to identify the WhatsApp chat action. Brand artwork belongs to its respective owner.

The NextPath logo is from the owner-supplied Phase 1 reference. Font licence/source files are under `fonts/`.

## Transparent WhatsApp mark — review.14

Current buttons use `whatsapp-mark.png` (128 × 128 with alpha), rendered from `whatsapp-mark.svg`, a white WhatsApp mark from Simple Icons: https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/whatsapp.svg . SVG rendered using resvg-py in a temporary tool environment; no raster background removal. The earlier App Store artwork remains for provenance and is no longer displayed. WhatsApp brand/trademark rights remain with their owner.

## Manrope

Variable font from Google Fonts: https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/Manrope%5Bwght%5D.ttf . Locally hosted in `fonts/Manrope.ttf`; SIL Open Font License in `fonts/Manrope-LICENSE.txt`. Used for guidance actions, with existing Malayalam fallback.

District ordering reference: Kerala State Disaster Management Authority district plans, https://sdma.kerala.gov.in/ddmp/ .

## Baloo Chettan 2 conjunct repair

Source: [Ek Type variable font](https://github.com/EkType/Baloo2-Variable/blob/master/fonts/variable/BalooChettan2%5Bwght%5D.ttf). Upstream SHA-256: `8f0de4f81b40d314a129c55a3a9e58411868ca9a452edb57537488853f46db86`. The bundled OFL license remains in `fonts/BalooChettan2-LICENSE.txt`.

Reproduce with `python3 scripts/repair-malayalam-font.py ORIGINAL.ttf 08-PRODUCT-PREVIEW/assets/fonts/BalooChettan2.ttf` using FontTools. The repair adds the existing default `akhn` feature reference to the `MAL ` language records under both `mlm2` and `mlym`. Only the GSUB table and the font checksum change.
