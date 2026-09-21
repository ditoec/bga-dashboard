# Bumitama Gunajaya Agro (BGA Group) — Web & Dasbor

Repo ini berisi dua bagian, digabung dalam satu deploy:

1. **Landing page publik** (root, `index.html`) — situs satu halaman bergaya
   modern/interaktif (Three.js hero, tilt & flip cards, scroll-reveal),
   dalam Bahasa Inggris, untuk audiens publik/investor. Desain dan copy
   original, disusun dari data yang sama dengan dasbor di bawah.
2. **Dasbor manajemen** (folder `dashboard/`) — 7 halaman Bahasa Indonesia
   untuk tim manajemen internal, disusun langsung dari **Bumitama Agri Ltd.
   Annual Report 2025** (SGX: P8Z), induk usaha tercatat dari BGA Group.

Situs statis, tanpa proses build (dua Google Font + Three.js dimuat via CDN
di landing page; dasbor tanpa dependensi eksternal sama sekali).

## Struktur

```
index.html              ← landing page publik (EN)
css/site.css             ← desain landing page
js/site.js                ← interaksi landing page (reveal, counter, tilt, flip)
js/site-hero3d.js         ← visual Three.js di hero (dynamic import, gagal dengan aman)
js/site-content.js        ← copy EN untuk milestone/penghargaan di landing page

dashboard/                ← dasbor manajemen (ID), 7 halaman
  index.html               (Ringkasan)
  operasional.html
  wilayah.html
  keuangan.html
  keberlanjutan.html
  kepemimpinan.html
  pemegang-saham.html

css/style.css             ← desain dasbor (terang/gelap)
js/nav.js                  ← header/footer/navigasi bersama dasbor
js/app.js                  ← render tiap bagian dasbor

js/data.js                ← SUMBER DATA BERSAMA — dipakai landing page & dasbor
js/charts.js               ← primitif chart SVG bersama (line, donut, bar, sparkline)
```

`js/data.js` dan `js/charts.js` dipakai bersama oleh kedua bagian situs —
perbarui sekali, kedua bagian ikut ter-update.

## Tentang data

Setiap angka di `js/data.js` diberi komentar sumber (nomor halaman di Annual
Report 2025). Rincian kinerja per kebun/pabrik individual bersifat internal
dan tidak dipublikasikan, sehingga sengaja tidak ditampilkan.

Dokumen sumber (`BAL-Annual-Report-2025.pdf`) disertakan di root repo untuk
referensi.

Landing page publik adalah showcase independen, bukan publikasi resmi BGA
Group atau Bumitama Agri Ltd. — lihat footer situs.

## Menjalankan secara lokal

```
python3 -m http.server 8000
```

- Landing page: `http://localhost:8000`
- Dasbor manajemen: `http://localhost:8000/dashboard/`

## Memperbarui data

Saat Bumitama Agri Ltd. menerbitkan laporan baru, perbarui nilai dan tahun di
`js/data.js` (beserta komentar sumber halaman dan tautan pada array
`SOURCES`) — landing page dan dasbor mengikuti data tersebut secara otomatis.
Copy naratif Bahasa Inggris (milestone/penghargaan) ada terpisah di
`js/site-content.js`.
