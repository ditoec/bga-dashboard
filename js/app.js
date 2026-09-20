// Menyusun data publik (js/data.js) ke dalam primitif chart (js/charts.js).
// Lihat catatan sumber di js/data.js — beberapa angka ditandai estimasi.

const $ = (sel) => document.querySelector(sel);

function idDecimal(n, decimals = 0) {
  return n.toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function seriesColors() {
  const style = getComputedStyle(document.documentElement);
  const get = (name) => style.getPropertyValue(name).trim();
  return {
    c1: get("--series-1"),
    c2: get("--series-2"),
    c3: get("--series-3"),
    c4: get("--series-4"),
    c5: get("--series-5"),
    c6: get("--series-6"),
  };
}

function formatByUnit(value, unit) {
  switch (unit) {
    case "ha":
      return idDecimal(value, 0) + " ha";
    case "juta ton":
      return idDecimal(value, 2) + " juta ton";
    case "ribu ton":
      return idDecimal(Math.round(value), 0) + " ribu ton";
    case "%":
      return idDecimal(value, 1) + "%";
    case "Rp triliun":
      return "Rp" + idDecimal(value, 2) + " triliun";
    default:
      return idDecimal(value) + " " + unit;
  }
}

function deltaEl(curr, prev, { decimals = 1, positiveIsGood = true } = {}) {
  const diff = curr - prev;
  const pct = prev !== 0 ? (diff / prev) * 100 : 0;
  const up = diff >= 0;
  const span = document.createElement("span");
  if (positiveIsGood === null) {
    span.className = "kpi-delta neutral";
  } else {
    const good = positiveIsGood ? up : !up;
    span.className = `kpi-delta ${up ? "up" : "down"} ${good ? "good" : "bad"}`;
  }
  const arrow = up ? "↑" : "↓";
  span.textContent = `${arrow} ${idDecimal(Math.abs(pct), decimals)}%`;
  return span;
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

const KPI_DEFS = [
  { key: "plantedArea", label: "Luas Tertanam", positiveIsGood: null, sparkline: PLANTED_AREA_HA, accentKey: "c1", subBase: "vs. FY2024" },
  { key: "ffbHarvested", label: "Produksi TBS (Inti & Plasma)", positiveIsGood: true, subBase: "vs. FY2024" },
  { key: "ffbProcessed", label: "TBS Diolah Pabrik", positiveIsGood: null, subBase: null },
  { key: "cpoProduction", label: "Produksi CPO", positiveIsGood: true, subBase: "vs. FY2024" },
  { key: "pkProduction", label: "Produksi Inti Sawit (PK)", positiveIsGood: null, subBase: null },
  { key: "oer", label: "Rendemen CPO (OER)", positiveIsGood: true, sparkline: OER, accentKey: "c3", subBase: "vs. FY2024" },
  { key: "revenue", label: "Pendapatan", positiveIsGood: true, sparkline: REVENUE_IDR_T.map((d) => d.value), accentKey: "c2", subBase: "vs. FY2024" },
  { key: "netProfit", label: "Laba Bersih", positiveIsGood: true, sparkline: NET_PROFIT_IDR_T.map((d) => d.value), accentKey: "c4", subBase: "vs. FY2024" },
];

function renderKpis() {
  const grid = $("#kpi-grid");
  grid.innerHTML = "";
  const colors = seriesColors();

  KPI_DEFS.forEach((def) => {
    const h = HEADLINE[def.key];
    const valueText = formatByUnit(h.curr, h.unit);
    const delta = h.prev !== undefined ? deltaEl(h.curr, h.prev, { positiveIsGood: def.positiveIsGood }) : null;
    const subParts = [];
    if (h.prev !== undefined && def.subBase) subParts.push(def.subBase);
    if (h.note) subParts.push(h.note);
    grid.appendChild(
      buildKpiTile({
        id: "kpi-" + def.key,
        label: def.label,
        value: valueText,
        delta,
        sub: subParts.join(" · ") || null,
        sparklineValues: def.sparkline,
        accent: def.accentKey ? colors[def.accentKey] : undefined,
      })
    );
  });
}

function renderTrendCharts() {
  const { c1, c2, c3, c4 } = seriesColors();

  lineChart($("#chart-planted"), {
    categories: PLANTED_YEARS,
    series: [{ name: "Luas tertanam", color: c1, values: PLANTED_AREA_HA }],
    valueFormat: (v) => idDecimal(v, 0),
  });

  lineChart($("#chart-oer"), {
    categories: OER_YEARS,
    series: [{ name: "OER", color: c3, values: OER }],
    valueFormat: (v) => idDecimal(v, 1) + "%",
  });

  const fin = lineChart($("#chart-financial"), {
    categories: FINANCIAL_YEARS,
    series: [
      { name: "Pendapatan", color: c2, values: REVENUE_IDR_T.map((d) => d.value) },
      { name: "Laba bersih", color: c4, values: NET_PROFIT_IDR_T.map((d) => d.value) },
    ],
    valueFormat: (v) => "Rp" + idDecimal(v, 1) + "T",
  });
  $("#legend-financial").innerHTML = fin.legend;
  $("#financial-subtitle").textContent =
    "Rp triliun · titik 2022 dan 2024 diestimasi dari persentase perubahan YoY resmi (lihat sumber)";
}

function renderCompositionDonuts() {
  const { c1, c2, c3, c5, c6 } = seriesColors();

  const nucleus = donutChart($("#chart-nucleus"), {
    categories: ["Inti (nucleus)", "Plasma"],
    values: [NUCLEUS_HA_2025, PLASMA_HA_2025],
    colors: [c1, c3],
    centerLabel: idDecimal(NUCLEUS_HA_2025 + PLASMA_HA_2025, 0),
    centerSub: "ha tertanam",
    unit: "ha",
  });
  $("#legend-nucleus").innerHTML = nucleus.legend;

  const regionSum = REGION_SHARE_BASE_2022.reduce((a, r) => a + r.ha2022, 0);
  const totalPlanted2025 = PLANTED_AREA_HA[PLANTED_AREA_HA.length - 1];
  const regionValues = REGION_SHARE_BASE_2022.map((r) => Math.round(totalPlanted2025 * (r.ha2022 / regionSum)));
  const region = donutChart($("#chart-region"), {
    categories: REGION_SHARE_BASE_2022.map((r) => r.region),
    values: regionValues,
    colors: [c1, c3, c6],
    centerLabel: idDecimal(totalPlanted2025, 0),
    centerSub: "ha (estimasi)",
    unit: "ha",
  });
  $("#legend-region").innerHTML = region.legend;

  const ownership = donutChart($("#chart-ownership"), {
    categories: OWNERSHIP.map((o) => o.name),
    values: OWNERSHIP.map((o) => o.pct),
    colors: [c1, c3, c5],
    centerLabel: "100%",
    centerSub: "kepemilikan",
    unit: "%",
  });
  $("#legend-ownership").innerHTML = ownership.legend;
}

function renderSustainabilityPanel() {
  const panel = $("#sustainability-panel");
  panel.innerHTML = "";

  const rspoPct = Math.round((SUSTAINABILITY.rspoMillsCertified / COMPANY.mills) * 100);
  const meterBlock = document.createElement("div");
  meterBlock.className = "meter-block";
  meterBlock.innerHTML = `
    <div class="meter-label-row">
      <span class="meter-label">Sertifikasi RSPO (pabrik)</span>
      <span class="meter-value">${SUSTAINABILITY.rspoMillsCertified} dari ${COMPANY.mills} pabrik (${rspoPct}%)</span>
    </div>
    <div class="meter-track"><div class="meter-fill" style="width:${rspoPct}%"></div></div>
    <p class="meter-note">Target: 100% kebun &amp; pabrik tersertifikasi RSPO pada ${SUSTAINABILITY.rspoTargetYear}</p>
  `;
  panel.appendChild(meterBlock);

  const statRow = document.createElement("div");
  statRow.className = "stat-row";
  const stats = [
    { value: String(SUSTAINABILITY.ispoCertifications), label: `Sertifikasi ISPO · target 100% (${SUSTAINABILITY.ispoTargetYear})` },
    { value: idDecimal(SUSTAINABILITY.cspoCspkTonnes2025, 0) + " ton", label: "CSPO + CSPK bersertifikat, diproduksi 2025" },
    { value: ">" + idDecimal(COMPANY.employees, 0), label: "Karyawan Grup BGA" },
  ];
  stats.forEach((s) => {
    const item = document.createElement("div");
    item.className = "stat-row-item";
    const val = document.createElement("div");
    val.className = "stat-value";
    val.textContent = s.value;
    const lab = document.createElement("div");
    lab.className = "stat-label";
    lab.textContent = s.label;
    item.append(val, lab);
    statRow.appendChild(item);
  });
  panel.appendChild(statRow);

  const conservation = document.createElement("p");
  conservation.className = "meter-note";
  conservation.style.marginTop = "12px";
  conservation.textContent = `Area konservasi: ${SUSTAINABILITY.conservation.hcv}% HCV · ${SUSTAINABILITY.conservation.hcs}% HCS · ${SUSTAINABILITY.conservation.peat}% gambut · ${SUSTAINABILITY.conservation.other}% lainnya`;
  panel.appendChild(conservation);
}

function renderFactGrid() {
  const grid = $("#fact-grid");
  grid.innerHTML = "";
  const facts = [
    { label: "Didirikan", value: `${COMPANY.founded}, oleh ${COMPANY.founder}` },
    { label: "Tercatat di bursa", value: `Singapore Exchange, kode P8Z, sejak ${COMPANY.listedSince}` },
    { label: "Grup usaha", value: `${COMPANY.groupName}, anak usaha operasional dari ${COMPANY.parentListed}` },
    { label: "Kantor operasional", value: COMPANY.hqOperational },
    { label: "Kantor terdaftar", value: COMPANY.hqRegistered },
    { label: "Provinsi operasi", value: COMPANY.provinces.join(", ") },
    { label: "Jumlah pabrik", value: `${COMPANY.mills} pabrik kelapa sawit` },
    { label: "Kapasitas olah TBS", value: `±${idDecimal(COMPANY.millCapacityTonPerYear / 1000000, 0)} juta ton/tahun` },
    { label: "Karyawan", value: `>${idDecimal(COMPANY.employees, 0)} orang` },
  ];
  facts.forEach((f) => {
    const item = document.createElement("div");
    item.className = "fact-item";
    const lab = document.createElement("p");
    lab.className = "fact-label";
    lab.textContent = f.label;
    const val = document.createElement("p");
    val.className = "fact-value";
    val.textContent = f.value;
    item.append(lab, val);
    grid.appendChild(item);
  });
}

function renderEntityGrid() {
  const grid = $("#entity-grid");
  grid.innerHTML = "";
  MILL_DIRECTORY.forEach((e) => {
    const card = document.createElement("div");
    card.className = "entity-card";
    const pt = document.createElement("p");
    pt.className = "entity-pt";
    pt.textContent = e.pt;
    const unit = document.createElement("p");
    unit.className = "entity-unit";
    unit.textContent = e.unit;
    const loc = document.createElement("p");
    loc.className = "entity-location";
    loc.textContent = e.location;
    card.append(pt, unit, loc);
    grid.appendChild(card);
  });
}

function renderSources() {
  const list = $("#source-list");
  list.innerHTML = "";
  SOURCES.forEach((s) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = s.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = s.label;
    li.appendChild(a);
    list.appendChild(li);
  });
}

function renderAll() {
  renderKpis();
  renderTrendCharts();
  renderCompositionDonuts();
  renderSustainabilityPanel();
  renderFactGrid();
  renderEntityGrid();
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
  btn.textContent = current === "dark" ? "Mode Terang" : "Mode Gelap";
}

function initAsOf() {
  $("#asof-label").textContent = AS_OF;
}

window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initAsOf();
  renderSources();
  renderAll();
});

window.addEventListener("resize", () => {
  clearTimeout(window.__bgaResizeTimer);
  window.__bgaResizeTimer = setTimeout(renderAll, 150);
});
