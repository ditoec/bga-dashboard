// Data operasional & finansial PT Bumitama Gunajaya Agro (BGA Group), disusun dari
// keterbukaan publik perusahaan induknya yang tercatat di bursa, Bumitama Agri Ltd.
// (SGX: P8Z) — karena BGA Group tidak menerbitkan laporan tersendiri, seluruh angka
// tingkat-grup di bawah ini berasal dari laporan Bumitama Agri Ltd.
//
// Setiap angka diberi anotasi sumber. Angka yang ditandai `estimated: true` BUKAN
// angka yang diterbitkan langsung, melainkan hasil hitung dari persentase
// perubahan tahun-ke-tahun yang diungkapkan resmi oleh perusahaan (mis. "naik 19,2%
// dari tahun sebelumnya"). Rincian operasional per kebun/pabrik (hasil TBS, rendemen,
// status per unit) bersifat internal dan tidak dipublikasikan — sehingga dasbor ini
// TIDAK menyajikan angka kinerja per kebun/pabrik yang mengatasnamakan unit tertentu.
// Lihat daftar SOURCES di bagian bawah file ini untuk tautan dokumen aslinya.

const COMPANY = {
  legalName: "PT Bumitama Gunajaya Agro",
  groupName: "BGA Group",
  parentListed: "Bumitama Agri Ltd (SGX: P8Z)",
  founded: 1996,
  founder: "Harita Group",
  listedSince: 2012,
  hqOperational: "Jakarta, Indonesia",
  hqRegistered: "Singapura (10 Anson Road)",
  provinces: ["Kalimantan Tengah", "Kalimantan Barat", "Riau"],
  employees: 32000, // "more than 32,000 employees" — FY2025
  mills: 17, // FY2025
  millCapacityTonPerYear: 7000000, // "processing capacity of nearly 7 million MT annually" — FY2025
};

const OWNERSHIP = [
  { name: "Harita Group (via Wellpoint Pacific Holdings Ltd)", pct: 52 },
  { name: "IOI Corporation Berhad", pct: 32 },
  { name: "Publik & lainnya", pct: 16 },
];

// Luas tertanam grup, akhir tahun (ha) — laporan tahunan 2024 (tabel 5 tahun) + hasil FY2025.
const PLANTED_YEARS = ["2021", "2022", "2023", "2024", "2025"];
const PLANTED_AREA_HA = [187917, 187917, 187628, 187116, 184467];
const PLASMA_HA_2025 = 62000; // 33.6% dari luas tertanam 2025 — FY2025 results
const NUCLEUS_HA_2025 = PLANTED_AREA_HA[PLANTED_AREA_HA.length - 1] - PLASMA_HA_2025;

// Rendemen CPO (OER), % — FY2023–FY2025 (disebut eksplisit di rilis hasil tahunan).
const OER_YEARS = ["2023", "2024", "2025"];
const OER = [22.7, 22.0, 22.2];

// Pendapatan & laba bersih, Rp triliun. Titik `estimated:true` dihitung dari % YoY
// resmi yang diumumkan perusahaan, bukan angka yang diterbitkan langsung.
const FINANCIAL_YEARS = ["2022", "2023", "2024", "2025"];
const REVENUE_IDR_T = [
  { value: 15.82, estimated: true }, // tersirat dari "FY2023 turun 2,4%"
  { value: 15.44, estimated: false }, // FY2023 Financial Results
  { value: 16.74, estimated: true }, // tersirat dari "FY2025 naik 19,2%"
  { value: 19.95, estimated: false }, // FY2025 Financial Results
];
const NET_PROFIT_IDR_T = [
  { value: 3.40, estimated: false }, // FY2022, dari AR2022 (+62,7% dari FY2021)
  { value: 2.93, estimated: false }, // FY2023 Financial Results
  { value: 2.74, estimated: true }, // tersirat dari "FY2025 naik 23%"
  { value: 3.37, estimated: false }, // FY2025 Financial Results
];

// Ringkasan FY2025 vs FY2024 untuk kartu KPI.
const HEADLINE = {
  plantedArea: { curr: 184467, prev: 187116, unit: "ha" },
  ffbHarvested: { curr: 3.43, prev: 3.36, unit: "juta ton", note: "Yield TBS 19,5 ton/ha (naik 5% YoY)" },
  ffbProcessed: { curr: 5.65, unit: "juta ton", note: "39% berasal dari TBS pihak ketiga/petani swadaya sekitar" },
  cpoProduction: { curr: 1.18, prev: 1.14, unit: "juta ton" },
  pkProduction: { curr: 254, unit: "ribu ton" },
  oer: { curr: 22.2, prev: 22.0, unit: "%" },
  revenue: { curr: 19.95, prev: 16.74, unit: "Rp triliun", note: "Margin EBITDA 28%" },
  netProfit: { curr: 3.37, prev: 2.74, unit: "Rp triliun", note: "Dividen 9,35 sen SGD/saham (naik 41%)" },
};

// Estimasi sebaran wilayah: BGA hanya pernah mempublikasikan rincian per-provinsi pada
// 2022 (Kalteng 105.000 ha, Kalbar 80.000 ha, Riau 2.000 ha). Proporsi itu diterapkan
// ke total luas tertanam 2025 karena rincian per-provinsi terbaru belum dipublikasikan.
const REGION_SHARE_BASE_2022 = [
  { region: "Kalimantan Tengah", ha2022: 105000 },
  { region: "Kalimantan Barat", ha2022: 80000 },
  { region: "Riau", ha2022: 2000 },
];

// Sebaran pabrik per wilayah, 2022 (jumlah terakhir yang dipublikasikan per-provinsi).
// Total pabrik grup saat ini 17 (2025); rincian regional dari 3 pabrik tambahan
// belum dipublikasikan, sehingga tidak diestimasi di sini.
const MILLS_BY_REGION_2022 = [
  { region: "Kalimantan Tengah", mills: 8 },
  { region: "Kalimantan Barat", mills: 5 },
  { region: "Riau", mills: 1 },
];

const SUSTAINABILITY = {
  rspoMillsCertified: 9,
  rspoTargetYear: 2027,
  ispoCertifications: 6,
  ispoTargetYear: 2027,
  cspoCspkTonnes2025: 320191,
  conservation: { hcv: 87, hcs: 9, peat: 3, other: 1 },
};

// Direktori sebagian anak usaha & unit produksi — nama, jenis dan lokasi yang
// terverifikasi dari dokumen publik (laporan sertifikasi RSPO, dsb). Sengaja TIDAK
// menyertakan angka kinerja (hasil, rendemen, status) karena data itu tidak
// dipublikasikan per unit.
const MILL_DIRECTORY = [
  { pt: "PT Gunajaya Karya Gemilang", unit: "Kendawangan POM", location: "Ketapang, Kalimantan Barat" },
  { pt: "PT Karya Makmur Bahagia (GMKM)", unit: "Gunung Makmur POM", location: "Kalimantan Tengah" },
  { pt: "PT Bumitama Gunajaya Abadi", unit: "Lamandau Mill · Estat Danau Merah & Tonam Raya", location: "Kotawaringin & Lamandau, Kalimantan Tengah" },
  { pt: "PT Langgeng Makmur Sejahtera", unit: "Estat Sungai Puring", location: "Kalimantan Tengah" },
  { pt: "PT Agro Sejahtera Manunggal", unit: "Pembangunan Raya POM", location: "Kalimantan Tengah" },
  { pt: "PT Ladang Sawit Mas", unit: "Kebun & unit produksi", location: "Kalimantan (lokasi rinci belum dipublikasikan)" },
  { pt: "PT Karya Makmur Langgeng", unit: "Kebun & unit produksi", location: "Kalimantan Tengah" },
];

const SOURCES = [
  { label: "Bumitama Agri Ltd — Hasil Keuangan FY2025 (Feb 2026)", url: "https://bumitama-agri.com/wp-content/uploads/2026/02/BAL-FY2025-Financial-Results-1.pdf" },
  { label: "Bumitama Agri Ltd — Laporan Tahunan 2025", url: "https://bumitama-agri.com/wp-content/uploads/2026/04/BAL-Annual-Report-2025.pdf" },
  { label: "Bumitama Agri Ltd — Laporan Tahunan 2024", url: "https://bumitama-agri.com/wp-content/uploads/2025/04/Bumitama-Agri-Ltd_AR2024_FA.pdf" },
  { label: "Bumitama Agri Ltd — Hasil Keuangan FY2023 (pengumuman SGX)", url: "https://links.sgx.com/FileOpen/BAL%20-%20FY2023%20-%20Financial%20Results.ashx?App=Announcement&FileID=789818" },
  { label: "Bumitama Agri Ltd — Investor Relations", url: "https://bumitama-agri.com/investors/" },
  { label: "RSPO — Profil anggota Bumitama Agri Ltd", url: "https://rspo.org/members/1-0043-07-000-00/" },
  { label: "Wikipedia — Bumitama Agri", url: "https://en.wikipedia.org/wiki/Bumitama_Agri" },
];

const AS_OF = "Tahun buku 2025 (dipublikasikan Februari 2026)";
