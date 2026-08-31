# Eyewall Labs

Static top-down typhoon of rectangular media tiles. No animation. Tune geometry with the leva panel.

## Local

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:47281](http://127.0.0.1:47281).

## Deploy

This is a **Vite** app (`npm run build` → `dist/`), not Next.js. Vercel must use the Vite framework preset. `vercel.json` sets `framework`, `buildCommand`, and `outputDirectory` so a leftover Next.js project setting cannot fail the build.

## Layout

- `src/storm/geometry.ts` — pure math (PRNG, spiral, tangent, zones)
- `src/storm/params.ts` — defaults
- `src/storm/generate.ts` — seed + params → `Tile[]`
- `src/storm/StormField.tsx` / `Tile.tsx` — DOM render
- `src/App.tsx` — leva controls

Toggle `showDebugRings` and `showBandCurves` to check whether tiles sit on the spirals.
