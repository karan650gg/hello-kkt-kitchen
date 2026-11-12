# KKT kitchen — Digital Menu Design

**Date:** 2026-11-13  
**Project:** `hello-kkt-kitchen`  
**Status:** Approved for implementation planning  

## Goal

Ship a mobile-first digital menu website with a **stable public URL** suitable for a permanent QR code on the physical cafe menu. The QR opens the **digital menu page** (not a phone dialer). Customers browse first, then call, text, or WhatsApp Chef James.

## Decisions locked

| Decision | Choice |
|----------|--------|
| Location | New standalone repo: `~/Documents/karan-gupta/hello-kkt-kitchen` |
| Hosting | Vercel (project name `hello-kkt-kitchen`) |
| Stack | Static HTML + CSS + vanilla JS (lightweight, low-bandwidth) |
| Breakfast / Rice prices | Copy from physical menu photo |
| Payment collection | No payment gateway. Instruct UPI/pay to Chef James’s number, then send screenshot on WhatsApp |

## Business details

- **Name:** KKT kitchen  
- **Contact:** Chef James  
- **Phone:** +91 8778237926  
- **WhatsApp:** 918778237926  
- **Hours:** 9:00 AM – 11:00 PM daily  
- **Currency:** INR / Rs  

### Contact action URLs (exact)

1. Call: `tel:+918778237926`  
2. SMS: `sms:+918778237926?body=Hello%20Chef%20James%2C%20I%20would%20like%20to%20place%20an%20order.`  
3. WhatsApp: `https://wa.me/918778237926?text=Hello%20Chef%20James%2C%20I%20would%20like%20to%20check%20availability%20and%20place%20an%20order.`  

## Customer journey

1. Scan QR → open `/menu`  
2. Review menu and hours  
3. Contact Chef James (call / text / WhatsApp)  
4. Confirm availability and final order + price with chef  
5. **Pay** to the same number (UPI / phone number payment)  
6. **Send payment screenshot on WhatsApp** to confirm  
7. Order is confirmed once chef acknowledges payment  

### Payment copy (required)

Prominently show:

> Pay to confirm your order after finalising it with the chef.

Add a short **How to pay** note:

- Pay online (UPI) to **Chef James · +91 8778237926** (same number as call/WhatsApp).  
- After paying, **send the payment screenshot on WhatsApp**.  
- Do not assume the order is confirmed until the chef replies.

No in-site payment form, cart, or gateway.

## Order flow (UI)

1. Review the digital menu  
2. Contact Chef James  
3. Confirm availability and the final order with the chef  
4. Pay to confirm the order (then send screenshot on WhatsApp)

## Architecture

```
hello-kkt-kitchen/
  public/                 # Vercel static root (or site root)
    index.html            # redirects to /menu/
    menu/
      index.html          # main menu page
    css/styles.css
    js/app.js             # render menu, QR helpers, error UI
    data/menu.json        # single source of truth for menu + business
    assets/
      favicon.ico / .svg
      qr/menu-qr.svg
      qr/menu-qr.png
    config.js             # BASE_URL for QR (production public origin)
  vercel.json             # redirects, headers
  scripts/generate-qr.mjs # generate SVG/PNG from BASE_URL + /menu
  README.md               # deploy + BASE_URL instructions
```

### Routing

- Stable public route: `/menu` (directory or `menu/index.html`)  
- `/` → redirect to `/menu`  
- QR encodes: `{BASE_URL}/menu` only — **never localhost**

### Configurability

- `BASE_URL` (e.g. `https://hello-kkt-kitchen.vercel.app`) drives QR generation and any absolute links in the print section.  
- If the deploy host changes: set a permanent redirect on the old host **or** regenerate QR after updating `BASE_URL`. Document both options in README so printed codes stay valid when possible.

## Data model (`data/menu.json`)

Single structured file containing:

- `business`: name, chef, phoneDisplay, phoneE164, whatsapp, hours, currency, paymentInstruction, payHowTo  
- `contactLinks`: tel, sms, whatsapp (full URLs)  
- `orderSteps`: array of 4 steps  
- `categories[]`: `{ id, name, accent?, items: [{ name, price | null }] }`  

Rules:

- Prices editable only in this file.  
- `null` / missing price → display **Ask chef** (do not invent).  
- Pineapple appears in **Fresh Juice** and **Lassi** separately (not duplicates within a category).  
- Fish Fry and Fish Curry with Rice both under **Non-Veg Curry**.  
- No duplicate items within a category.

### Breakfast & Rice prices (from physical menu)

**Breakfast:** Plain Dosa 70, Masala Dosa 100, Egg Dosa 130, Aloo Paratha 100, Onion Paratha 130, Egg Paratha 130, Poha 100, Pancakes Banana/Nutella/Chocolate 100/130/120, Toast French/Butter/Plain 150/80/40, Scrambled Egg with Toast 130, Puri Bhaji 100, Muesli 150, Bread Omelette 100.

**Rice:** Veg/Egg/Chicken Biryani 160/170/200, Veg/Egg/Chicken Fried Rice 150/160/180, Ghee Rice 140, Jeera Rice 100.

All other categories use the prices from the product brief.

## Page structure (UX)

1. **Header** — brand “KKT kitchen.”, short subtitle, hours badge  
2. **Order CTA** — payment instruction + How to pay (number + send screenshot on WhatsApp) + Call / Text / WhatsApp buttons + “Chef James • +91 8778237926”  
3. **How to order** — four mustard-style steps  
4. **Menu** — category filter pills + section cards; name left, price right  
5. **QR / print** — QR image, download SVG & PNG, caption: *“Scan to view the menu, check availability, or contact Chef James.”*, note that QR remains usable while the public URL is active  
6. **Footer** — contact reminder + sticky or repeated Call / Text / WhatsApp  

### Visual design

- Warm ivory background; coffee brown, terracotta, mustard yellow, leafy green accents  
- Bold readable headings (serif brand); clean sans for items  
- Large tap targets, accessible contrast  
- Minimal animation; no heavy food photography (icons/illustrations only if tiny)  
- Mobile-first; usable on desktop  

### Accessibility & SEO

- Semantic HTML, labels on interactive controls  
- Page title + meta description + Open Graph  
- Favicon  

## Error handling

- If `menu.json` fails to load or is empty/invalid: show a clear error banner, keep contact CTAs and hours visible, do not render a broken empty menu grid.

## QR requirements

- Generate downloadable **SVG** and **PNG**  
- On-page “Download QR Code” control(s)  
- Print-ready section with required caption  
- Encode menu URL only  

## Testing (before calling done)

- Verify tel, sms, WhatsApp links  
- Verify QR payload equals production `/menu` URL  
- Spot-check mobile and desktop layout  
- Confirm payment + screenshot copy is visible  

## Out of scope

- Payment gateway, cart, login, admin CMS  
- Embedding into `kkt-platform` hostel site  

## Success criteria

- Public Vercel URL for `hello-kkt-kitchen`  
- `/menu` loads full menu offline-friendly (small assets)  
- QR files encode that same `/menu` URL  
- Final output lists: **public menu URL** and **exact URL encoded in the QR**  
