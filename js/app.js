// Wires mock data (js/data.js) into the chart primitives (js/charts.js).

const $ = (sel) => document.querySelector(sel);

const state = { region: "All regions" };

function fmtCompact(n, unit = "") {
  if (Math.abs(n) >= 1000) return (n / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "K" + unit;
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 }) + unit;
}

function deltaEl(curr, prev, { decimals = 1, suffix = "%", positiveIsGood = true } = {}) {
  const diff = curr - prev;
  const pct = prev !== 0 ? (diff / prev) * 100 : 0;
  const up = diff >= 0;
  const good = positiveIsGood ? up : !up;
  const arrow = up ? "↑" : "↓";
  const span = document.createElement("span");
  span.className = `kpi-delta ${up ? "up" : "down"} ${good ? "good" : "bad"}`;
  span.textContent = `${arrow} ${Math.abs(pct).toFixed(decimals)}${suffix}`;
  return span;
}

function filteredEstates() {
  if (state.region === "All regions") return ESTATES;
  return ESTATES.filter((e) => e.region === state.region);
}

function weightedYield(estates) {
  const totalMature = estates.reduce((a, e) => a + e.mature, 0);
  if (totalMature === 0) return 0;
  return estates.reduce((a, e) => a + e.yield * e.mature, 0) / totalMature;
}

function activeMills(estates) {
  const keys = new Set();
  let utilSum = 0, utilCount = 0;
  estates.forEach((e) => {
    if (e.millCapacity > 0) keys.add(e.mill);
    if (typeof e.millUtilization === "number") { utilSum += e.millUtilization; utilCount++; }
  });
  return { count: keys.size, avgUtilization: utilCount ? utilSum / utilCount : null };
}

function buildKpiTile({ id, label, value, delta, sub, sparklineValues, accent }) {
  const tile = document.createElement("div");
  tile.className = "kpi-tile";
  tile.id = id;

  const labelEl = document.createElement("p");
  labelEl.className = "kpi-label";
  labelEl.textContent = label;
  tile.appendChild(labelEl);

  const row = document.createElement("div");
  row.className = "kpi-value-row";
  const valEl = document.createElement("span");
  valEl.className = "kpi-value";
  valEl.textContent = value;
  row.appendChild(valEl);
  if (delta) row.appendChild(delta);
  tile.appendChild(row);

  if (sub) {
    const subEl = document.createElement("p");
    subEl.className = "kpi-sub";
    subEl.textContent = sub;
    tile.appendChild(subEl);
  }

  if (sparklineValues) {
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "kpi-spark");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "28");
    tile.appendChild(svg);
    requestAnimationFrame(() => sparkline(svg, sparklineValues, accent));
  }

  return tile;
}

function renderKpis() {
  const grid = $("#kpi-grid");
  grid.innerHTML = "";

  const i = MONTHS.length - 1;
  const style = getComputedStyle(document.documentElement);
  const c1 = style.getPropertyValue("--series-1").trim();
  const c2 = style.getPropertyValue("--series-2").trim();
  const c3 = style.getPropertyValue("--series-3").trim();
  const c4 = style.getPropertyValue("--series-4").trim();

  grid.appendChild(buildKpiTile({
    id: "kpi-ffb", label: "FFB production (this month)",
    value: fmtCompact(FFB_PRODUCTION[i] * 1000) + " t",
    delta: deltaEl(FFB_PRODUCTION[i], FFB_PRODUCTION[i - 1]),
    sub: "Group‑wide · vs. previous month",
    sparklineValues: FFB_PRODUCTION.slice(-6), accent: c1,
  }));

  grid.appendChild(buildKpiTile({
    id: "kpi-cpo", label: "CPO production (this month)",
    value: fmtCompact(CPO_PRODUCTION[i] * 1000) + " t",
    delta: deltaEl(CPO_PRODUCTION[i], CPO_PRODUCTION[i - 1]),
    sub: "Group‑wide · vs. previous month",
    sparklineValues: CPO_PRODUCTION.slice(-6), accent: c2,
  }));

  grid.appendChild(buildKpiTile({
    id: "kpi-oer", label: "Oil extraction rate (OER)",
    value: OER[i].toFixed(1) + "%",
    delta: deltaEl(OER[i], OER[i - 1], { decimals: 1 }),
    sub: "Group‑wide · CPO / FFB processed",
    sparklineValues: OER.slice(-6), accent: c3,
  }));

  grid.appendChild(buildKpiTile({
    id: "kpi-ker", label: "Kernel extraction rate (KER)",
    value: KER[i].toFixed(1) + "%",
    delta: deltaEl(KER[i], KER[i - 1], { decimals: 1 }),
    sub: "Group‑wide · PK / FFB processed",
    sparklineValues: KER.slice(-6), accent: c4,
  }));

  grid.appendChild(buildKpiTile({
    id: "kpi-price", label: "CPO reference price",
    value: "$" + formatNumber(CPO_PRICE[i]),
    delta: deltaEl(CPO_PRICE[i], CPO_PRICE[i - 1]),
    sub: "Group‑wide · USD / metric ton",
    sparklineValues: CPO_PRICE.slice(-6), accent: c2,
  }));

  const est = filteredEstates();
  const mature = est.reduce((a, e) => a + e.mature, 0);
  const immature = est.reduce((a, e) => a + e.immature, 0);
  grid.appendChild(buildKpiTile({
    id: "kpi-area", label: "Planted area",
    value: fmtCompact(mature + immature) + " ha",
    sub: `${state.region} · ${formatNumber(mature)} ha mature / ${formatNumber(immature)} ha immature`,
  }));

  grid.appendChild(buildKpiTile({
    id: "kpi-yield", label: "FFB yield",
    value: weightedYield(est).toFixed(1) + " t/ha",
    sub: `${state.region} · estate‑weighted, trailing 12 months`,
  }));

  const mills = activeMills(est);
  grid.appendChild(buildKpiTile({
    id: "kpi-mills", label: "Active mills",
    value: String(mills.count),
    sub: `${state.region} · ${mills.avgUtilization !== null ? mills.avgUtilization.toFixed(0) + "% avg. utilization" : "n/a"}`,
  }));
}

function renderGroupCharts() {
  const style = getComputedStyle(document.documentElement);
  const c1 = style.getPropertyValue("--series-1").trim();
  const c2 = style.getPropertyValue("--series-2").trim();
  const c3 = style.getPropertyValue("--series-3").trim();
  const c4 = style.getPropertyValue("--series-4").trim();

  const prod = lineChart($("#chart-production"), {
    categories: MONTHS,
    series: [
      { name: "FFB production", color: c1, values: FFB_PRODUCTION },
      { name: "CPO production", color: c2, values: CPO_PRODUCTION },
    ],
    valueFormat: (v) => formatNumber(v, 0) + "K",
  });
  $("#legend-production").innerHTML = prod.legend;

  const ext = lineChart($("#chart-extraction"), {
    categories: MONTHS,
    series: [
      { name: "OER", color: c3, values: OER },
      { name: "KER", color: c4, values: KER },
    ],
    valueFormat: (v) => v.toFixed(1) + "%",
  });
  $("#legend-extraction").innerHTML = ext.legend;

  lineChart($("#chart-price"), {
    categories: MONTHS,
    series: [{ name: "CPO price", color: c2, values: CPO_PRICE }],
    valueFormat: (v) => "$" + formatNumber(v),
  });

  verticalBarChart($("#chart-rainfall"), {
    categories: MONTHS,
    values: RAINFALL_ACTUAL,
    reference: RAINFALL_AVERAGE,
    referenceName: "10‑yr average",
    color: c1,
    valueFormat: (v) => formatNumber(v) + "mm",
  });
}

function renderRegionCharts() {
  const style = getComputedStyle(document.documentElement);
  const c1 = style.getPropertyValue("--series-1").trim();
  const c3 = style.getPropertyValue("--series-3").trim();
  const est = filteredEstates().slice().sort((a, b) => b.yield - a.yield);

  horizontalBarChart($("#chart-yield"), {
    categories: est.map((e) => e.name),
    values: est.map((e) => e.yield),
    color: c1,
    unit: " t/ha",
  });

  const mature = est.reduce((a, e) => a + e.mature, 0);
  const immature = est.reduce((a, e) => a + e.immature, 0);
  const donut = donutChart($("#chart-area"), {
    categories: ["Mature", "Immature"],
    values: [mature, immature],
    colors: [c1, c3],
    centerLabel: fmtCompact(mature + immature),
    centerSub: "hectares",
  });
  $("#legend-area").innerHTML = donut.legend;

  $("#yield-subtitle").textContent = `${state.region} · metric tons FFB per mature hectare, trailing 12 months`;
  $("#area-subtitle").textContent = `${state.region} · mature vs. immature hectares`;
}

function statusPillHtml(status) {
  const meta = STATUS_META[status];
  const span = document.createElement("span");
  span.className = "pill";
  const dot = document.createElement("span");
  dot.className = "status-dot";
  dot.style.background = meta.dot;
  const label = document.createElement("span");
  label.className = `status-label ${status}`;
  label.textContent = meta.label;
  span.append(dot, label);
  return span;
}

function renderEstateCards() {
  const container = $("#estate-cards");
  container.innerHTML = "";
  const est = filteredEstates().slice().sort((a, b) => b.yield - a.yield);
  est.forEach((e) => {
    const card = document.createElement("div");
    card.className = "estate-card";

    const top = document.createElement("div");
    top.className = "estate-card-top";
    const dot = document.createElement("span");
    dot.className = "status-dot";
    dot.style.background = STATUS_META[e.status].dot;
    const name = document.createElement("span");
    name.className = "estate-name";
    name.textContent = e.name;
    top.append(dot, name);

    const region = document.createElement("p");
    region.className = "estate-region";
    region.textContent = e.region;

    const stats = document.createElement("div");
    stats.className = "estate-stats";
    stats.innerHTML = `<span>Yield <b>${e.yield.toFixed(1)}</b> t/ha</span>`;
    const oer = document.createElement("span");
    oer.innerHTML = `OER <b>${e.oer.toFixed(1)}</b>%`;
    stats.appendChild(oer);

    card.append(top, region, stats);
    container.appendChild(card);
  });
  $("#estate-status-subtitle").textContent = `${state.region} · current operating status by estate`;
}

function renderTable() {
  const tbody = $("#estate-table-body");
  tbody.innerHTML = "";
  const est = filteredEstates().slice().sort((a, b) => b.yield - a.yield);
  est.forEach((e) => {
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = e.name;
    const tdRegion = document.createElement("td");
    tdRegion.textContent = e.region;
    const tdMature = document.createElement("td");
    tdMature.textContent = formatNumber(e.mature);
    const tdImmature = document.createElement("td");
    tdImmature.textContent = formatNumber(e.immature);
    const tdYield = document.createElement("td");
    tdYield.textContent = e.yield.toFixed(1);
    const tdOer = document.createElement("td");
    tdOer.textContent = e.oer.toFixed(1);
    const tdUtil = document.createElement("td");
    tdUtil.textContent = typeof e.millUtilization === "number" ? e.millUtilization + "%" : "—";
    const tdStatus = document.createElement("td");
    tdStatus.appendChild(statusPillHtml(e.status));

    tr.append(tdName, tdRegion, tdMature, tdImmature, tdYield, tdOer, tdUtil, tdStatus);
    tbody.appendChild(tr);
  });
  $("#table-subtitle").textContent = `${state.region} · sorted by FFB yield, highest first`;
}

function renderAll() {
  renderKpis();
  renderGroupCharts();
  renderRegionCharts();
  renderEstateCards();
  renderTable();
}

function initFilters() {
  const select = $("#region-select");
  REGIONS.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    select.appendChild(opt);
  });
  select.value = state.region;
  select.addEventListener("change", () => {
    state.region = select.value;
    renderKpis();
    renderRegionCharts();
    renderEstateCards();
    renderTable();
  });
}

function initTheme() {
  const btn = $("#theme-toggle");
  const stored = localStorage.getItem("bga-theme");
  if (stored) document.documentElement.setAttribute("data-theme", stored);
  updateThemeLabel();

  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("bga-theme", next);
    updateThemeLabel();
    renderAll();
  });
}

function updateThemeLabel() {
  const btn = $("#theme-toggle");
  const current = document.documentElement.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  btn.textContent = current === "dark" ? "Light mode" : "Dark mode";
}

function initAsOf() {
  const last = MONTHS[MONTHS.length - 1];
  $("#asof-label").textContent = `Data as of ${last}`;
}

window.addEventListener("DOMContentLoaded", () => {
  initFilters();
  initTheme();
  initAsOf();
  renderAll();
});

window.addEventListener("resize", () => {
  clearTimeout(window.__bgaResizeTimer);
  window.__bgaResizeTimer = setTimeout(renderAll, 150);
});
