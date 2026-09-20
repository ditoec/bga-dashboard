// Merender data (js/data.js) ke setiap halaman lewat primitif chart (js/charts.js).
// Setiap fungsi render dijaga dengan pengecekan elemen, sehingga file ini aman
// dimuat di semua halaman — hanya bagian yang containernya ada di halaman
// tersebut yang benar-benar digambar.

const $ = (sel) => document.querySelector(sel);

function idDecimal(n, decimals = 0) {
  return n.toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function idrTriliun(miliar, decimals = 2) {
  return "Rp" + idDecimal(miliar / 1000, decimals) + " T";
}
function idrMiliar(miliar, decimals = 0) {
  return "Rp" + idDecimal(miliar, decimals) + " M";
}

function seriesColors() {
  const style = getComputedStyle(document.documentElement);
  const get = (name) => style.getPropertyValue(name).trim();
  return { c1: get("--series-1"), c2: get("--series-2"), c3: get("--series-3"), c4: get("--series-4"), muted: get("--text-muted") };
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
  if (id) tile.id = id;
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

function buildStatItem(value, label) {
  const item = document.createElement("div");
  item.className = "stat-row-item";
  const v = document.createElement("div");
  v.className = "stat-value";
  v.textContent = value;
  const l = document.createElement("div");
  l.className = "stat-label";
  l.textContent = label;
  item.append(v, l);
  return item;
}

function fillStatRow(id, items) {
  const row = $(id);
  if (!row) return;
  row.innerHTML = "";
  items.forEach(([value, label]) => row.appendChild(buildStatItem(value, label)));
}

function fillFactGrid(id, facts) {
  const grid = $(id);
  if (!grid) return;
  grid.innerHTML = "";
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

// =====================================================================
// RINGKASAN (index.html)
// =====================================================================
function renderRingkasan() {
  const grid = $("#kpi-grid-ringkasan");
  if (!grid) return;
  const { c1, c2, c4 } = seriesColors();
  const i = 4; // indeks 2025

  grid.innerHTML = "";
  const hero = document.createElement("div");
  hero.className = "hero-tile";
  hero.innerHTML = `<p class="hero-label">Pendapatan FY2025</p>
    <p class="hero-value">${idrTriliun(REVENUE_IDR_B[i])}</p>
    <p class="hero-sub">naik ${idDecimal(REVENUE_GROWTH_PCT[i], 1)}% dari FY2024 · CAGR 5-tahun ${CAGR_5Y.revenue}%</p>`;
  grid.appendChild(hero);

  grid.appendChild(buildKpiTile({
    label: "Laba Bersih", value: idrTriliun(NET_PROFIT_IDR_B[i]),
    delta: deltaEl(NET_PROFIT_IDR_B[i], NET_PROFIT_IDR_B[i - 1]),
    sub: "vs. FY2024 · margin " + idDecimal(NET_MARGIN_PCT[i], 1) + "%",
    sparklineValues: NET_PROFIT_IDR_B, accent: c2,
  }));
  grid.appendChild(buildKpiTile({
    label: "EBITDA", value: idrTriliun(EBITDA_IDR_B[i]),
    delta: deltaEl(EBITDA_IDR_B[i], EBITDA_IDR_B[i - 1]),
    sub: "margin " + idDecimal(EBITDA_MARGIN_PCT[i], 1) + "%",
    sparklineValues: EBITDA_IDR_B, accent: c1,
  }));
  grid.appendChild(buildKpiTile({
    label: "Total Aset", value: idrTriliun(TOTAL_ASSETS_IDR_B[i]),
    delta: deltaEl(TOTAL_ASSETS_IDR_B[i], TOTAL_ASSETS_IDR_B[i - 1]),
    sub: "Total ekuitas " + idrTriliun(TOTAL_EQUITY_IDR_B[i]),
    sparklineValues: TOTAL_ASSETS_IDR_B, accent: c4,
  }));
  grid.appendChild(buildKpiTile({
    label: "Luas Tertanam", value: idDecimal(PLANTED_AREA_HA[i]) + " ha",
    delta: deltaEl(PLANTED_AREA_HA[i], PLANTED_AREA_HA[i - 1], { positiveIsGood: null }),
    sub: idDecimal(MATURE_SHARE_PCT_2025, 1) + "% tanaman matang · " + idDecimal(NUCLEUS_HA[i]) + " ha inti / " + idDecimal(PLASMA_HA[i]) + " ha plasma",
  }));
  grid.appendChild(buildKpiTile({
    label: "Produksi CPO", value: idDecimal(CPO_MT[i] / 1000, 0) + " ribu ton",
    delta: deltaEl(CPO_MT[i], CPO_MT[i - 1]),
    sub: "OER " + idDecimal(OER_PCT[i], 1) + "% · Yield " + idDecimal(CPO_YIELD_PER_MATURE_HA[i], 1) + " ton/ha",
  }));
  grid.appendChild(buildKpiTile({
    label: "Karyawan", value: idDecimal(COMPANY.employees) + " orang",
    sub: COMPANY.mills + " pabrik · " + idDecimal(COMPANY.millCapacityTph) + " tph kapasitas olah",
  }));
  grid.appendChild(buildKpiTile({
    label: "Dividen FY2025", value: DIVIDEND_2025.totalSgdCents.toFixed(2).replace(".", ",") + "¢",
    sub: "naik " + DIVIDEND_2025.growthPct + "% · rasio pembayaran " + DIVIDEND_2025.payoutRatioPct + "%",
  }));

  const fin = lineChart($("#chart-ringkasan-financial"), {
    categories: YEARS5,
    series: [
      { name: "Pendapatan", color: c2, values: REVENUE_IDR_B.map((v) => v / 1000) },
      { name: "EBITDA", color: c1, values: EBITDA_IDR_B.map((v) => v / 1000) },
    ],
    valueFormat: (v) => "Rp" + idDecimal(v, 0) + "T",
  });
  const legFin = $("#legend-ringkasan-financial");
  if (legFin) legFin.innerHTML = fin.legend;

  const prod = lineChart($("#chart-ringkasan-produksi"), {
    categories: YEARS5,
    series: [
      { name: "TBS internal", color: c1, values: FFB_INTERNAL_MT.map((v) => v / 1000) },
      { name: "Produksi CPO", color: c2, values: CPO_MT.map((v) => v / 1000) },
    ],
    valueFormat: (v) => idDecimal(v, 0) + "K",
  });
  const legProd = $("#legend-ringkasan-produksi");
  if (legProd) legProd.innerHTML = prod.legend;

  const regionHost = $("#ringkasan-region-cards");
  if (regionHost) {
    regionHost.innerHTML = "";
    REGIONS.forEach((r) => regionHost.appendChild(buildRegionCard(r, { compact: true })));
  }
}

// =====================================================================
// OPERASIONAL (operasional.html)
// =====================================================================
function renderOperasional() {
  const grid = $("#kpi-grid-operasional");
  if (!grid) return;
  const { c1, c2, c3, c4 } = seriesColors();
  const i = 4;

  grid.innerHTML = "";
  grid.appendChild(buildKpiTile({
    label: "TBS Internal (Inti & Plasma)", value: idDecimal(FFB_INTERNAL_MT[i] / 1e6, 2) + " juta ton",
    delta: deltaEl(FFB_INTERNAL_MT[i], FFB_INTERNAL_MT[i - 1]), sub: "vs. FY2024",
  }));
  grid.appendChild(buildKpiTile({
    label: "Produksi CPO", value: idDecimal(CPO_MT[i] / 1e6, 2) + " juta ton",
    delta: deltaEl(CPO_MT[i], CPO_MT[i - 1]), sub: "vs. FY2024",
  }));
  grid.appendChild(buildKpiTile({
    label: "Produksi Inti Sawit (PK)", value: idDecimal(PK_MT[i] / 1000, 0) + " ribu ton",
    delta: deltaEl(PK_MT[i], PK_MT[i - 1]), sub: "vs. FY2024",
  }));
  grid.appendChild(buildKpiTile({
    label: "Rendemen CPO (OER)", value: idDecimal(OER_PCT[i], 1) + "%",
    delta: deltaEl(OER_PCT[i], OER_PCT[i - 1]), sub: "vs. FY2024",
  }));
  grid.appendChild(buildKpiTile({
    label: "Rendemen Inti (KER)", value: idDecimal(KER_PCT[i], 1) + "%",
    delta: deltaEl(KER_PCT[i], KER_PCT[i - 1]), sub: "vs. FY2024",
  }));
  grid.appendChild(buildKpiTile({
    label: "Yield TBS / ha matang", value: idDecimal(FFB_YIELD_PER_MATURE_HA[i], 1) + " ton/ha",
    delta: deltaEl(FFB_YIELD_PER_MATURE_HA[i], FFB_YIELD_PER_MATURE_HA[i - 1]), sub: "vs. FY2024",
  }));
  grid.appendChild(buildKpiTile({
    label: "Yield CPO / ha matang", value: idDecimal(CPO_YIELD_PER_MATURE_HA[i], 1) + " ton/ha",
    delta: deltaEl(CPO_YIELD_PER_MATURE_HA[i], CPO_YIELD_PER_MATURE_HA[i - 1]), sub: "vs. FY2024",
  }));
  grid.appendChild(buildKpiTile({
    label: "TBS Pihak Ketiga", value: idDecimal(FFB_EXTERNAL_SHARE_PCT.curr, 1) + "%",
    delta: deltaEl(FFB_EXTERNAL_SHARE_PCT.curr, FFB_EXTERNAL_SHARE_PCT.prev), sub: "dari total TBS diolah pabrik",
  }));

  const ffb = lineChart($("#chart-ffb-nucleus-plasma"), {
    categories: YEARS5,
    series: [
      { name: "Nukleus", color: c1, values: FFB_NUCLEUS_MT.map((v) => v / 1000) },
      { name: "Plasma", color: c2, values: FFB_PLASMA_MT.map((v) => v / 1000) },
    ],
    valueFormat: (v) => idDecimal(v, 0) + "K",
  });
  $("#legend-ffb-nucleus-plasma").innerHTML = ffb.legend;

  const cpopk = lineChart($("#chart-cpo-pk"), {
    categories: YEARS5,
    series: [
      { name: "CPO", color: c1, values: CPO_MT.map((v) => v / 1000) },
      { name: "Inti Sawit (PK)", color: c4, values: PK_MT.map((v) => v / 1000) },
    ],
    valueFormat: (v) => idDecimal(v, 0) + "K",
  });
  $("#legend-cpo-pk").innerHTML = cpopk.legend;

  const rendemen = lineChart($("#chart-rendemen"), {
    categories: YEARS5,
    series: [
      { name: "OER", color: c3, values: OER_PCT },
      { name: "KER", color: c4, values: KER_PCT },
    ],
    valueFormat: (v) => idDecimal(v, 1) + "%",
  });
  $("#legend-rendemen").innerHTML = rendemen.legend;

  const produktivitas = lineChart($("#chart-produktivitas"), {
    categories: YEARS5,
    series: [
      { name: "Yield TBS", color: c1, values: FFB_YIELD_PER_MATURE_HA },
      { name: "Yield CPO", color: c2, values: CPO_YIELD_PER_MATURE_HA },
    ],
    valueFormat: (v) => idDecimal(v, 1),
  });
  $("#legend-produktivitas").innerHTML = produktivitas.legend;

  const maturity = donutChart($("#chart-maturity"), {
    categories: ["Matang", "Belum matang"],
    values: [MATURE_HA[4], IMMATURE_HA[4]],
    colors: [c1, c3],
    centerLabel: idDecimal(MATURE_SHARE_PCT_2025, 1) + "%",
    centerSub: "matang",
    unit: "ha",
  });
  $("#legend-maturity").innerHTML = maturity.legend;

  const nucleusPlasma = donutChart($("#chart-nucleus-plasma-2025"), {
    categories: ["Inti (nukleus)", "Plasma"],
    values: [NUCLEUS_HA[4], PLASMA_HA[4]],
    colors: [c1, c2],
    centerLabel: idDecimal(PLANTED_AREA_HA[4]),
    centerSub: "ha tertanam",
    unit: "ha",
  });
  $("#legend-nucleus-plasma-2025").innerHTML = nucleusPlasma.legend;

  fillStatRow("#stat-operasional", [
    [idDecimal(REPLANTING_HA_2025) + " ha", "Replanting & penanaman baru FY2025"],
    [idDecimal(AVERAGE_PALM_AGE_YEARS_2025, 1) + " tahun", "Rata-rata umur tanaman"],
    [idDecimal(FFB_TOTAL_PROCESSED_MT.curr / 1e6, 2) + " juta ton", "Total TBS diolah pabrik FY2025"],
  ]);
}

// =====================================================================
// WILAYAH (wilayah.html)
// =====================================================================
function buildRegionCard(r, { compact = false } = {}) {
  const card = document.createElement("div");
  card.className = "region-card";
  const rows = [];
  if (r.plantedHa > 0) rows.push(["Luas tertanam", idDecimal(r.plantedHa) + " ha (" + idDecimal(r.plantedSharePct, 1) + "%)"]);
  else rows.push(["Luas tertanam", "— (dilepas 2025)"]);
  rows.push(["Pabrik", r.mills + " unit · " + idDecimal(r.millCapacityTph) + " tph"]);
  if (r.ffb2025Mt) rows.push(["Produksi TBS FY2025", idDecimal(r.ffb2025Mt / 1e6, 1) + " juta ton (" + (r.ffbYoyPct >= 0 ? "+" : "") + idDecimal(r.ffbYoyPct, 1) + "%)"]);
  rows.push(["Karyawan", idDecimal(r.employees) + " (" + idDecimal(r.employeesSharePct, 1) + "%)"]);

  card.innerHTML = `<p class="region-name">${r.name}</p><div class="region-stats">` +
    rows.map(([l, v]) => `<div class="region-stat-row"><span class="rlabel">${l}</span><span class="rvalue">${v}</span></div>`).join("") +
    `</div>`;
  return card;
}

function renderWilayah() {
  const host = $("#region-cards");
  if (!host) return;
  const { c1, c2, c3 } = seriesColors();

  host.innerHTML = "";
  REGIONS.forEach((r) => host.appendChild(buildRegionCard(r)));

  const empCategories = ["Kalimantan Tengah", "Kalimantan Barat", "Jakarta", "Riau", "Lainnya"];
  const empValues = [REGIONS[0].employees, REGIONS[1].employees, EMPLOYEES_OTHER_REGION.jakarta, REGIONS[2].employees, EMPLOYEES_OTHER_REGION.lainnya];
  horizontalBarChart($("#chart-employees-region"), {
    categories: empCategories,
    values: empValues,
    colors: c1,
    unit: "",
    valueFormat: (v) => idDecimal(v, 0),
  });

  const loc = lineChart($("#chart-planted-location"), {
    categories: YEARS5,
    series: [
      { name: "Kalimantan", color: c1, values: PLANTED_KALIMANTAN_HA },
      { name: "Riau", color: c3, values: PLANTED_RIAU_HA },
    ],
    valueFormat: (v) => idDecimal(v, 0),
  });
  $("#legend-planted-location").innerHTML = loc.legend;

  const entityGrid = $("#entity-grid");
  if (entityGrid) {
    entityGrid.innerHTML = "";
    MILL_DIRECTORY.forEach((e) => {
      const card = document.createElement("div");
      card.className = "entity-card";
      card.innerHTML = `<p class="entity-pt">${e.pt}</p><p class="entity-unit">${e.unit}</p><p class="entity-location">${e.location}</p>`;
      entityGrid.appendChild(card);
    });
  }
}

// =====================================================================
// KEUANGAN (keuangan.html)
// =====================================================================
function renderKeuangan() {
  const grid = $("#kpi-grid-keuangan");
  if (!grid) return;
  const { c1, c2, c3, c4 } = seriesColors();
  const i = 4;

  grid.innerHTML = "";
  grid.appendChild(buildKpiTile({ label: "Pendapatan", value: idrTriliun(REVENUE_IDR_B[i]), delta: deltaEl(REVENUE_IDR_B[i], REVENUE_IDR_B[i - 1]), sub: "vs. FY2024" }));
  grid.appendChild(buildKpiTile({ label: "Laba Kotor", value: idrTriliun(GROSS_PROFIT_IDR_B[i]), delta: deltaEl(GROSS_PROFIT_IDR_B[i], GROSS_PROFIT_IDR_B[i - 1]), sub: "margin " + idDecimal(GROSS_MARGIN_PCT[i], 1) + "%" }));
  grid.appendChild(buildKpiTile({ label: "EBITDA", value: idrTriliun(EBITDA_IDR_B[i]), delta: deltaEl(EBITDA_IDR_B[i], EBITDA_IDR_B[i - 1]), sub: "margin " + idDecimal(EBITDA_MARGIN_PCT[i], 1) + "%" }));
  grid.appendChild(buildKpiTile({ label: "Laba Bersih", value: idrTriliun(NET_PROFIT_IDR_B[i]), delta: deltaEl(NET_PROFIT_IDR_B[i], NET_PROFIT_IDR_B[i - 1]), sub: "margin " + idDecimal(NET_MARGIN_PCT[i], 1) + "%" }));
  grid.appendChild(buildKpiTile({ label: "EPS", value: "Rp" + idDecimal(EPS_IDR[i]), delta: deltaEl(EPS_IDR[i], EPS_IDR[i - 1]), sub: "per saham, FY2024: Rp" + idDecimal(EPS_IDR[i - 1]) }));
  grid.appendChild(buildKpiTile({ label: "Total Aset", value: idrTriliun(TOTAL_ASSETS_IDR_B[i]), delta: deltaEl(TOTAL_ASSETS_IDR_B[i], TOTAL_ASSETS_IDR_B[i - 1]), sub: "Ekuitas " + idrTriliun(TOTAL_EQUITY_IDR_B[i]) }));
  grid.appendChild(buildKpiTile({ label: "Return on Equity", value: idDecimal(ROE_PCT[i], 1) + "%", delta: deltaEl(ROE_PCT[i], ROE_PCT[i - 1]), sub: "ROA " + idDecimal(ROA_PCT[i], 1) + "%" }));
  grid.appendChild(buildKpiTile({ label: "Net Gearing", value: idDecimal(NET_DEBT_EQUITY_X[i], 2) + "x", delta: deltaEl(NET_DEBT_EQUITY_X[i], NET_DEBT_EQUITY_X[i - 1], { positiveIsGood: false }), sub: "terendah dalam 6 tahun terakhir" }));

  const finChart = lineChart($("#chart-revenue-ebitda"), {
    categories: YEARS5,
    series: [
      { name: "Pendapatan", color: c2, values: REVENUE_IDR_B },
      { name: "EBITDA", color: c1, values: EBITDA_IDR_B },
    ],
    valueFormat: (v) => idrMiliar(v),
  });
  $("#legend-revenue-ebitda").innerHTML = finChart.legend;

  lineChart($("#chart-net-profit"), {
    categories: YEARS5,
    series: [{ name: "Laba bersih (atribusi pemilik)", color: c2, values: NET_PROFIT_OWNERS_IDR_B }],
    valueFormat: (v) => idrMiliar(v),
  });

  const marginChart = lineChart($("#chart-margins"), {
    categories: YEARS5,
    series: [
      { name: "Margin Kotor", color: c1, values: GROSS_MARGIN_PCT },
      { name: "Margin Operasi", color: c2, values: OPERATING_MARGIN_PCT },
      { name: "Margin EBITDA", color: c3, values: EBITDA_MARGIN_PCT },
      { name: "Margin Bersih", color: c4, values: NET_MARGIN_PCT },
    ],
    valueFormat: (v) => idDecimal(v, 1) + "%",
  });
  $("#legend-margins").innerHTML = marginChart.legend;

  const balanceChart = lineChart($("#chart-balance"), {
    categories: YEARS5,
    series: [
      { name: "Total Aset", color: c1, values: TOTAL_ASSETS_IDR_B },
      { name: "Total Ekuitas", color: c2, values: TOTAL_EQUITY_IDR_B },
      { name: "Total Liabilitas", color: c3, values: TOTAL_ASSETS_IDR_B.map((a, idx) => TOTAL_CURRENT_LIAB_IDR_B[idx] + TOTAL_NONCURRENT_LIAB_IDR_B[idx]) },
    ],
    valueFormat: (v) => idrMiliar(v),
  });
  $("#legend-balance").innerHTML = balanceChart.legend;

  const roeRoa = lineChart($("#chart-roe-roa"), {
    categories: YEARS5,
    series: [
      { name: "ROE", color: c1, values: ROE_PCT },
      { name: "ROA", color: c2, values: ROA_PCT },
    ],
    valueFormat: (v) => idDecimal(v, 1) + "%",
  });
  $("#legend-roe-roa").innerHTML = roeRoa.legend;

  const leverage = lineChart($("#chart-leverage"), {
    categories: YEARS5,
    series: [
      { name: "Debt / Equity", color: c1, values: DEBT_EQUITY_X },
      { name: "Net Debt / Assets", color: c3, values: NET_DEBT_ASSETS_X },
    ],
    valueFormat: (v) => idDecimal(v, 2) + "x",
  });
  $("#legend-leverage").innerHTML = leverage.legend;

  fillStatRow("#stat-cashflow", [
    [idrTriliun(CASH_FLOW_2025.operatingCf * 1000), "Kas dari operasi FY2025"],
    [idrTriliun(CASH_FLOW_2025.freeCf * 1000), "Arus kas bebas (+" + CASH_FLOW_2025.freeCfGrowthPct + "%)"],
    [idrMiliar(CASH_FLOW_2025.capexPpeIdrB + CASH_FLOW_2025.capexBearerPlantsIdrB), "Belanja modal (aset tetap + tanaman)"],
    [idrTriliun(CASH_FLOW_2025.dividendsPaidIdrT * 1000), "Dividen dibayarkan FY2025"],
  ]);

  fillStatRow("#stat-dividend", [
    [DIVIDEND_2025.totalSgdCents.toFixed(2).replace(".", ",") + "¢", "Total dividen/saham FY2025 (+" + DIVIDEND_2025.growthPct + "%)"],
    [DIVIDEND_2025.payoutRatioPct + "%", "Rasio pembayaran (kebijakan " + DIVIDEND_2025.payoutPolicyRangePct[0] + "–" + DIVIDEND_2025.payoutPolicyRangePct[1] + "%)"],
    [DIVIDEND_2025.firstInterimSgdCents + "¢ / " + DIVIDEND_2025.secondInterimSgdCents + "¢ / " + DIVIDEND_2025.finalProposedSgdCents + "¢", "Interim 1 / Interim 2 / Final (diusulkan)"],
  ]);

  fillFactGrid("#fact-outlook", [
    { label: "Belanja modal 2026", value: "Rp" + OUTLOOK_2026.capexIdrT.toFixed(1).replace(".", ",") + " triliun" },
    { label: "Replanting 2026", value: idDecimal(OUTLOOK_2026.replantingHa[0]) + "–" + idDecimal(OUTLOOK_2026.replantingHa[1]) + " ha" },
    { label: "Penanaman baru 2026", value: idDecimal(OUTLOOK_2026.newPlantingHa[0]) + "–" + idDecimal(OUTLOOK_2026.newPlantingHa[1]) + " ha" },
    { label: "Target pertumbuhan produksi 2026", value: "hingga " + OUTLOOK_2026.productionGrowthPct + "%" },
    { label: "Kisaran harga referensi CPO 2026", value: "MYR " + idDecimal(OUTLOOK_2026.cpoRefPriceRangeMyr[0]) + "–" + idDecimal(OUTLOOK_2026.cpoRefPriceRangeMyr[1]) + "/ton" },
    { label: "Harga jual rata-rata CPO FY2025", value: "Rp" + idDecimal(REVENUE_DETAIL.cpoAsp.curr) + "/kg (+" + idDecimal(((REVENUE_DETAIL.cpoAsp.curr - REVENUE_DETAIL.cpoAsp.prev) / REVENUE_DETAIL.cpoAsp.prev) * 100, 1) + "%)" },
  ]);
}

// =====================================================================
// KEBERLANJUTAN (keberlanjutan.html)
// =====================================================================
function renderKeberlanjutan() {
  const grid = $("#kpi-grid-sustain");
  if (!grid) return;
  const { c1, c2, c3, c4, muted } = seriesColors();
  const i = 4;

  grid.innerHTML = "";
  grid.appendChild(buildKpiTile({ label: "Pabrik Tersertifikasi RSPO", value: RSPO_MILLS_CERTIFIED[i] + " dari " + COMPANY.mills, sub: idDecimal(RSPO_CERTIFIED_HA[i]) + " ha (" + RSPO_HGU_COVERAGE_PCT_2025 + "% HGU) · target 100% pada " + RSPO_TARGET_YEAR }));
  grid.appendChild(buildKpiTile({ label: "CSPO + CSPK Bersertifikat", value: idDecimal(CSPO_CSPK_MT[i]) + " ton", delta: deltaEl(CSPO_CSPK_MT[i], CSPO_CSPK_MT[i - 1]), sub: "vs. FY2024" }));
  grid.appendChild(buildKpiTile({ label: "Alokasi Plasma", value: idDecimal(PLASMA_ALLOCATION_PCT[i], 1) + "%", delta: deltaEl(PLASMA_ALLOCATION_PCT[i], PLASMA_ALLOCATION_PCT[i - 1]), sub: "ambang regulasi " + PLASMA_REGULATORY_MIN_PCT + "%" }));
  grid.appendChild(buildKpiTile({ label: "Intensitas Emisi Bersih", value: GHG.netIntensityMtCo2ePerMtCpo.toFixed(2).replace(".", ",") + " tCO2e/ton CPO", sub: "turun " + GHG.intensityReductionVs2016Pct + "% vs. baseline 2016 · target baru " + GHG.newTarget2030ReductionPct + "% pada 2030" }));
  grid.appendChild(buildKpiTile({ label: "Karyawan", value: idDecimal(WORKFORCE.total2025) + " orang", sub: WORKFORCE.womenSharePct2025 + "% perempuan · " + WORKFORCE.womenBoardPct + "% Dewan" }));
  grid.appendChild(buildKpiTile({ label: "Tingkat Insiden Kerja", value: SAFETY.lostTimeIncidentRate2025.toString().replace(".", ","), sub: SAFETY.lostTimeVsTargetPct + "% lebih baik dari Triple Zero Target" }));

  const rspoChart = lineChart($("#chart-rspo-area"), {
    categories: YEARS5,
    series: [{ name: "Luas tersertifikasi RSPO", color: c1, values: RSPO_CERTIFIED_HA }],
    valueFormat: (v) => idDecimal(v, 0),
  });

  const cspoChart = lineChart($("#chart-cspo"), {
    categories: YEARS5,
    series: [{ name: "CSPO + CSPK", color: c2, values: CSPO_CSPK_MT }],
    valueFormat: (v) => idDecimal(v, 0),
  });

  const plasmaChart = lineChart($("#chart-plasma-compliance"), {
    categories: YEARS5,
    series: [
      { name: "Alokasi plasma", color: c1, values: PLASMA_ALLOCATION_PCT },
      { name: "Ambang regulasi", color: muted, values: YEARS5.map(() => PLASMA_REGULATORY_MIN_PCT) },
    ],
    valueFormat: (v) => idDecimal(v, 1) + "%",
  });
  $("#legend-plasma-compliance").innerHTML = plasmaChart.legend;

  const ghgColors = [c1, c2, c3, c4, muted];
  const ghgDonut = donutChart($("#chart-ghg"), {
    categories: GHG_BY_TYPE.map((g) => g.name),
    values: GHG_BY_TYPE.map((g) => g.pct),
    colors: ghgColors,
    centerLabel: GHG.netEmissions2025MtCo2e.toFixed(2).replace(".", ",") + "M",
    centerSub: "ton CO2e bersih",
    unit: "%",
  });
  $("#legend-ghg").innerHTML = ghgDonut.legend;

  horizontalBarChart($("#chart-workforce-category"), {
    categories: WORKFORCE.byCategory.map((w) => w.label),
    values: WORKFORCE.byCategory.map((w) => w.count),
    colors: c1,
    valueFormat: (v) => idDecimal(v, 0),
  });

  fillStatRow("#stat-ghg", [
    [GHG.grossEmissions2025MtCo2e.toFixed(2).replace(".", ",") + "M ton CO2e", "Emisi bruto FY2025 (" + GHG.grossEmissionsChangePct + "%)"],
    [GHG.methaneCaptureFacilities.toString(), "Fasilitas tangkap metana (3 baru di 2025)"],
    [GHG.cropSequestrationMtCo2e.toFixed(2).replace(".", ",") + "M ton CO2e", "Offset dari sekuestrasi tanaman"],
  ]);

  fillStatRow("#stat-workforce", [
    [WORKFORCE.womenSharePct2025 + "%", "Perempuan dari total tenaga kerja"],
    [WORKFORCE.womenBoardPct + "%", "Perempuan di Dewan Komisaris/Direksi"],
    [WORKFORCE.womenSeniorMgmtPct + "%", "Perempuan di Manajemen Senior"],
  ]);
}

// =====================================================================
// KEPEMIMPINAN (kepemimpinan.html)
// =====================================================================
function initialsOf(name) {
  return name.split(" ").filter((w) => w[0] === w[0].toUpperCase()).slice(0, 2).map((w) => w[0]).join("");
}

function renderKepemimpinan() {
  const boardGrid = $("#board-grid");
  if (!boardGrid) return;

  boardGrid.innerHTML = "";
  BOARD.forEach((p) => {
    const card = document.createElement("div");
    card.className = "person-card";
    card.innerHTML = `<div class="person-avatar">${initialsOf(p.name)}</div>
      <p class="person-name">${p.name}</p>
      <p class="person-title">${p.title}</p>
      <p class="person-since">Menjabat sejak ${p.since}</p>`;
    boardGrid.appendChild(card);
  });

  const mgmtGrid = $("#management-grid");
  mgmtGrid.innerHTML = "";
  KEY_MANAGEMENT.forEach((p) => {
    const card = document.createElement("div");
    card.className = "person-card";
    card.innerHTML = `<div class="person-avatar">${initialsOf(p.name)}</div>
      <p class="person-name">${p.name}</p>
      <p class="person-title">${p.title}</p>
      <p class="person-since">Menjabat sejak ${p.since}</p>`;
    mgmtGrid.appendChild(card);
  });

  const timeline = $("#timeline");
  timeline.innerHTML = "";
  MILESTONES.forEach((m) => {
    const item = document.createElement("div");
    item.className = "timeline-item";
    item.innerHTML = `<span class="timeline-dot"></span><p class="timeline-year">${m.year}</p><p class="timeline-text">${m.text}</p>`;
    timeline.appendChild(item);
  });

  const awards = $("#award-list");
  awards.innerHTML = "";
  AWARDS.forEach((a) => {
    const item = document.createElement("div");
    item.className = "award-item";
    item.innerHTML = `<span class="award-year">${a.year}</span><span>${a.text}</span>`;
    awards.appendChild(item);
  });
}

// =====================================================================
// PEMEGANG SAHAM (pemegang-saham.html)
// =====================================================================
function renderPemegangSaham() {
  const grid = $("#kpi-grid-shareholders");
  if (!grid) return;

  grid.innerHTML = "";
  grid.appendChild(buildKpiTile({ label: "Kapitalisasi Pasar", value: COMPANY.marketCap, sub: "akhir tahun 2025" }));
  grid.appendChild(buildKpiTile({ label: "Jumlah Pemegang Saham", value: idDecimal(SHARE_STATS.shareholderCount), sub: "per 11 Maret 2026" }));
  grid.appendChild(buildKpiTile({ label: "Saham Beredar", value: idDecimal(SHARE_STATS.sharesIssuedExTreasury), sub: "tidak termasuk treasury shares" }));
  grid.appendChild(buildKpiTile({ label: "Treasury Shares", value: idDecimal(SHARE_STATS.treasurySharesPct, 2) + "%", sub: "dari total saham diterbitkan" }));

  const { c1, c2, c4 } = seriesColors();
  const ownership = donutChart($("#chart-ownership"), {
    categories: OWNERSHIP.map((o) => o.name),
    values: OWNERSHIP.map((o) => o.pct),
    colors: [c1, c2, c4],
    centerLabel: "100%",
    centerSub: "kepemilikan",
    unit: "%",
  });
  $("#legend-ownership").innerHTML = ownership.legend;

  fillFactGrid("#fact-shares", [
    { label: "Kelas saham", value: "Saham Biasa (Ordinary Shares)" },
    { label: "20 pemegang saham terbesar", value: idDecimal(SHARE_STATS.top20HoldersPct, 2) + "% dari total saham beredar" },
    { label: "Pemegang saham substansial", value: "Wellpoint Pacific Holdings & Oakridge Investments" },
    { label: "Kepemilikan publik", value: idDecimal(OWNERSHIP[2].pct, 2) + "% (memenuhi Rule 723 SGX)" },
    { label: "Pencatatan saham", value: "SGX Mainboard, kode P8Z, sejak " + COMPANY.listedSince },
    { label: "Auditor", value: "Ernst & Young LLP" },
  ]);
}

// =====================================================================
// INIT
// =====================================================================
function renderAll() {
  renderRingkasan();
  renderOperasional();
  renderWilayah();
  renderKeuangan();
  renderKeberlanjutan();
  renderKepemimpinan();
  renderPemegangSaham();
}

window.addEventListener("DOMContentLoaded", renderAll);
window.addEventListener("bga:themechange", renderAll);
window.addEventListener("resize", () => {
  clearTimeout(window.__bgaResizeTimer);
  window.__bgaResizeTimer = setTimeout(renderAll, 150);
});
