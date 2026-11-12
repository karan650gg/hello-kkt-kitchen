# KKT kitchen Digital Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a lightweight static digital menu at a stable Vercel URL with a QR code that opens `/menu` (not a phone dialer).

**Architecture:** Static HTML/CSS/vanilla JS site. All menu and business copy lives in `public/data/menu.json`. `public/js/app.js` fetches and renders categories, contact CTAs, order steps, payment copy, and QR download UI. `scripts/generate-qr.mjs` writes SVG/PNG from `BASE_URL` + `/menu`. Vercel serves `public/` with `/` → `/menu/`.

**Tech Stack:** HTML5, CSS3, vanilla ES modules (or plain JS), Node.js (QR generation only), `qrcode` package for SVG/PNG, Vercel static hosting.

## Global Constraints

- Project name / Vercel project: `hello-kkt-kitchen`
- Stable route: `/menu` — QR encodes `{BASE_URL}/menu` only; never localhost
- Payment instruction exact text: `Pay to confirm your order after finalising it with the chef.`
- Pay flow: UPI/pay to +91 8778237926, then send payment screenshot on WhatsApp
- Contact URLs exact: `tel:+918778237926`, SMS and WhatsApp bodies as in design spec
- Hours: `9:00 AM to 11:00 PM daily`
- Missing prices display `Ask chef` — never invent
- Pineapple in both Fresh Juice and Lassi; Fish Fry + Fish Curry with Rice under Non-Veg Curry
- No payment gateway / cart / login
- Keep assets tiny for low bandwidth
- Spec: `docs/superpowers/specs/2026-11-13-kkt-kitchen-menu-design.md`

## File structure

| Path | Responsibility |
|------|----------------|
| `public/index.html` | Meta refresh / link redirect to `/menu/` |
| `public/menu/index.html` | Semantic page shell, SEO/OG, empty mount points |
| `public/css/styles.css` | Cafe theme, mobile-first layout, sticky CTAs |
| `public/js/config.js` | `window.KKT_CONFIG = { baseUrl: '...' }` |
| `public/js/app.js` | Load JSON, render UI, QR downloads, error state |
| `public/data/menu.json` | Single source of truth for menu + business |
| `public/assets/favicon.svg` | Favicon |
| `public/assets/qr/menu-qr.svg` | Generated QR |
| `public/assets/qr/menu-qr.png` | Generated QR |
| `scripts/generate-qr.mjs` | Build QR from `BASE_URL` env or `config.js` |
| `vercel.json` | Root → `/menu/`, static headers |
| `package.json` | `qrcode` dep + `generate:qr` script |
| `.gitignore` | `node_modules` |
| `README.md` | Local preview, BASE_URL, Vercel deploy, QR regen |

---

### Task 1: Scaffold project + menu.json

**Files:**
- Create: `package.json`, `.gitignore`, `public/data/menu.json`, `public/js/config.js`, `vercel.json`

**Interfaces:**
- Produces: `menu.json` shape with `business`, `contactLinks`, `orderSteps`, `categories[]` where each item is `{ "name": string, "price": number | null }`
- Produces: `window.KKT_CONFIG.baseUrl` string (production origin, no trailing slash)

- [ ] **Step 1: Create `package.json` and `.gitignore`**

```json
{
  "name": "hello-kkt-kitchen",
  "private": true,
  "version": "1.0.0",
  "description": "Mobile-first digital menu for KKT kitchen",
  "scripts": {
    "generate:qr": "node scripts/generate-qr.mjs",
    "preview": "npx --yes serve public -p 4173"
  },
  "devDependencies": {
    "qrcode": "^1.5.4"
  }
}
```

```gitignore
node_modules/
.DS_Store
.vercel/
```

- [ ] **Step 2: Create `public/js/config.js`**

```js
// BASE_URL must be the public production origin (no trailing slash).
// Update after first Vercel deploy, then re-run: npm run generate:qr
window.KKT_CONFIG = {
  baseUrl: "https://hello-kkt-kitchen.vercel.app"
};
```

- [ ] **Step 3: Create `vercel.json`**

```json
{
  "rewrites": [],
  "redirects": [
    { "source": "/", "destination": "/menu/", "permanent": true }
  ],
  "headers": [
    {
      "source": "/data/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=300" }
      ]
    }
  ]
}
```

- [ ] **Step 4: Create complete `public/data/menu.json`**

Include all categories from the design spec with photo prices for Breakfast and Rice. Exact contact URLs. Payment fields:

```json
{
  "business": {
    "name": "KKT kitchen",
    "tagline": "Your favourites, all in one place. Browse the menu then speak with Chef James to place your order.",
    "chef": "Chef James",
    "phoneDisplay": "+91 8778237926",
    "hours": "9:00 AM - 11:00 PM daily",
    "currency": "Rs",
    "paymentInstruction": "Pay to confirm your order after finalising it with the chef.",
    "payHowTo": [
      "Pay online (UPI) to Chef James on +91 8778237926 — the same number used for calls and WhatsApp.",
      "After paying, send the payment screenshot on WhatsApp so the chef can confirm your order."
    ]
  },
  "contactLinks": {
    "tel": "tel:+918778237926",
    "sms": "sms:+918778237926?body=Hello%20Chef%20James%2C%20I%20would%20like%20to%20place%20an%20order.",
    "whatsapp": "https://wa.me/918778237926?text=Hello%20Chef%20James%2C%20I%20would%20like%20to%20check%20availability%20and%20place%20an%20order."
  },
  "orderSteps": [
    { "n": "01", "title": "Review the menu" },
    { "n": "02", "title": "Contact Chef James" },
    { "n": "03", "title": "Confirm availability & final order" },
    { "n": "04", "title": "Pay to confirm" }
  ],
  "categories": [
    {
      "id": "hot-beverages",
      "name": "Hot Beverages",
      "items": [
        { "name": "Milk Tea", "price": 30 },
        { "name": "Black Tea", "price": 20 },
        { "name": "Milk Coffee", "price": 40 },
        { "name": "Black Coffee", "price": 30 }
      ]
    },
    {
      "id": "fresh-juice",
      "name": "Fresh Juice",
      "items": [
        { "name": "Pineapple", "price": 120 },
        { "name": "Orange", "price": 120 },
        { "name": "Watermelon", "price": 100 }
      ]
    },
    {
      "id": "milkshake",
      "name": "Milkshake",
      "items": [
        { "name": "Banana", "price": 120 },
        { "name": "Chocolate", "price": 150 }
      ]
    },
    {
      "id": "breakfast",
      "name": "Breakfast",
      "items": [
        { "name": "Plain Dosa", "price": 70 },
        { "name": "Masala Dosa", "price": 100 },
        { "name": "Egg Dosa", "price": 130 },
        { "name": "Aloo Paratha", "price": 100 },
        { "name": "Onion Paratha", "price": 130 },
        { "name": "Egg Paratha", "price": 130 },
        { "name": "Poha", "price": 100 },
        { "name": "Pancakes — Banana", "price": 100 },
        { "name": "Pancakes — Nutella", "price": 130 },
        { "name": "Pancakes — Chocolate", "price": 120 },
        { "name": "Toast — French", "price": 150 },
        { "name": "Toast — Butter", "price": 80 },
        { "name": "Toast — Plain", "price": 40 },
        { "name": "Scrambled Egg with Toast", "price": 130 },
        { "name": "Puri Bhaji", "price": 100 },
        { "name": "Muesli", "price": 150 },
        { "name": "Bread Omelette", "price": 100 }
      ]
    },
    {
      "id": "rice",
      "name": "Rice Items",
      "items": [
        { "name": "Veg Biryani", "price": 160 },
        { "name": "Egg Biryani", "price": 170 },
        { "name": "Chicken Biryani", "price": 200 },
        { "name": "Veg Fried Rice", "price": 150 },
        { "name": "Egg Fried Rice", "price": 160 },
        { "name": "Chicken Fried Rice", "price": 180 },
        { "name": "Ghee Rice", "price": 140 },
        { "name": "Jeera Rice", "price": 100 }
      ]
    },
    {
      "id": "egg",
      "name": "Egg Items",
      "items": [
        { "name": "Egg Curry", "price": 150 },
        { "name": "Egg Bhurji", "price": 100 },
        { "name": "Boiled Egg", "price": 40 },
        { "name": "Egg Curry with Rice", "price": 250 }
      ]
    },
    {
      "id": "breads",
      "name": "Breads",
      "items": [
        { "name": "Chapati", "price": 15 },
        { "name": "Kerala Paratha", "price": 20 }
      ]
    },
    {
      "id": "veg-curry",
      "name": "Veg Curry",
      "items": [
        { "name": "Veg Curry", "price": 150 },
        { "name": "Kadai Veg", "price": 160 },
        { "name": "Aloo Gobi", "price": 150 },
        { "name": "Aloo Mutter", "price": 150 },
        { "name": "Dal Fry", "price": 130 },
        { "name": "Dal Tadka", "price": 140 }
      ]
    },
    {
      "id": "non-veg-curry",
      "name": "Non-Veg Curry",
      "items": [
        { "name": "Chicken Curry", "price": 180 },
        { "name": "Chicken Masala", "price": 180 },
        { "name": "Chicken Kadai", "price": 180 },
        { "name": "Butter Chicken", "price": 200 },
        { "name": "Fish Fry", "price": 250 },
        { "name": "Fish Curry with Rice", "price": 250 }
      ]
    },
    {
      "id": "snacks",
      "name": "Snacks",
      "items": [
        { "name": "French Fries", "price": 150 },
        { "name": "Masala Papad", "price": 100 },
        { "name": "Peanut Masala", "price": 100 },
        { "name": "Chilli Gobi", "price": 150 },
        { "name": "Veg Pakora", "price": 150 },
        { "name": "Chilli Chicken", "price": 200 }
      ]
    },
    {
      "id": "noodles",
      "name": "Noodles",
      "items": [
        { "name": "Veg Noodles", "price": 150 },
        { "name": "Egg Noodles", "price": 160 },
        { "name": "Chicken Noodles", "price": 180 }
      ]
    },
    {
      "id": "lassi",
      "name": "Lassi",
      "items": [
        { "name": "Banana Lassi", "price": 120 },
        { "name": "Pineapple Lassi", "price": 120 },
        { "name": "Sweet Lassi", "price": 100 }
      ]
    }
  ]
}
```

- [ ] **Step 5: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/data/menu.json','utf8')); console.log('ok')"`  
Expected: `ok`

- [ ] **Step 6: Commit**

```bash
git add package.json .gitignore public/data/menu.json public/js/config.js vercel.json
git commit -m "chore: scaffold hello-kkt-kitchen with central menu data"
```

---

### Task 2: HTML shell with SEO and mount points

**Files:**
- Create: `public/index.html`, `public/menu/index.html`, `public/assets/favicon.svg`

**Interfaces:**
- Consumes: none yet (static shell)
- Produces: DOM ids: `#hours-badge`, `#order-cta`, `#contact-buttons`, `#order-steps`, `#category-nav`, `#menu-sections`, `#qr-section`, `#error-banner`, `#sticky-contact`

- [ ] **Step 1: Create `public/assets/favicon.svg`**

Simple leafy-green circle with white bowl/steam mark (inline SVG, ~1KB).

- [ ] **Step 2: Create `public/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=/menu/" />
    <link rel="canonical" href="/menu/" />
    <title>KKT kitchen</title>
  </head>
  <body>
    <p><a href="/menu/">Open the KKT kitchen menu</a></p>
  </body>
</html>
```

- [ ] **Step 3: Create `public/menu/index.html`**

Full semantic structure:

- `<head>`: title `KKT kitchen — Digital Menu`, description, OG tags (`og:title`, `og:description`, `og:type`, `og:url` placeholder matching BASE_URL/menu), theme-color `#2F5D50`, favicon
- `<header>` brand + tagline + `#hours-badge`
- `<section id="order-cta">` payment + how-to + `#contact-buttons`
- `<section id="how-to-order">` + `#order-steps`
- `<main>` `#category-nav` + `#menu-sections`
- `<section id="qr-section">` print QR block + download buttons
- `<div id="error-banner" hidden role="alert">`
- `<footer>` + `#sticky-contact`
- Scripts: `/js/config.js` then `/js/app.js` (defer)

Use accessible labels: buttons with clear text “Call Chef James”, “Send a text”, “Message on WhatsApp”.

- [ ] **Step 4: Commit**

```bash
git add public/index.html public/menu/index.html public/assets/favicon.svg
git commit -m "feat: add menu page shell with SEO metadata"
```

---

### Task 3: Cafe CSS (mobile-first)

**Files:**
- Create: `public/css/styles.css`

**Interfaces:**
- Consumes: class names from HTML shell (`.site-header`, `.cta-card`, `.contact-btn`, `.step`, `.cat-pill`, `.menu-card`, `.menu-row`, `.qr-print`, `.sticky-bar`)
- Produces: responsive layout usable at 360px and 1024px+

- [ ] **Step 1: Write CSS variables and base**

```css
:root {
  --ivory: #f7f1e8;
  --coffee: #3b2a1f;
  --terracotta: #c45c3e;
  --mustard: #d4a017;
  --leaf: #2f5d50;
  --leaf-deep: #1e3d35;
  --card: #fffdf8;
  --border: #e6dccf;
  --radius: 14px;
  --font-display: "Fraunces", "Palatino Linotype", Palatino, serif;
  --font-body: "Source Sans 3", "Segoe UI", sans-serif;
}
```

Load Google Fonts via `<link>` in HTML (Fraunces + Source Sans 3) with `display=swap`. Keep CSS under ~15KB uncompressed.

- [ ] **Step 2: Layout rules**

- Ivory page background; max-width ~720px centered on desktop  
- Large tap targets (min-height 48px) for contact buttons  
- Category pills horizontal scroll  
- Menu rows: flex; name left, price right (`tabular-nums`)  
- Sticky bottom contact bar on mobile  
- High contrast text on ivory/leaf/terracotta  

- [ ] **Step 3: Preview locally**

Run: `npm run preview`  
Open `http://localhost:4173/menu/` — structure should show unstyled-then-styled shell (menu empty until Task 4).

- [ ] **Step 4: Commit**

```bash
git add public/css/styles.css public/menu/index.html
git commit -m "feat: add warm cafe mobile-first styles"
```

---

### Task 4: Render app.js (menu, CTAs, errors)

**Files:**
- Create: `public/js/app.js`

**Interfaces:**
- Consumes: `fetch('../data/menu.json')` relative from `/menu/`, `window.KKT_CONFIG.baseUrl`
- Produces: `formatPrice(price, currency)`, `renderMenu(data)`, `showError(message)`, `init()`

- [ ] **Step 1: Implement helpers**

```js
function formatPrice(price, currency) {
  if (price === null || price === undefined || price === "") return "Ask chef";
  return `${currency} ${price}`;
}

function showError(message) {
  const el = document.getElementById("error-banner");
  el.hidden = false;
  el.textContent = message;
}
```

- [ ] **Step 2: Implement renderers**

- Hours badge from `business.hours`  
- CTA: exact `paymentInstruction` + `payHowTo` list  
- Contact buttons using `contactLinks` (tel, sms, whatsapp) — set `href` attributes; WhatsApp `target="_blank" rel="noopener"`  
- Order steps from `orderSteps`  
- Category nav pills (`button` or `a href="#cat-{id}"`)  
- For each category: section with heading + item rows  
- Footer sticky buttons mirror primary CTAs  
- QR section: set `#qr-img` `src` to `/assets/qr/menu-qr.svg`, show caption, wire download anchors for SVG and PNG  

- [ ] **Step 3: Load JSON with error handling**

```js
async function init() {
  try {
    const res = await fetch("../data/menu.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("Menu data unavailable");
    const data = await res.json();
    if (!data.categories || !data.categories.length) {
      throw new Error("Menu data is empty");
    }
    renderMenu(data);
  } catch (err) {
    showError(
      "We could not load the menu right now. You can still call, text, or WhatsApp Chef James using the buttons below."
    );
    // Still paint fallback contact links from hardcoded constants matching the spec URLs
    renderFallbackContacts();
  }
}
document.addEventListener("DOMContentLoaded", init);
```

- [ ] **Step 4: Manual check**

Run preview; confirm all categories render, prices align, Pineapple in Juice + Lassi, Fish items under Non-Veg Curry. Temporarily rename `menu.json` and confirm error banner + contacts still work; restore file.

- [ ] **Step 5: Commit**

```bash
git add public/js/app.js
git commit -m "feat: render menu, contacts, and payment copy from JSON"
```

---

### Task 5: QR generation script + assets

**Files:**
- Create: `scripts/generate-qr.mjs`
- Create: `public/assets/qr/menu-qr.svg`, `public/assets/qr/menu-qr.png`

**Interfaces:**
- Consumes: `process.env.BASE_URL` or `window.KKT_CONFIG.baseUrl` from `public/js/config.js` (parse with regex)
- Produces: files encoding exact URL `{baseUrl}/menu` (no trailing slash inconsistency — normalize)

- [ ] **Step 1: Install qrcode**

Run: `npm install`  
Expected: `node_modules/qrcode` present

- [ ] **Step 2: Write `scripts/generate-qr.mjs`**

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const configPath = path.join(root, "public/js/config.js");
const outDir = path.join(root, "public/assets/qr");

function readBaseUrl() {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, "");
  const src = fs.readFileSync(configPath, "utf8");
  const m = src.match(/baseUrl:\s*["']([^"']+)["']/);
  if (!m) throw new Error("BASE_URL missing");
  const url = m[1].replace(/\/$/, "");
  if (/localhost|127\.0\.0\.1/i.test(url)) {
    throw new Error("Refusing to encode localhost in QR");
  }
  return url;
}

const base = readBaseUrl();
const target = `${base}/menu`;
fs.mkdirSync(outDir, { recursive: true });
await QRCode.toFile(path.join(outDir, "menu-qr.svg"), target, { type: "svg", margin: 2, width: 512 });
await QRCode.toFile(path.join(outDir, "menu-qr.png"), target, { type: "png", margin: 2, width: 1024 });
console.log("QR encodes:", target);
```

- [ ] **Step 3: Generate QR**

Run: `npm run generate:qr`  
Expected stdout includes `QR encodes: https://hello-kkt-kitchen.vercel.app/menu`  
Verify files exist and are non-empty. Confirm script rejects localhost if `BASE_URL=http://localhost:4173 npm run generate:qr`.

- [ ] **Step 4: Wire download buttons in `app.js` / HTML**

Download links: `/assets/qr/menu-qr.svg` and `/assets/qr/menu-qr.png` with `download` attribute. Print caption exact: `Scan to view the menu, check availability, or contact Chef James.` Note: QR remains usable while the public URL stays active; if the host changes, update BASE_URL or set a redirect.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-qr.mjs package.json package-lock.json public/assets/qr public/js/app.js public/menu/index.html
git commit -m "feat: generate downloadable menu QR for production URL"
```

---

### Task 6: README + local verification checklist

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README** covering:

- What this is (QR → `/menu`, not phone)  
- Local preview: `npm install && npm run preview` → `http://localhost:4173/menu/`  
- Edit prices in `public/data/menu.json` only  
- Deploy to Vercel (project `hello-kkt-kitchen`, root/output = `public` or link repo)  
- After first deploy: set `public/js/config.js` `baseUrl` to the real URL, run `npm run generate:qr`, redeploy  
- Permanent URL strategy: keep Vercel project name / custom domain; if URL changes, redirect old → new so printed QR keeps working  

- [ ] **Step 2: Run verification checklist**

| Check | Expected |
|-------|----------|
| Call button | `href` starts with `tel:+918778237926` |
| SMS button | matches spec body |
| WhatsApp | opens wa.me with spec text |
| Hours visible | 9:00 AM - 11:00 PM daily |
| Payment line | exact instruction string |
| Pay how-to | number + send screenshot on WhatsApp |
| Menu categories | all 12 present |
| QR payload | production `/menu` (decode with phone camera or `npx qrcode-reader` / online) |
| Error path | broken JSON shows banner + contacts |

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add deploy and BASE_URL instructions"
```

---

### Task 7: Deploy to Vercel and finalize QR

**Files:**
- Modify: `public/js/config.js` (real BASE_URL after first deploy)
- Regenerate: `public/assets/qr/*`

- [ ] **Step 1: Deploy**

Prefer CLI if logged in:

```bash
npx vercel --yes --name hello-kkt-kitchen
```

If `public` is the root, ensure Vercel Root Directory is project root and output is static `public` — set in `vercel.json`:

```json
{
  "outputDirectory": "public"
}
```

(or deploy with `vercel public` / configure Root Directory = `public`).

- [ ] **Step 2: Record production URL**

Example: `https://hello-kkt-kitchen.vercel.app`  
Public menu URL: `https://hello-kkt-kitchen.vercel.app/menu/`

- [ ] **Step 3: Update config + regenerate QR + redeploy**

Set `baseUrl` to the real origin (no trailing slash). Run `npm run generate:qr`. Commit. Redeploy. Confirm QR decodes to the same public menu URL.

- [ ] **Step 4: Output for user**

Report:

1. Final public menu URL  
2. Exact URL encoded in the QR  
3. Path to SVG/PNG downloads on the live page  

- [ ] **Step 5: Final commit if needed**

```bash
git add public/js/config.js public/assets/qr
git commit -m "chore: lock production BASE_URL and QR assets"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Stable `/menu` route | 1, 2, 7 |
| Central menu file | 1 |
| Contact tel/sms/WhatsApp | 1, 4 |
| Hours + payment instruction | 1, 4 |
| Pay + WhatsApp screenshot | 1, 4 |
| Order steps | 1, 4 |
| Full menu + photo prices | 1 |
| Ask chef for missing | 4 `formatPrice` |
| Cafe visual design | 3 |
| SEO / OG / favicon | 2 |
| Error handling | 4 |
| QR SVG/PNG + download + caption | 5 |
| No localhost in QR | 5 |
| BASE_URL / redirect guidance | 5, 6, 7 |
| Vercel deploy + final URLs | 7 |
| Lightweight / low bandwidth | stack choice + no heavy images |

## Self-review notes

- No TBD placeholders in tasks.  
- `formatPrice` / `menu.json` shapes consistent across tasks.  
- Pancakes/Toast split into priced line items to avoid inventing combo-only display ambiguity.
