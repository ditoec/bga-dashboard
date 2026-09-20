// Primitif chart SVG minimal tanpa dependensi, mengikuti kaidah dataviz: garis tipis,
// gridline tipis yang tidak menonjol, satu lapisan hover, legenda untuk multi-seri,
// label langsung yang dipakai secukupnya.

const SVGNS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  return node;
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function niceAxisMax(max) {
  if (max <= 0) return 10;
  const exp = Math.floor(Math.log10(max));
  const base = Math.pow(10, exp);
  const norm = max / base;
  let niceNorm;
  if (norm <= 1) niceNorm = 1;
  else if (norm <= 2) niceNorm = 2;
  else if (norm <= 5) niceNorm = 5;
  else niceNorm = 10;
  return niceNorm * base;
}

function formatNumber(n, decimals = 0) {
  return n.toLocaleString("id-ID", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

function ensureTooltip(wrap) {
  let tip = wrap.querySelector(".viz-tooltip");
  if (!tip) {
    tip = document.createElement("div");
    tip.className = "viz-tooltip";
    wrap.appendChild(tip);
  }
  return tip;
}

function positionTooltip(tip, wrap, x, y) {
  const wrapRect = wrap.getBoundingClientRect();
  let left = x + 14;
  let top = y - 10;
  const tipRect = tip.getBoundingClientRect();
  if (left + tipRect.width > wrapRect.width) left = x - tipRect.width - 14;
  if (top + tipRect.height > wrapRect.height) top = wrapRect.height - tipRect.height - 4;
  if (top < 0) top = 4;
  tip.style.left = left + "px";
  tip.style.top = top + "px";
}

function legendHtml(items) {
  return items
    .map((it) => {
      const shape =
        it.shape === "rect"
          ? `<span class="legend-swatch-rect" style="background:${it.color}"></span>`
          : `<span class="legend-swatch-line" style="background:${it.color}"></span>`;
      const span = document.createElement("span");
      span.className = "legend-item";
      span.innerHTML = shape;
      const label = document.createElement("span");
      label.textContent = it.name;
      span.appendChild(label);
      return span.outerHTML;
    })
    .join("");
}

// ---- Line chart (1-2 seri, area wash opsional pada seri tunggal) ----
function lineChart(wrap, { categories, series, height = 220, valueFormat = (v) => formatNumber(v) }) {
  wrap.innerHTML = "";
  const width = wrap.clientWidth || 560;
  const padding = { top: 16, right: 16, bottom: 26, left: 58 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const allValues = series.flatMap((s) => s.values);
  const maxVal = niceAxisMax(Math.max(...allValues) * 1.15);
  const minVal = Math.min(0, Math.min(...allValues));

  const xStep = innerW / (categories.length - 1);
  const yScale = (v) => padding.top + innerH - ((v - minVal) / (maxVal - minVal)) * innerH;
  const xScale = (i) => padding.left + i * xStep;

  const svg = svgEl("svg", { width: "100%", height, viewBox: `0 0 ${width} ${height}`, role: "img" });

  // gridline + label sumbu-y
  const ticks = 4;
  for (let t = 0; t <= ticks; t++) {
    const val = minVal + ((maxVal - minVal) * t) / ticks;
    const y = yScale(val);
    svg.appendChild(svgEl("line", { class: "grid-line", x1: padding.left, x2: width - padding.right, y1: y, y2: y }));
    const label = svgEl("text", { x: padding.left - 8, y: y + 3, "text-anchor": "end" });
    label.textContent = valueFormat(val);
    svg.appendChild(label);
  }

  // garis dasar
  svg.appendChild(svgEl("line", { class: "axis-line", x1: padding.left, x2: width - padding.right, y1: yScale(0), y2: yScale(0) }));

  // label sumbu-x (jarang: awal, akhir, dan tiap titik)
  categories.forEach((c, i) => {
    const label = svgEl("text", { x: xScale(i), y: height - 6, "text-anchor": i === 0 ? "start" : i === categories.length - 1 ? "end" : "middle" });
    label.textContent = c;
    svg.appendChild(label);
  });

  // Deteksi tabrakan label-akhir: jika dua seri berakhir berdekatan secara
  // vertikal, jangan menumpuk teks (lihat marks-and-anatomy.md) — sembunyikan
  // nilai langsung untuk titik yang bertabrakan dan andalkan legenda + tooltip.
  const lastY = series.map((s) => yScale(s.values[s.values.length - 1]));
  const collides = lastY.map((y, idx) => lastY.some((y2, idx2) => idx2 !== idx && Math.abs(y - y2) < 13));

  series.forEach((s, si) => {
    const points = s.values.map((v, i) => [xScale(i), yScale(v)]);
    if (series.length === 1) {
      const areaPath = [`M ${points[0][0]},${yScale(minVal)}`, ...points.map((p) => `L ${p[0]},${p[1]}`), `L ${points[points.length - 1][0]},${yScale(minVal)}`, "Z"].join(" ");
      svg.appendChild(svgEl("path", { d: areaPath, fill: s.color, opacity: 0.1, stroke: "none" }));
    }
    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]},${p[1]}`).join(" ");
    svg.appendChild(svgEl("path", { d: linePath, fill: "none", stroke: s.color, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }));

    // marker akhir + label langsung (dilewati jika bertabrakan dengan seri lain)
    const last = points[points.length - 1];
    svg.appendChild(svgEl("circle", { cx: last[0], cy: last[1], r: 5, fill: cssVar("--surface-1") }));
    svg.appendChild(svgEl("circle", { cx: last[0], cy: last[1], r: 4, fill: s.color }));
    if (!collides[si]) {
      const endLabel = svgEl("text", { class: "data-label", x: Math.min(last[0] + 6, width - padding.right), y: last[1] - 8, "text-anchor": last[0] > width - padding.right - 40 ? "end" : "start" });
      endLabel.textContent = valueFormat(s.values[s.values.length - 1]);
      svg.appendChild(endLabel);
    }
  });

  // crosshair hover + tooltip bersama
  const crosshair = svgEl("line", { class: "grid-line", x1: 0, x2: 0, y1: padding.top, y2: padding.top + innerH, stroke: cssVar("--text-muted"), opacity: 0 });
  svg.appendChild(crosshair);

  const overlay = svgEl("rect", { x: padding.left, y: padding.top, width: innerW, height: innerH, fill: "transparent" });
  svg.appendChild(overlay);

  wrap.appendChild(svg);
  const tip = ensureTooltip(wrap);

  function onMove(evt) {
    const rect = wrap.getBoundingClientRect();
    const scaleX = width / rect.width;
    const px = (evt.clientX - rect.left) * scaleX;
    let idx = Math.round((px - padding.left) / xStep);
    idx = Math.max(0, Math.min(categories.length - 1, idx));
    const cx = xScale(idx);
    crosshair.setAttribute("x1", cx);
    crosshair.setAttribute("x2", cx);
    crosshair.setAttribute("opacity", 1);

    tip.innerHTML = "";
    const title = document.createElement("div");
    title.className = "viz-tooltip-title";
    title.textContent = categories[idx];
    tip.appendChild(title);
    series.forEach((s) => {
      const row = document.createElement("div");
      row.className = "viz-tooltip-row";
      const key = document.createElement("span");
      key.className = "viz-tooltip-key";
      key.style.background = s.color;
      const name = document.createElement("span");
      name.className = "viz-tooltip-name";
      name.textContent = s.name;
      const val = document.createElement("span");
      val.className = "viz-tooltip-val";
      val.textContent = valueFormat(s.values[idx]);
      row.append(key, name, val);
      tip.appendChild(row);
    });
    tip.classList.add("show");
    positionTooltip(tip, wrap, (cx / scaleX), (yScale(series[0].values[idx]) / scaleX));
  }
  function onLeave() {
    crosshair.setAttribute("opacity", 0);
    tip.classList.remove("show");
  }
  overlay.addEventListener("pointermove", onMove);
  overlay.addEventListener("pointerleave", onLeave);

  return { legend: series.length > 1 ? legendHtml(series.map((s) => ({ name: s.name, color: s.color, shape: "line" }))) : "" };
}

// ---- Donut chart (2-4 kategori) ----
function donutChart(wrap, { categories, values, colors, centerLabel, centerSub, size = 200, unit = "ha", valueFormat = (v) => formatNumber(v) }) {
  wrap.innerHTML = "";
  const total = values.reduce((a, b) => a + b, 0);
  const r = size / 2 - 10;
  const inner = r * 0.62;
  const cx = size / 2;
  const cy = size / 2;

  const svg = svgEl("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}` });
  let angle = -Math.PI / 2;
  const gap = 0.018; // radian, celah permukaan antar segmen

  const arcs = [];
  categories.forEach((c, i) => {
    const frac = values[i] / total;
    const a0 = angle + gap / 2;
    const a1 = angle + frac * Math.PI * 2 - gap / 2;
    angle += frac * Math.PI * 2;

    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const xi0 = cx + inner * Math.cos(a1), yi0 = cy + inner * Math.sin(a1);
    const xi1 = cx + inner * Math.cos(a0), yi1 = cy + inner * Math.sin(a0);

    const d = [
      `M ${x0} ${y0}`,
      `A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`,
      `L ${xi0} ${yi0}`,
      `A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1}`,
      "Z",
    ].join(" ");
    const path = svgEl("path", { d, fill: colors[i] });
    svg.appendChild(path);
    arcs.push({ path, name: c, value: values[i], color: colors[i] });
  });

  if (centerLabel) {
    const val = svgEl("text", { x: cx, y: cy - 2, "text-anchor": "middle", "font-size": 18, "font-weight": 600, fill: cssVar("--text-primary") });
    val.textContent = centerLabel;
    svg.appendChild(val);
  }
  if (centerSub) {
    const sub = svgEl("text", { x: cx, y: cy + 16, "text-anchor": "middle", "font-size": 10.5, fill: cssVar("--text-muted") });
    sub.textContent = centerSub;
    svg.appendChild(sub);
  }

  wrap.appendChild(svg);
  const tip = ensureTooltip(wrap);

  arcs.forEach((a) => {
    a.path.addEventListener("pointermove", (evt) => {
      a.path.setAttribute("opacity", 0.85);
      tip.innerHTML = "";
      const row = document.createElement("div");
      row.className = "viz-tooltip-row";
      const key = document.createElement("span");
      key.className = "viz-tooltip-key";
      key.style.background = a.color;
      const name = document.createElement("span");
      name.className = "viz-tooltip-name";
      name.textContent = a.name;
      const val = document.createElement("span");
      val.className = "viz-tooltip-val";
      val.textContent =
        unit === "%"
          ? valueFormat(a.value) + "%"
          : valueFormat(a.value) + " " + unit + " (" + Math.round((a.value / total) * 100) + "%)";
      row.append(key, name, val);
      tip.appendChild(row);
      tip.classList.add("show");
      const rect = wrap.getBoundingClientRect();
      positionTooltip(tip, wrap, evt.clientX - rect.left, evt.clientY - rect.top);
    });
    a.path.addEventListener("pointerleave", () => {
      a.path.setAttribute("opacity", 1);
      tip.classList.remove("show");
    });
  });

  return {
    legend: legendHtml(
      categories.map((c, i) => ({
        name: unit === "%" ? `${c} (${formatNumber(values[i])}%)` : `${c} (${formatNumber(values[i])} ${unit})`,
        color: colors[i],
        shape: "rect",
      }))
    ),
  };
}

// ---- Horizontal bar chart (ranked, single series) ----
function horizontalBarChart(wrap, { categories, values, colors, unit = "", rowHeight = 30, valueFormat = (v) => formatNumber(v, 1) }) {
  wrap.innerHTML = "";
  const width = wrap.clientWidth || 560;
  const padding = { top: 4, right: 60, bottom: 4, left: 128 };
  const height = rowHeight * categories.length + padding.top + padding.bottom;
  const innerW = width - padding.left - padding.right;

  const maxVal = niceAxisMax(Math.max(...values) * 1.1);
  const xScale = (v) => (v / maxVal) * innerW;
  const colorFor = (i) => (Array.isArray(colors) ? colors[i] : colors);

  const svg = svgEl("svg", { width: "100%", height, viewBox: `0 0 ${width} ${height}` });
  const bars = [];

  categories.forEach((c, i) => {
    const y = padding.top + i * rowHeight;
    const barH = 16;
    const by = y + (rowHeight - barH) / 2;
    const w = Math.max(xScale(values[i]), 2);

    const label = svgEl("text", { x: padding.left - 10, y: y + rowHeight / 2 + 4, "text-anchor": "end" });
    label.textContent = c;
    svg.appendChild(label);

    const rect = svgEl("rect", { x: padding.left, y: by, width: w, height: barH, rx: 4, ry: 4, fill: colorFor(i) });
    svg.appendChild(rect);

    const valLabel = svgEl("text", { class: "data-label", x: padding.left + w + 8, y: y + rowHeight / 2 + 4, "text-anchor": "start" });
    valLabel.textContent = valueFormat(values[i]) + unit;
    svg.appendChild(valLabel);

    bars.push({ rect, x: padding.left, y, w: innerW, h: rowHeight, value: values[i], cat: c, color: colorFor(i) });
  });

  wrap.appendChild(svg);
  const tip = ensureTooltip(wrap);

  bars.forEach((b) => {
    const hit = svgEl("rect", { x: b.x, y: b.y, width: b.w, height: b.h, fill: "transparent" });
    svg.appendChild(hit);
    hit.addEventListener("pointermove", (evt) => {
      b.rect.setAttribute("opacity", 0.85);
      tip.innerHTML = "";
      const row = document.createElement("div");
      row.className = "viz-tooltip-row";
      const key = document.createElement("span");
      key.className = "viz-tooltip-key";
      key.style.background = b.color;
      const name = document.createElement("span");
      name.className = "viz-tooltip-name";
      name.textContent = b.cat;
      const val = document.createElement("span");
      val.className = "viz-tooltip-val";
      val.textContent = valueFormat(b.value) + unit;
      row.append(key, name, val);
      tip.appendChild(row);
      tip.classList.add("show");
      const rect = wrap.getBoundingClientRect();
      positionTooltip(tip, wrap, evt.clientX - rect.left, evt.clientY - rect.top);
    });
    hit.addEventListener("pointerleave", () => {
      b.rect.setAttribute("opacity", 1);
      tip.classList.remove("show");
    });
  });
}

// ---- Sparkline untuk kartu KPI ----
function sparkline(svgHost, values, accentColor) {
  const width = 100, height = 28, pad = 3;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const xStep = (width - pad * 2) / (values.length - 1);
  const points = values.map((v, i) => [pad + i * xStep, height - pad - ((v - min) / range) * (height - pad * 2)]);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  svgHost.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svgHost.innerHTML = "";
  svgHost.appendChild(svgEl("path", { d: path, fill: "none", stroke: cssVar("--text-muted"), "stroke-width": 1.5, "stroke-linejoin": "round", "stroke-linecap": "round", opacity: 0.6 }));
  const last = points[points.length - 1];
  svgHost.appendChild(svgEl("circle", { cx: last[0], cy: last[1], r: 2.5, fill: accentColor }));
}
