# Eyewall Labs

A spinning typhoon of rectangular media tiles. Geometry is deterministic; tile faces share one baked atlas so a few hundred screens cost one image decode.

## Local

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:47281](http://127.0.0.1:47281). Tune seed, spin, tilt, and counts in the leva panel.

## Deploy

This is a **Vite** app (`npm run build` → `dist/`), not Next.js. Vercel must use the Vite framework preset. `vercel.json` sets `framework`, `buildCommand`, and `outputDirectory` so a leftover Next.js project setting cannot fail the build.

## Tile media

Nothing inside a tile is live. There are no iframes, videos, or per-tile network requests.

- `public/media/atlas.webp` (~130 KB) is an 8×8 sprite of 64 stills.
- Each tile CSS-crops one cell from that file (`src/storm/media.ts`). The browser decodes the atlas once and paints it many times.
- **Video / art:** NASA public-domain stills (city lights, nebulae, Earth) plus Wikimedia public-domain paintings (van Gogh, Hokusai, Monet, Munch, Friedrich).
- **Dashboard / chart / code:** drawn in `scripts/build-atlas.py` (KPI cards, bars, donuts, heatmaps, editor chrome). Not product screenshots.
- **News / UI:** fake mastheads (`THE SIGNAL`, `WIRE CUT`, …) composited over those stills, plus a browser-chrome frame.

Credits: `public/media/SOURCES.md`. Rebuild the atlas with `python3 scripts/build-atlas.py`.

## Layout

- `src/storm/geometry.ts` — pure math (PRNG, spiral, tangent, zones)
- `src/storm/params.ts` — defaults
- `src/storm/generate.ts` — seed + params → `Tile[]`
- `src/storm/spin.ts` — differential spin, DOM transforms only
- `src/storm/media.ts` / `Tile.tsx` — atlas crop + billboard
- `src/storm/StormField.tsx` — field + optional debug rings
- `src/App.tsx` — leva controls
