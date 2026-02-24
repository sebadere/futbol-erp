import "./styles.css";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const navToggle = document.querySelector(".nav-toggle");
const navPanel = document.getElementById("nav-panel");

function setNavOpen(open) {
  if (!navToggle || !navPanel) return;
  navToggle.setAttribute("aria-expanded", String(open));
  navPanel.dataset.open = open ? "true" : "false";
  navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
}

if (navToggle && navPanel) {
  setNavOpen(false);
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    setNavOpen(!expanded);
  });

  navPanel.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.tagName.toLowerCase() !== "a") return;
    setNavOpen(false);
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (navPanel.contains(target) || navToggle.contains(target)) return;
    setNavOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    setNavOpen(false);
  });
}

const faqGrid = document.querySelector(".faq-grid");
if (faqGrid) {
  const items = Array.from(faqGrid.querySelectorAll("details"));
  for (const item of items) {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      for (const other of items) {
        if (other !== item) other.open = false;
      }
    });
  }
}
