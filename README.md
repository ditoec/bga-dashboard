# PT Bumitama Gunajaya Agro — Dasbor Operasional

Dasbor manajemen untuk BGA Group (PT Bumitama Gunajaya Agro), berisi ringkasan
kinerja tingkat Grup: luas tertanam, produksi TBS/CPO/PK, rendemen (OER),
pendapatan & laba bersih, komposisi inti/plasma, sebaran wilayah operasi,
keberlanjutan (RSPO/ISPO), profil perusahaan, dan direktori sebagian
pabrik/anak usaha.

Situs statis, tanpa proses build atau dependensi eksternal.

## Tentang data

BGA Group tidak menerbitkan laporan tersendiri, sehingga seluruh angka
tingkat-grup di sini diambil dari keterbukaan publik induk usahanya yang
tercatat di bursa, **Bumitama Agri Ltd** (SGX: P8Z). Setiap angka di
`js/data.js` diberi anotasi sumber; angka yang ditandai `estimated: true`
bukan angka yang diterbitkan langsung, melainkan hasil hitung dari
persentase perubahan tahun-ke-tahun yang diumumkan resmi oleh perusahaan.

Kinerja per kebun/pabrik individual (hasil TBS, rendemen, status operasional
per unit) bersifat internal dan **tidak dipublikasikan** — dasbor ini
sengaja tidak menampilkan angka semacam itu atas nama unit tertentu, agar
tidak menyesatkan. Bagian "Direktori pabrik & anak usaha" hanya memuat nama,
jenis unit dan lokasi yang berhasil diverifikasi dari dokumen publik (mis.
laporan sertifikasi RSPO), tanpa data kinerja.

Daftar sumber lengkap ada di bagian bawah dasbor dan di komentar berkas
`js/data.js`.

## Menjalankan secara lokal

```
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000`.

## Struktur berkas

- `index.html` — struktur halaman
- `css/style.css` — tema (terang/gelap) dan tata letak
- `js/data.js` — data operasional & finansial bersumber publik, lengkap dengan anotasi sumber
- `js/charts.js` — primitif chart SVG tanpa dependensi (garis, donat, sparkline) dengan tooltip hover
- `js/app.js` — merender kartu KPI, chart, panel profil/keberlanjutan, dan direktori pabrik; mengatur toggle tema

## Memperbarui data

Saat laporan keuangan/tahunan Bumitama Agri Ltd yang baru terbit, perbarui
nilai dan tahun di `js/data.js` (beserta anotasi sumber dan tautan pada
array `SOURCES`) — seluruh tampilan akan otomatis mengikuti data terbaru.
Untuk data operasional internal per kebun/pabrik, sambungkan `js/data.js` ke
sistem pelaporan MIS internal Grup.
