# Eyewall Labs

Official website for **Eyewall Labs**. The live page is a single-line placeholder while the domain is pointed at Vercel.

## Local

```bash
npm install
npm run dev
```

## Deploy

Pushes to `main` on [github.com/pytseng/eyewall-labs](https://github.com/pytseng/eyewall-labs) deploy to [eyewall-labs.vercel.app](https://eyewall-labs.vercel.app).

To use a custom domain, add it in the Vercel project under **Settings → Domains**, then create the DNS records Vercel shows at your current registrar. Typical values:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `76.76.21.21` |
| CNAME | `www` | the CNAME target shown in Vercel (often `cname.vercel-dns.com`) |

Keep existing MX records if you use email on that domain. Do not switch nameservers unless you want Vercel to manage all DNS.
