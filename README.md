# hello-kkt-kitchen

Mobile-first digital menu for **KKT kitchen**. Printed and shared QR codes open the public **`/menu`** page in the browser—they do not dial Chef James directly.

## Local preview

```bash
npm install
npm run preview
```

Open [http://localhost:4173/menu/](http://localhost:4173/menu/). (The local static server does not apply `vercel.json` redirects; use `/menu/` explicitly.)

## Editing the menu

Change prices and items only in [`public/data/menu.json`](public/data/menu.json). Do not hard-code menu rows in HTML—the page loads JSON at runtime.

Business copy, hours, payment text, and contact links also live in `menu.json` under `business` and `contactLinks`.

## Deploy to Vercel

1. Import this repository into Vercel with project name **`hello-kkt-kitchen`**.
2. **Framework preset:** Other (static site, no build command).
3. **Root Directory:** set to **`public`**. The site files (`menu/`, `data/`, `assets/`, etc.) live under `public/`; there is no `outputDirectory`—the root directory *is* the deploy root.
4. Leave **Build Command** empty and **Output Directory** empty.
5. [`vercel.json`](vercel.json) at the repository root configures production behavior (permanent `/` → `/menu/` redirect and short cache on `/data/*`). Vercel reads this file from the repo root even when Root Directory is `public`.
6. Deploy. Confirm **`https://hello-kkt-kitchen.vercel.app/menu/`** (or your assigned URL) loads the menu.

## After the first deploy: `baseUrl` and QR

1. Open [`public/js/config.js`](public/js/config.js) and set `baseUrl` to your real production origin (no trailing slash), e.g. `https://hello-kkt-kitchen.vercel.app`.
2. Regenerate QR assets:

   ```bash
   npm run generate:qr
   ```

   Optional override: `BASE_URL=https://your-domain.example npm run generate:qr` (localhost is refused).

3. Commit the updated `config.js` and `public/assets/qr/*`, then redeploy.

QR files encode **`{baseUrl}/menu`** (no trailing slash). Download links on the menu page point at the generated SVG/PNG.

## Permanent URL and redirects

- Keep a **stable** Vercel project name or attach a **custom domain** so printed QR codes stay valid.
- The menu URL customers should use is **`/menu`** (and `/` redirects to `/menu/` in production).
- If the public hostname ever changes, add a **redirect from the old origin to the new `/menu/`** (Vercel project/domain settings or `vercel.json` on the old host) so existing printed codes keep working without reprinting.

## QR workflow (summary)

| Step | Action |
|------|--------|
| First deploy | Ship with placeholder or default `baseUrl` |
| Set production URL | Edit `public/js/config.js` → `baseUrl` |
| Regenerate | `npm run generate:qr` |
| Redeploy | Push and deploy so `public/assets/qr/` updates |

## Repository layout

| Path | Purpose |
|------|---------|
| `public/menu/index.html` | Menu shell page |
| `public/js/app.js` | Fetches menu JSON, renders UI, error fallback |
| `public/data/menu.json` | Menu and business data |
| `public/assets/qr/` | Generated QR SVG/PNG |
| `scripts/generate-qr.mjs` | QR generator |
| `vercel.json` | Production redirects and cache headers |
