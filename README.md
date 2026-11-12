# hello-kkt-kitchen

Mobile-first digital menu for **KKT kitchen**. Printed and shared QR codes open **`https://hello-kkt-kitchen.vercel.app`** (which redirects to the menu)—they do not dial Chef James directly.

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
5. [`public/vercel.json`](public/vercel.json) configures production behavior (permanent `/` → `/menu/` redirect and short cache on `/data/*`). With Root Directory set to **`public`**, Vercel reads `vercel.json` from that folder—not the repository root.
6. Deploy. Confirm **`https://hello-kkt-kitchen.vercel.app`** opens the menu (via `/` → `/menu/`).

### Deployment accounts

GitHub: **karan650gg/hello-kkt-kitchen**. Vercel: **karan650gg/hello-kkt-kitchen**. For push-to-deploy, run `npx vercel git connect` with Root Directory **`public`**. One-off production deploy: `npx vercel --prod` from the repo root (project already linked).

## After the first deploy: `baseUrl` and QR

1. Open [`public/js/config.js`](public/js/config.js) and set `baseUrl` to your real production origin (no trailing slash), e.g. `https://hello-kkt-kitchen.vercel.app`.
2. Regenerate QR assets:

   ```bash
   npm run generate:qr
   ```

   Optional override: `BASE_URL=https://your-domain.example npm run generate:qr` (localhost is refused).

3. Commit the updated `config.js` and `public/assets/qr/*`, then redeploy.

QR files encode **`{baseUrl}`** only (shortest shareable URL, no trailing slash). `/` redirects to `/menu/` in production. Download links on the menu page point at the generated SVG/PNG.

## Permanent URL and redirects

- Keep a **stable** Vercel project name or attach a **custom domain** so printed QR codes stay valid.
- Share **`https://hello-kkt-kitchen.vercel.app`** (or your custom domain). `/menu/` still works for older links.
- If the public hostname ever changes, add a **redirect from the old origin to the new site** so existing printed codes keep working without reprinting.
- Want a cleaner name (e.g. `hello-kkt-kitchen.com`)? Buy the domain and add it in the Vercel project → Domains, then update `baseUrl` and re-run `npm run generate:qr`.

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
| `public/vercel.json` | Production redirects and cache headers |
