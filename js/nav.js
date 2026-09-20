// Header, navigasi dan footer bersama untuk semua halaman dasbor.
// Setiap halaman menyediakan <div id="site-header"></div> dan
// <div id="site-footer"></div>, plus <body data-page="..."> untuk menandai
// tautan navigasi yang aktif.

const NAV_PAGES = [
  { href: "index.html", label: "Ringkasan" },
  { href: "operasional.html", label: "Operasional" },
  { href: "wilayah.html", label: "Wilayah" },
  { href: "keuangan.html", label: "Keuangan" },
  { href: "keberlanjutan.html", label: "Keberlanjutan" },
  { href: "kepemimpinan.html", label: "Kepemimpinan" },
  { href: "pemegang-saham.html", label: "Pemegang Saham" },
];

function renderSiteHeader() {
  const host = document.getElementById("site-header");
  if (!host) return;
  const current = document.body.dataset.page || "index.html";

  const header = document.createElement("header");
  header.className = "site-header";
  const inner = document.createElement("div");
  inner.className = "site-header-inner";

  const brand = document.createElement("a");
  brand.className = "brand";
  brand.href = "index.html";
  brand.innerHTML = `<span class="brand-mark">BGA</span>`;
  const brandText = document.createElement("div");
  brandText.className = "brand-text";
  brandText.innerHTML = `<h1>Bumitama Gunajaya Agro</h1><p>Dasbor manajemen · data Annual Report 2025</p>`;
  brand.appendChild(brandText);

  const nav = document.createElement("nav");
  nav.className = "site-nav";
  NAV_PAGES.forEach((p) => {
    const a = document.createElement("a");
    a.href = p.href;
    a.textContent = p.label;
    if (p.href === current) a.classList.add("active");
    nav.appendChild(a);
  });

  const right = document.createElement("div");
  right.className = "header-right";
  const btn = document.createElement("button");
  btn.className = "theme-toggle";
  btn.id = "theme-toggle";
  btn.type = "button";
  right.appendChild(btn);

  inner.append(brand, nav, right);
  header.appendChild(inner);
  host.replaceWith(header);
}

function renderSiteFooter() {
  const host = document.getElementById("site-footer");
  if (!host) return;
  const footer = document.createElement("footer");
  footer.className = "note";
  footer.id = "sources";
  footer.innerHTML = `<p style="margin:0 0 8px; font-weight:600; color:var(--text-secondary);">Sumber data</p>
    <ul class="source-list" id="source-list"></ul>
    <p style="margin-top:10px;">Dasbor ini disusun dari Bumitama Agri Ltd. Annual Report 2025 dan bukan publikasi resmi BGA Group atau Bumitama Agri Ltd. Untuk keputusan bisnis, rujuk selalu ke laporan resmi perusahaan.</p>`;
  host.replaceWith(footer);

  const list = document.getElementById("source-list");
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

function updateThemeLabel() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const current = document.documentElement.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  btn.textContent = current === "dark" ? "Mode Terang" : "Mode Gelap";
}

function initTheme() {
  const stored = localStorage.getItem("bga-theme");
  if (stored) document.documentElement.setAttribute("data-theme", stored);
  updateThemeLabel();

  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("bga-theme", next);
    updateThemeLabel();
    window.dispatchEvent(new CustomEvent("bga:themechange"));
  });
}

window.addEventListener("DOMContentLoaded", () => {
  renderSiteHeader();
  renderSiteFooter();
  initTheme();
});
