// =====================================================================
// Helpers
// =====================================================================
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const en = (n, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

function initialsOf(name) {
  return name.split(" ").filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("");
}

// =====================================================================
// Scroll-reveal + animated counters + tilt cards
// (the Three.js hero visual lives in js/site-hero3d.js, loaded separately
// so a slow/blocked CDN can never hold up the content below)
// =====================================================================
function initReveal() {
  const targets = $$(".reveal, .reveal-stagger");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  targets.forEach((t) => io.observe(t));
}

function animateCount(el, target, { decimals = 0, prefix = "", suffix = "", duration = 1400 } = {}) {
  const start = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + en(target * eased, decimals) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initCounters() {
  const els = $$("[data-count]");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        animateCount(el, target, {
          decimals: parseInt(el.dataset.decimals || "0", 10),
          prefix: el.dataset.prefix || "",
          suffix: el.dataset.suffix || "",
        });
        io.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  els.forEach((el) => io.observe(el));
}

function initTilt() {
  $$(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--ry", `${px * 14}deg`);
      card.style.setProperty("--rx", `${-py * 14}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

function initNavScroll() {
  const nav = $(".site-nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

// =====================================================================
// Data-driven content
// =====================================================================
function fillHeroStats() {
  const i = PLANTED_AREA_HA.length - 1;
  const stats = [
    { num: PLANTED_AREA_HA[i], decimals: 0, suffix: "", label: "Hectares planted" },
    { num: FFB_INTERNAL_MT[i] / 1e6, decimals: 2, suffix: "M", label: "MT of FFB harvested, FY2025" },
    { num: COMPANY.mills, decimals: 0, suffix: "", label: "Palm oil mills" },
    { num: COMPANY.employees, decimals: 0, suffix: "", label: "Employees" },
  ];
  const host = $("#hero-stats");
  host.innerHTML = stats.map((s) => `
    <div class="hero-stat">
      <div class="num" data-count="${s.num}" data-decimals="${s.decimals}" data-suffix="${s.suffix}">0</div>
      <div class="label">${s.label}</div>
    </div>`).join("");
}

function fillRegions() {
  const host = $("#region-cards");
  host.innerHTML = REGIONS.map((r) => `
    <div class="tilt-card region-card reveal">
      <span class="rtag">${REGION_NAME_EN[r.name] || r.name}</span>
      <h3>${r.plantedHa > 0 ? en(r.plantedHa) + " ha" : "Mill only"}</h3>
      <div class="rrow"><span>Planted area</span><span>${r.plantedHa > 0 ? en(r.plantedSharePct, 1) + "%" : "released 2025"}</span></div>
      <div class="rrow"><span>Mills</span><span>${r.mills} &middot; ${en(r.millCapacityTph)} tph</span></div>
      <div class="rrow"><span>FFB output FY2025</span><span>${r.ffb2025Mt ? en(r.ffb2025Mt / 1e6, 1) + "M MT" : "third-party intake"}</span></div>
      <div class="rrow"><span>Employees</span><span>${en(r.employees)}</span></div>
    </div>`).join("");
}

function fillPerformance() {
  const i = REVENUE_IDR_B.length - 1;
  const cards = [
    { num: REVENUE_IDR_B[i] / 1000, decimals: 2, unit: "T", label: "Revenue, FY2025", delta: "+" + en(REVENUE_GROWTH_PCT[i], 1) + "% YoY" },
    { num: EBITDA_IDR_B[i] / 1000, decimals: 2, unit: "T", label: "EBITDA", delta: en(EBITDA_MARGIN_PCT[i], 1) + "% margin" },
    { num: NET_PROFIT_IDR_B[i] / 1000, decimals: 2, unit: "T", label: "Net profit", delta: "+" + en(((NET_PROFIT_IDR_B[i] - NET_PROFIT_IDR_B[i - 1]) / NET_PROFIT_IDR_B[i - 1]) * 100, 1) + "% YoY" },
    { num: TOTAL_ASSETS_IDR_B[i] / 1000, decimals: 2, unit: "T", label: "Total assets", delta: "IDR, +" + en(((TOTAL_ASSETS_IDR_B[i] - TOTAL_ASSETS_IDR_B[i - 1]) / TOTAL_ASSETS_IDR_B[i - 1]) * 100, 1) + "% YoY" },
  ];
  $("#perf-stats").innerHTML = cards.map((c) => `
    <div class="stat-card reveal">
      <div class="num" data-count="${c.num}" data-decimals="${c.decimals}" data-prefix="Rp ">0<span class="unit">${c.unit}</span></div>
      <div class="label">${c.label}</div>
      <div class="delta">${c.delta}</div>
    </div>`).join("");

  const style = getComputedStyle(document.documentElement);
  const gold = style.getPropertyValue("--gold").trim();
  const green = style.getPropertyValue("--green").trim();
  const chart = lineChart($("#perf-chart"), {
    categories: YEARS5,
    series: [
      { name: "Revenue", color: gold, values: REVENUE_IDR_B.map((v) => v / 1000) },
      { name: "EBITDA", color: green, values: EBITDA_IDR_B.map((v) => v / 1000) },
    ],
    valueFormat: (v) => "Rp" + en(v, 1) + "T",
  });
  $("#perf-chart-legend").innerHTML = chart.legend;
}

function fillSustainability() {
  const i = 4;
  const cards = [
    { big: `${RSPO_MILLS_CERTIFIED[i]}/${COMPANY.mills}`, title: "RSPO-certified mills", text: `${en(RSPO_CERTIFIED_HA[i])} ha certified (${RSPO_HGU_COVERAGE_PCT_2025}% of landbank) &middot; full certification targeted for ${RSPO_TARGET_YEAR}.` },
    { big: `${GHG.netEmissions2025MtCo2e.toFixed(2)}M`, title: "Net tCO2e, FY2025", text: `Emission intensity down ${GHG.intensityReductionVs2016Pct}% vs. the 2016 baseline &middot; ${GHG.methaneCaptureFacilities} methane-capture facilities online.` },
    { big: `${en(PLASMA_ALLOCATION_PCT[i], 1)}%`, title: "Smallholder plasma partnership", text: `Well above the ${PLASMA_REGULATORY_MIN_PCT}% regulatory floor &mdash; ${en(PLASMA_ALLOCATION_PCT.length)} years of steady growth in smallholder land allocation.` },
    { big: `${WORKFORCE.womenSharePct2025}%`, title: "Women in the workforce", text: `${en(WORKFORCE.total2025)} employees group-wide &middot; ${WORKFORCE.womenBoardPct}% of the Board are women.` },
  ];
  $("#sustain-cards").innerHTML = cards.map((c) => `
    <div class="sustain-card reveal">
      <span class="sbig">${c.big}</span>
      <h4>${c.title}</h4>
      <p>${c.text}</p>
    </div>`).join("");
}

function fillLeadership() {
  const people = [...BOARD, ...KEY_MANAGEMENT];
  $("#leader-grid").innerHTML = people.map((p) => `
    <div class="flip-card reveal" tabindex="0">
      <div class="flip-inner">
        <div class="flip-face flip-front">
          <div class="leader-avatar">${initialsOf(p.name)}</div>
          <div class="lname">${p.name}</div>
          <div class="ltitle">${p.title.split("&middot;")[0].split("·")[0].trim()}</div>
        </div>
        <div class="flip-face flip-back">
          <div class="leader-avatar">${initialsOf(p.name)}</div>
          <div class="lname">${p.name}</div>
          <div class="ltitle">${p.title}</div>
          <div class="lsince">With the Group since ${p.since}</div>
        </div>
      </div>
    </div>`).join("");
}

function fillMilestones() {
  $("#milestone-scroller").innerHTML = MILESTONES_EN.map((m) => `
    <div class="tl-card">
      <div class="tl-year">${m.year}</div>
      <div class="tl-text">${m.text}</div>
    </div>`).join("");
}

function fillAwards() {
  const top = AWARDS_EN.slice(0, 6);
  $("#award-grid").innerHTML = top.map((a) => `
    <div class="award-tile reveal">
      <span class="award-badge">${a.year}</span>
      <p>${a.text}</p>
    </div>`).join("");
}

// =====================================================================
// Init
// =====================================================================
window.addEventListener("DOMContentLoaded", () => {
  fillHeroStats();
  fillRegions();
  fillPerformance();
  fillSustainability();
  fillLeadership();
  fillMilestones();
  fillAwards();

  initNavScroll();
  initReveal();
  initCounters();
  initTilt();
});
