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
const QR_CAPTION =
  "Scan to view the menu, check availability, or contact Chef James. This QR stays valid while the public menu URL is active.";

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
    },
    {
      modifier: "contact-btn--whatsapp",
      href: links.whatsapp || FALLBACK_CONTACT_LINKS.whatsapp,
      label: "Message on WhatsApp",
      external: true
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
    qrSection.dataset.menuUrl = `${baseUrl}/menu`;
  }

  const qrImg = document.getElementById("qr-img");
  if (qrImg) {
    qrImg.setAttribute("src", QR_SVG_PATH);
  }

  if (qrSection) {
    const caption = qrSection.querySelector("figcaption");
    if (caption && !caption.textContent.trim()) {
      caption.textContent = QR_CAPTION;
    }

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

function setActivePill(nav, activePill) {
  const pills = nav.querySelectorAll(".cat-pill");
  for (const pill of pills) {
    const isCurrent = pill === activePill;
    pill.classList.toggle("is-active", isCurrent);
    if (isCurrent) {
      pill.setAttribute("aria-current", "true");
    } else {
      pill.removeAttribute("aria-current");
    }
  }
}

function renderCategories(categories, currency) {
  const nav = document.getElementById("category-nav");
  const sectionsContainer = document.getElementById("menu-sections");
  if (!nav || !sectionsContainer) return;

  nav.hidden = false;
  sectionsContainer.hidden = false;

  const pills = [];
  const sections = [];

  categories.forEach((cat, index) => {
    const sectionId = `cat-${cat.id}`;
    const headingId = `cat-heading-${cat.id}`;

    const pill = document.createElement("a");
    pill.className = "cat-pill";
    pill.setAttribute("href", `#${sectionId}`);
    pill.textContent = cat.name;
    if (index === 0) {
      pill.classList.add("is-active");
      pill.setAttribute("aria-current", "true");
    }
    pill.addEventListener("click", () => {
      setActivePill(nav, pill);
    });
    pills.push(pill);

    const section = document.createElement("section");
    section.id = sectionId;
    section.className = "menu-card";
    section.setAttribute("aria-labelledby", headingId);

    const heading = document.createElement("h3");
    heading.id = headingId;
    heading.textContent = cat.name;
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

  nav.replaceChildren(...pills);
  sectionsContainer.replaceChildren(...sections);
}

function renderFallbackContacts() {
  renderBusinessCopy(FALLBACK_BUSINESS);
  ensureContactButtons(document.getElementById("contact-buttons"), FALLBACK_CONTACT_LINKS);
  ensureContactButtons(document.getElementById("sticky-contact"), FALLBACK_CONTACT_LINKS);
  renderOrderSteps(FALLBACK_ORDER_STEPS);

  const nav = document.getElementById("category-nav");
  if (nav) {
    nav.replaceChildren();
    nav.hidden = true;
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
