# BGA Group — Plantation Operations Dashboard

A management dashboard for Bumitama Gunajaya Agro (BGA Group), covering palm oil
estate and mill performance: FFB/CPO production, extraction rates, CPO price,
rainfall, planted area, and per-estate yield and status.

Static site, no build step or dependencies.

## Run locally

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Structure

- `index.html` — page layout
- `css/style.css` — theming (light/dark) and layout
- `js/data.js` — mock operational data (estates, monthly production, price, rainfall)
- `js/charts.js` — dependency-free SVG chart primitives (line, bar, donut, sparkline) with hover tooltips
- `js/app.js` — renders KPI tiles, charts, estate cards and the estate table; wires the region filter and theme toggle

## Going live

Replace the arrays in `js/data.js` with a fetch to the group's estate/mill
reporting system (or a small API) — the rendering code re-runs against
whatever `js/data.js` exports.
