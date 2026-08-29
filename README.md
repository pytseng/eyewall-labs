# Eyewall Labs

Official website for **Eyewall Labs** — a retro CRT scope holding the channel until the archive fills.

This first slice is a single-page placeholder: phosphor HUD, scanlines, and a live radar motion graphic of a forming eyewall.

## Local

```bash
npm install
npm run dev -- --port 47281
```

Open [http://127.0.0.1:47281](http://127.0.0.1:47281).

## Production

```bash
npm run build
npm run start -- --port 47281
```

## Deploy

The site is a standard Next.js app. On [Vercel](https://vercel.com):

```bash
npx vercel
```

Or import the GitHub repository in the Vercel dashboard. No environment variables are required.
