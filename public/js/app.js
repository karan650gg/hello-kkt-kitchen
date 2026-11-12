const FALLBACK_BUSINESS = {
  chef: "Chef James",
  phoneDisplay: "+91 8778237926",
  hours: "9:00 AM to 11:00 PM daily",
  currency: "Rs",
  paymentInstruction: "Pay to confirm your order after finalising it with the chef.",
  payHowTo: [
    "Pay online (UPI) to Chef James on +91 8778237926 — the same number used for calls and WhatsApp.",
    "After paying, send the payment screenshot on WhatsApp so the chef can confirm your order.",
    "Do not assume the order is confirmed until the chef replies."
  ]
};

const FALLBACK_CONTACT_LINKS = {
  tel: "tel:+918778237926",
  sms: "sms:+918778237926?body=Hello%20Chef%20James%2C%20I%20would%20like%20to%20place%20an%20order.",
  whatsapp:
    "https://wa.me/918778237926?text=Hello%20Chef%20James%2C%20I%20would%20like%20to%20check%20availability%20and%20place%20an%20order."
};

const FALLBACK_ORDER_STEPS = [
  { n: "01", title: "Review the menu" },
  { n: "02", title: "Contact Chef James" },
  { n: "03", title: "Confirm availability & final order" },
  { n: "04", title: "Pay to confirm" }
];

const QR_SVG_PATH = "/assets/qr/menu-qr.svg";
const QR_PNG_PATH = "/assets/qr/menu-qr.png";
function formatPrice(price, currency) {
  if (price === null || price === undefined) return "Ask chef";
  if (typeof price === "string" && price.trim() === "") return "Ask chef";
  if (typeof price === "number" && Number.isNaN(price)) return "Ask chef";
  const unit = currency || "Rs";
  return `${unit} ${price}`;
}

function showError(message) {
  const el = document.getElementById("error-banner");
  if (!el) return;
  el.hidden = false;
  el.textContent = message;
}

function hideError() {
  const el = document.getElementById("error-banner");
  if (!el) return;
  el.hidden = true;
  el.textContent = "";
}

function ensureContactButtons(container, links) {
  if (!container) return;

  const specs = [
    {
      modifier: "contact-btn--whatsapp",
      href: links.whatsapp || FALLBACK_CONTACT_LINKS.whatsapp,
      label: "WhatsApp Chef James",
      external: true
    },
    {
      modifier: "contact-btn--call",
      href: links.tel || FALLBACK_CONTACT_LINKS.tel,
      label: "Call Chef James",
      external: false
    },
    {
      modifier: "contact-btn--sms",
      href: links.sms || FALLBACK_CONTACT_LINKS.sms,
      label: "Send a text",
      external: false
    }
  ];

  for (const spec of specs) {
    let anchor = container.querySelector(`.${spec.modifier}`);
    if (!anchor) {
      anchor = document.createElement("a");
      anchor.className = `contact-btn ${spec.modifier}`;
      anchor.textContent = spec.label;
      container.appendChild(anchor);
    }
    anchor.setAttribute("href", spec.href);
    if (spec.external) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  }
}

function renderBusinessCopy(business) {
  const info = business || FALLBACK_BUSINESS;

  const hoursBadge = document.getElementById("hours-badge");
  if (hoursBadge && info.hours) {
    hoursBadge.textContent = info.hours;
  }

  const paymentInstruction = document.querySelector(".payment-instruction");
  if (paymentInstruction && info.paymentInstruction) {
    paymentInstruction.textContent = info.paymentInstruction;
  }

  const payList = document.querySelector(".pay-how-to-list");
  if (payList && Array.isArray(info.payHowTo)) {
    const items = info.payHowTo.map((entry) => {
      const li = document.createElement("li");
      li.textContent = entry;
      return li;
    });
    payList.replaceChildren(...items);
  }

  const chefLine = document.querySelector(".chef-line");
  if (chefLine && info.chef && info.phoneDisplay) {
    chefLine.textContent = `${info.chef} · ${info.phoneDisplay}`;
  }
}

function renderOrderSteps(steps) {
  const list = document.getElementById("order-steps");
  if (!list || !Array.isArray(steps)) return;

  const nodes = steps.map((step) => {
    const li = document.createElement("li");
    li.className = "step";
    li.textContent = typeof step === "string" ? step : step.title;
    return li;
  });
  list.replaceChildren(...nodes);
}

function wireQrSection() {
  const qrSection = document.getElementById("qr-section");
  const baseUrl =
    typeof window !== "undefined" &&
    window.KKT_CONFIG &&
    typeof window.KKT_CONFIG.baseUrl === "string"
      ? window.KKT_CONFIG.baseUrl.replace(/\/$/, "")
      : "";

  if (qrSection && baseUrl) {
    qrSection.dataset.menuUrl = baseUrl;
  }

  const qrImg = document.getElementById("qr-img");
  if (qrImg) {
    qrImg.setAttribute("src", QR_SVG_PATH);
  }

  if (qrSection) {
    const downloads = qrSection.querySelectorAll(".qr-download");
    if (downloads[0]) {
      downloads[0].setAttribute("href", QR_SVG_PATH);
      downloads[0].setAttribute("download", "kkt-kitchen-menu-qr.svg");
    }
    if (downloads[1]) {
      downloads[1].setAttribute("href", QR_PNG_PATH);
      downloads[1].setAttribute("download", "kkt-kitchen-menu-qr.png");
    }
  }
}

const CATEGORY_VISUALS = {
  "hot-beverages": { glyph: "cup", image: "/assets/food/hero-coffee.jpg", alt: "Hot filter coffee" },
  "fresh-juice": { glyph: "glass", image: "/assets/food/hero-coffee.jpg", alt: "Fresh juice vibes" },
  milkshake: { glyph: "shake", image: "/assets/food/hero-coffee.jpg", alt: "Creamy shake" },
  breakfast: { glyph: "dosa", image: "/assets/food/hero-dosa.jpg", alt: "Breakfast dosa" },
  rice: { glyph: "bowl", image: "/assets/food/hero-biryani.jpg", alt: "Rice and biryani" },
  egg: { glyph: "egg", image: "/assets/food/hero-snacks.jpg", alt: "Egg favourites" },
  breads: { glyph: "bread", image: "/assets/food/hero-dosa.jpg", alt: "Fresh breads" },
  "veg-curry": { glyph: "leaf", image: "/assets/food/hero-biryani.jpg", alt: "Veg curry" },
  "non-veg-curry": { glyph: "flame", image: "/assets/food/hero-biryani.jpg", alt: "Non-veg curry" },
  snacks: { glyph: "fries", image: "/assets/food/hero-snacks.jpg", alt: "Snacks platter" },
  noodles: { glyph: "noodles", image: "/assets/food/hero-snacks.jpg", alt: "Noodles bowl" },
  lassi: { glyph: "lassi", image: "/assets/food/hero-coffee.jpg", alt: "Chilled lassi" }
};

function categoryVisual(catId) {
  return (
    CATEGORY_VISUALS[catId] || {
      glyph: "bowl",
      image: "/assets/food/hero-dosa.jpg",
      alt: "KKT kitchen favourite"
    }
  );
}

function categoryGlyphSvg(glyph) {
  const paths = {
    cup: '<path d="M6 7h10v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V7z"/><path d="M16 9h2a2 2 0 0 1 0 4h-2"/><path d="M9 4c.5 1 .5 2 0 3M12 4c.5 1 .5 2 0 3"/>',
    glass: '<path d="M8 4h8l-1.2 14H9.2L8 4z"/><path d="M9 10h6"/>',
    shake: '<path d="M9 5h6l1 6v5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-5l1-6z"/><path d="M10 3h4"/>',
    dosa: '<ellipse cx="12" cy="13" rx="8" ry="5"/><path d="M5 12c2-4 5-6 7-6s5 2 7 6"/>',
    bowl: '<path d="M4 11h16a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z"/><path d="M8 9c1-2 2.5-3 4-3s3 1 4 3"/>',
    egg: '<ellipse cx="12" cy="13" rx="5" ry="6"/><ellipse cx="12" cy="14" rx="2.2" ry="2.6" fill="currentColor" opacity=".35"/>',
    bread: '<path d="M5 10c0-3 3-5 7-5s7 2 7 5v6H5v-6z"/><path d="M8 10v4M12 9v5M16 10v4"/>',
    leaf: '<path d="M12 20S6 15 6 10a6 6 0 0 1 12 0c0 5-6 10-6 10z"/><path d="M12 20V10"/>',
    flame: '<path d="M12 21c-3.5 0-6-2.4-6-5.8C6 11 9 9 10 6c2 3 3 3.5 4 2 1 3 4 4.2 4 7.2 0 3.4-2.5 5.8-6 5.8z"/>',
    fries: '<path d="M8 10h2v10H8zM11 8h2v12h-2zM14 10h2v10h-2z"/><path d="M7 20h10v2H7z"/>',
    noodles: '<path d="M5 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M5 17c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M7 8h10v3H7z"/>',
    lassi: '<path d="M9 5h6l1 8a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4l1-8z"/><path d="M10 9h4"/>'
  };
  const body = paths[glyph] || paths.bowl;
  return `<svg class="cat-glyph" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function renderCategories(categories, currency) {
  const nav = document.getElementById("category-nav");
  const select = document.getElementById("category-select");
  const sectionsContainer = document.getElementById("menu-sections");
  if (!nav || !select || !sectionsContainer) return;

  nav.hidden = false;
  sectionsContainer.hidden = false;

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select Category";

  const options = [placeholder];
  const sections = [];

  categories.forEach((cat) => {
    const sectionId = `cat-${cat.id}`;
    const headingId = `cat-heading-${cat.id}`;
    const visual = categoryVisual(cat.id);

    const option = document.createElement("option");
    option.value = sectionId;
    option.textContent = cat.name;
    options.push(option);

    const section = document.createElement("section");
    section.id = sectionId;
    section.className = "menu-card";
    section.setAttribute("aria-labelledby", headingId);

    const media = document.createElement("div");
    media.className = "menu-card__media";
    const img = document.createElement("img");
    img.src = visual.image;
    img.alt = visual.alt;
    img.width = 640;
    img.height = 360;
    img.loading = "lazy";
    img.decoding = "async";
    media.appendChild(img);

    const heading = document.createElement("h3");
    heading.id = headingId;
    heading.className = "heading heading--category";
    const icon = document.createElement("span");
    icon.className = "heading--category__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = categoryGlyphSvg(visual.glyph);
    const label = document.createElement("span");
    label.textContent = cat.name;
    heading.appendChild(icon);
    heading.appendChild(label);
    section.appendChild(media);
    section.appendChild(heading);

    const ul = document.createElement("ul");
    const items = Array.isArray(cat.items) ? cat.items : [];
    for (const item of items) {
      const li = document.createElement("li");
      li.className = "menu-row";

      const nameSpan = document.createElement("span");
      nameSpan.className = "menu-row__name";
      nameSpan.textContent = item.name;

      const priceSpan = document.createElement("span");
      priceSpan.className = "menu-row__price";
      priceSpan.textContent = formatPrice(item.price, currency);

      li.appendChild(nameSpan);
      li.appendChild(priceSpan);
      ul.appendChild(li);
    }

    section.appendChild(ul);
    sections.push(section);
  });

  select.replaceChildren(...options);
  select.value = "";
  select.onchange = () => {
    const targetId = select.value;
    if (!targetId) {
      sections.forEach((section) => {
        section.hidden = false;
      });
      return;
    }
    sections.forEach((section) => {
      section.hidden = section.id !== targetId;
    });
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  sectionsContainer.replaceChildren(...sections);
}

function renderFallbackContacts() {
  renderBusinessCopy(FALLBACK_BUSINESS);
  ensureContactButtons(document.getElementById("contact-buttons"), FALLBACK_CONTACT_LINKS);
  ensureContactButtons(document.getElementById("sticky-contact"), FALLBACK_CONTACT_LINKS);
  renderOrderSteps(FALLBACK_ORDER_STEPS);

  const nav = document.getElementById("category-nav");
  if (nav) {
    nav.hidden = true;
  }
  const select = document.getElementById("category-select");
  if (select) {
    select.replaceChildren();
    select.onchange = null;
  }

  const sections = document.getElementById("menu-sections");
  if (sections) {
    sections.replaceChildren();
    sections.hidden = true;
  }

  wireQrSection();
}

function renderMenu(data) {
  hideError();

  const business = (data && data.business) || FALLBACK_BUSINESS;
  const links = (data && data.contactLinks) || FALLBACK_CONTACT_LINKS;
  const steps = (data && data.orderSteps) || FALLBACK_ORDER_STEPS;
  const currency = business.currency || "Rs";

  renderBusinessCopy(business);
  ensureContactButtons(document.getElementById("contact-buttons"), links);
  ensureContactButtons(document.getElementById("sticky-contact"), links);
  renderOrderSteps(steps);
  renderCategories(data.categories, currency);
  wireQrSection();
}

async function fetchMenuData() {
  const candidates = ["/data/menu.json", "../data/menu.json"];
  let lastError = new Error("Menu data unavailable");

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) {
        lastError = new Error(`Menu data unavailable (${res.status})`);
        continue;
      }
      return await res.json();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

async function init() {
  try {
    const data = await fetchMenuData();
    if (!data || !Array.isArray(data.categories) || !data.categories.length) {
      throw new Error("Menu data is empty");
    }
    renderMenu(data);
  } catch (err) {
    showError(
      "We could not load the menu right now. You can still call, text, or WhatsApp Chef James using the buttons below."
    );
    renderFallbackContacts();
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "complete") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
}
