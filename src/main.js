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

// Demo: "experto AI" (simulado, sin API)
const chatBody = document.getElementById("chat-body");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

const demoData = {
  period: "últimos 30 días",
  kpis: {
    attendance: { current: 87.2, prev: 89.6, unit: "%", delta: -2.4 },
    delinquency: { current: 8.4, prev: 7.3, unit: "%", delta: +1.1 },
    retention: { current: 92.1, prev: 91.4, unit: "%", delta: +0.7 },
    revenue: { current: 198000, prev: 184000, unit: "€", delta: +14000 }
  },
  segments: {
    delinquencyByCategory: [
      { name: "U13", value: 11.2 },
      { name: "U15", value: 10.1 },
      { name: "U11", value: 7.0 },
      { name: "Primera", value: 4.6 }
    ],
    attendanceByTeam: [
      { name: "U15 A", value: 83.0 },
      { name: "U13", value: 85.5 },
      { name: "U11", value: 90.1 }
    ]
  },
  sources: ["Pagos", "Asistencia", "Planillas"]
};

function formatMoneyEUR(value) {
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(value);
  } catch {
    return `€ ${Math.round(value)}`;
  }
}

function addMessage(role, parts) {
  if (!chatBody) return;
  const el = document.createElement("div");
  el.className = `msg ${role}`;

  for (const part of parts) {
    if (typeof part === "string") {
      const p = document.createElement("div");
      p.textContent = part;
      el.appendChild(p);
      continue;
    }
    el.appendChild(part);
  }

  chatBody.appendChild(el);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function makeList(items, ordered = false) {
  const list = document.createElement(ordered ? "ol" : "ul");
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  }
  return list;
}

function makeSourcesChips(sources) {
  const wrap = document.createElement("div");
  wrap.className = "sources";
  for (const s of sources) {
    const chip = document.createElement("span");
    chip.className = "source-chip";
    chip.textContent = s;
    wrap.appendChild(chip);
  }
  return wrap;
}

function respondTo(promptRaw) {
  const prompt = promptRaw.trim().toLowerCase();
  const k = demoData.kpis;

  // Simple intent routing
  if (/(resumen|semanal|dirección)/i.test(prompt)) {
    const top = [
      `Resumen (${demoData.period}):`,
      `- Ingresos: ${formatMoneyEUR(k.revenue.current)} (${k.revenue.delta >= 0 ? "+" : ""}${formatMoneyEUR(
        Math.abs(k.revenue.delta)
      )} vs. mes anterior)`,
      `- Asistencia: ${k.attendance.current.toFixed(1)}% (${k.attendance.delta >= 0 ? "+" : ""}${k.attendance.delta.toFixed(
        1
      )}pp)`,
      `- Morosidad: ${k.delinquency.current.toFixed(1)}% (${k.delinquency.delta >= 0 ? "+" : ""}${k.delinquency.delta.toFixed(
        1
      )}pp)`,
      `- Retención: ${k.retention.current.toFixed(1)}% (${k.retention.delta >= 0 ? "+" : ""}${k.retention.delta.toFixed(
        1
      )}pp)`
    ];

    return {
      parts: [
        top.join("\n"),
        makeList(
          [
            "Atacar morosidad en U13/U15 con segmentación + recordatorio con link de pago.",
            "Reducir caída de asistencia en U15 A: ajustar horario o microciclo (2 semanas de prueba).",
            "Definir 1 KPI rector por área (Deportivo/Finanzas) y revisarlo todos los lunes (15 min)."
          ],
          true
        ),
        makeSourcesChips(demoData.sources)
      ]
    };
  }

  if (/(moro|deuda|impago|cobran)/i.test(prompt)) {
    const worst = demoData.segments.delinquencyByCategory
      .slice()
      .sort((a, b) => b.value - a.value)
      .slice(0, 2)
      .map((x) => `${x.name} (${x.value.toFixed(1)}%)`);
    return {
      parts: [
        `Morosidad actual: ${k.delinquency.current.toFixed(1)}% (${k.delinquency.delta >= 0 ? "+" : ""}${k.delinquency.delta.toFixed(
          1
        )}pp). Mayor concentración en: ${worst.join(", ")}.`,
        makeList(
          [
            "Segmentar por antigüedad: 7–14 días, 15–30, 30+ (mensajes distintos).",
            "Recordatorio automático + link de pago + opción de débito/recurrente.",
            "Registrar becas/excepciones para no “ensuciar” el KPI."
          ],
          true
        ),
        makeSourcesChips(["Pagos", "Planillas"])
      ]
    };
  }

  if (/(asistencia|present|falt|confirm)/i.test(prompt)) {
    const worst = demoData.segments.attendanceByTeam
      .slice()
      .sort((a, b) => a.value - b.value)
      .slice(0, 2)
      .map((x) => `${x.name} (${x.value.toFixed(1)}%)`);
    return {
      parts: [
        `Asistencia actual: ${k.attendance.current.toFixed(1)}% (${k.attendance.delta >= 0 ? "+" : ""}${k.attendance.delta.toFixed(
          1
        )}pp). Equipos con peor asistencia: ${worst.join(", ")}.`,
        makeList(
          [
            "Cruzar ausencias con día/horario: reprogramar 1 turno por 2 semanas y medir impacto.",
            "Activar confirmación 24h + 3h antes (con regla por categoría).",
            "Detectar “top ausentes” y hablar con familias: barreras (transporte, costo, horario)."
          ],
          true
        ),
        makeSourcesChips(["Asistencia"])
      ]
    };
  }

  if (/(carga|lesi|riesgo|rpe|gps)/i.test(prompt)) {
    return {
      parts: [
        "Riesgo (demo): aumentó la variabilidad de carga en U15 A y hay 3 jugadores con tendencia a fatiga.",
        makeList(
          [
            "Bajar 10–15% el volumen de alta intensidad 1 sesión esta semana.",
            "Reforzar recuperación (sueño/hidratación) con checklist simple post-entreno.",
            "Crear alerta: “2 semanas seguidas de subida fuerte” por jugador."
          ],
          true
        ),
        makeSourcesChips(["Deportivo", "Asistencia"])
      ]
    };
  }

  return {
    parts: [
      "Te puedo ayudar con morosidad, asistencia, ingresos, retención y riesgo de carga. Elegí una de estas:",
      makeList(
        [
          "“Dame un resumen semanal con 3 acciones.”",
          "“¿Qué categorías tienen mayor morosidad?”",
          "“¿Qué pasó con la asistencia en 4 semanas?”",
          "“Detectá riesgos de carga y recomendá ajustes.”"
        ],
        false
      ),
      makeSourcesChips(demoData.sources)
    ]
  };
}

function initChat() {
  if (!chatBody || !chatForm || !chatInput) return;

  addMessage("ai", [
    "Soy el Experto AI del club (demo). Preguntame por morosidad, asistencia, ingresos, retención o carga.",
    makeSourcesChips(demoData.sources)
  ]);
}

initChat();

if (chatForm && chatInput) {
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = chatInput.value.trim();
    if (!q) return;
    addMessage("user", [q]);
    chatInput.value = "";

    // Small delay to feel like "thinking"
    setTimeout(() => {
      const { parts } = respondTo(q);
      addMessage("ai", parts);
    }, 250);
  });
}

for (const btn of document.querySelectorAll("[data-prompt]")) {
  btn.addEventListener("click", () => {
    if (!chatInput || !chatForm) return;
    const p = btn.getAttribute("data-prompt");
    if (!p) return;
    chatInput.value = p;
    chatInput.focus();
    chatForm.requestSubmit();
  });
}
