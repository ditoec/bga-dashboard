# PT Bumitama Gunajaya Agro — Dasbor Operasional

Dasbor manajemen multi-halaman untuk BGA Group (PT Bumitama Gunajaya Agro),
disusun langsung dari **Bumitama Agri Ltd. Annual Report 2025** (SGX: P8Z) —
induk usaha tercatat dari BGA Group. Gaya visual (hijau tua + emas, tipografi
serif untuk judul) diturunkan dari identitas visual laporan tahunan tersebut.

Situs statis, tanpa proses build atau dependensi eksternal (satu Google Font
untuk judul, dimuat via CDN).

## Halaman

| Halaman | Isi |
|---|---|
| `index.html` | Ringkasan — KPI utama FY2025 vs FY2024, tren pendapatan/produksi, snapshot wilayah |
| `operasional.html` | TBS/CPO/PK, rendemen (OER/KER), produktivitas per ha, komposisi kebun |
| `wilayah.html` | Kalimantan Tengah/Barat/Riau — luas, pabrik, tenaga kerja, direktori anak usaha |
| `keuangan.html` | Laba rugi, neraca, margin, rasio, arus kas, dividen, proyeksi 2026 |
| `keberlanjutan.html` | RSPO/ISPO, emisi GHG, kemitraan plasma, keragaman tenaga kerja, keselamatan |
| `kepemimpinan.html` | Dewan Komisaris/Direksi, manajemen kunci, milestone perusahaan, penghargaan |
| `pemegang-saham.html` | Struktur kepemilikan, statistik saham |

## Tentang data

Setiap angka di `js/data.js` diberi komentar sumber (nomor halaman di Annual
Report 2025). Rincian kinerja per kebun/pabrik individual bersifat internal
dan tidak dipublikasikan, sehingga sengaja tidak ditampilkan — bagian
"Direktori pabrik & anak usaha" hanya memuat nama dan lokasi yang
terverifikasi dari dokumen publik, tanpa data kinerja per unit.

Dokumen sumber (`BAL-Annual-Report-2025.pdf`) disertakan di root repo untuk
referensi.

## Menjalankan secara lokal

```
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000`.

## Struktur berkas

- `*.html` — 7 halaman, masing-masing memuat `js/data.js`, `js/charts.js`, `js/nav.js`, `js/app.js`
- `css/style.css` — tema (terang/gelap), tipografi, palet warna bermerek BGA
- `js/data.js` — seluruh data, terorganisir per bagian, dengan anotasi sumber
- `js/charts.js` — primitif chart SVG tanpa dependensi (garis, donat, bar horizontal, sparkline) dengan tooltip hover
- `js/nav.js` — header, navigasi antar-halaman, dan footer bersama
- `js/app.js` — fungsi render per bagian; setiap fungsi dijaga sehingga aman dimuat di semua halaman

## Memperbarui data

Saat Bumitama Agri Ltd. menerbitkan laporan baru, perbarui nilai dan tahun di
`js/data.js` (beserta komentar sumber halaman dan tautan pada array
`SOURCES`) — seluruh halaman mengikuti data tersebut secara otomatis.
