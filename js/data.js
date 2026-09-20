// Data PT Bumitama Gunajaya Agro (BGA Group), diambil langsung dari Bumitama Agri
// Ltd. Annual Report 2025 (SGX: P8Z) — BGA Group adalah entitas operasional utama
// di Indonesia dari grup usaha ini; laporan tahunan diterbitkan di tingkat induk
// yang tercatat di bursa. Setiap konstanta di bawah mengutip halaman sumbernya.
// PDF asli: BAL-Annual-Report-2025.pdf (150 halaman, diunggah oleh pengguna).

const YEARS5 = ["2021", "2022", "2023", "2024", "2025"];

// ---------------------------------------------------------------------------
// PROFIL PERUSAHAAN — p.2, p.16-19, p.20, p.136-137
// ---------------------------------------------------------------------------
const COMPANY = {
  legalName: "PT Bumitama Gunajaya Agro",
  groupName: "BGA Group",
  parentListed: "Bumitama Agri Ltd (SGX: P8Z)",
  founder: "Dr. Lim Hariyanto Wijaya Sarwono",
  founded: 1996,
  plantingCommenced: 1998,
  listedSince: 2012,
  hqOperational: "Jakarta, Indonesia",
  hqRegistered: "10 Anson Road, #11-19 International Plaza, Singapura 079903",
  motto: "Excellence Through Discipline",
  provinces: ["Kalimantan Tengah", "Kalimantan Barat", "Riau"],
  employees: 32628, // p.40, headcount akhir 2025
  mills: 17, // p.2
  millCapacityTph: 1165, // p.2, kapasitas olah gabungan
  millCapacityTonPerYear: 7000000, // p.2, "nearly 7 million MT annually"
  millUtilization2025: 81, // p.2, %
  marketCap: "S$2 miliar+", // p.6, akhir 2025
};

const OWNERSHIP = [
  // p.137, "Substantial Shareholders" — persentase atas modal saham beredar
  // (tidak termasuk treasury shares), per 11 Maret 2026
  { name: "Wellpoint Pacific Holdings Ltd (Grup Harita / keluarga Lim)", pct: 52.277 },
  { name: "IOI Corporation Berhad (via Oakridge & Lynwood)", pct: 32.101 },
  { name: "Publik & lainnya", pct: 15.602 },
];

const SHARE_STATS = {
  sharesIssuedExTreasury: 1734144044, // p.136
  treasurySharesPct: 1.35, // p.136
  shareholderCount: 1668, // p.136
  top20HoldersPct: 97.89, // p.136
};

// ---------------------------------------------------------------------------
// OPERATIONAL HIGHLIGHTS 2021-2025 — p.8 (tabel utama)
// ---------------------------------------------------------------------------
const PLANTED_AREA_HA = [187917, 187628, 187116, 187021, 184467];
const MATURE_HA = [181211, 180806, 180903, 179980, 174636];
const IMMATURE_HA = [6706, 6822, 6213, 7041, 9831];

const NUCLEUS_HA = [132728, 132099, 130567, 124408, 122427];
const NUCLEUS_MATURE_HA = [126582, 125462, 124581, 118030, 113300];
const PLASMA_HA = [55189, 55529, 56549, 62613, 62040];
const PLASMA_MATURE_HA = [54629, 55344, 56322, 61950, 61336];

// Luas tertanam menurut lokasi — Riau dilepas (disposal PT Masuba Citra Mandiri) di 2025
const PLANTED_KALIMANTAN_HA = [185608, 185319, 184807, 184712, 184467];
const PLANTED_RIAU_HA = [2309, 2309, 2309, 2309, 0];

const FFB_INTERNAL_MT = [3373559, 3862791, 3720331, 3360640, 3430017];
const FFB_NUCLEUS_MT = [2336178, 2676926, 2597097, 2197116, 2224473];
const FFB_PLASMA_MT = [1037381, 1185865, 1123234, 1163524, 1205544];

const CPO_MT = [1051623, 1188156, 1222139, 1141506, 1253341];
const PK_MT = [223000, 250935, 253114, 234311, 262517];

const FFB_YIELD_PER_MATURE_HA = [18.6, 21.4, 20.6, 18.6, 19.5]; // MT/ha
const CPO_YIELD_PER_MATURE_HA = [4.2, 4.8, 4.7, 4.1, 4.3]; // MT/ha
const OER_PCT = [22.6, 22.3, 22.7, 22.0, 22.2];
const KER_PCT = [4.8, 4.7, 4.7, 4.5, 4.6];

// Bauran sumber TBS pabrik: internal vs pihak ketiga — p.12-13
const FFB_TOTAL_PROCESSED_MT = { curr: 5650000, prev: 5180000 }; // 5.65jt (2025) vs +9.0% => ~5.18jt (2024)
const FFB_EXTERNAL_MT = { curr: 2220000, prev: 1823000 }; // 2.22jt (+21.8% YoY)
const FFB_EXTERNAL_SHARE_PCT = { curr: 39.3, prev: 35.2 };

const REPLANTING_HA_2025 = 3504; // p.13
const AVERAGE_PALM_AGE_YEARS_2025 = 14.4; // p.13
const MATURE_SHARE_PCT_2025 = 94.7; // p.13

// ---------------------------------------------------------------------------
// WILAYAH OPERASI — p.3 (peta), p.13 (produksi per wilayah)
// ---------------------------------------------------------------------------
const REGIONS = [
  {
    name: "Kalimantan Tengah",
    plantedHa: 104000, // dibulatkan ke ribuan terdekat, p.3
    plantedSharePct: 56.4, // p.13
    mills: 9,
    millCapacityTph: 675,
    ffb2025Mt: 2000000, // "2.0 million MT", p.13
    ffbYoyPct: 2.3,
    employees: 17251, // p.40
    employeesSharePct: 52.9,
  },
  {
    name: "Kalimantan Barat",
    plantedHa: 80000,
    plantedSharePct: 43.6,
    mills: 7,
    millCapacityTph: 400,
    ffb2025Mt: 1400000, // "1.4 million MT"
    ffbYoyPct: 3.3,
    employees: 13462,
    employeesSharePct: 41.2,
  },
  {
    name: "Riau",
    plantedHa: 0, // dilepas 2025 (disposal PT Masuba Citra Mandiri)
    plantedSharePct: 0,
    mills: 1,
    millCapacityTph: 90,
    ffb2025Mt: null, // pabrik memproses TBS pihak ketiga, bukan kebun sendiri
    ffbYoyPct: null,
    employees: 184,
    employeesSharePct: 0.6,
  },
];
const EMPLOYEES_OTHER_REGION = { jakarta: 1592, lainnya: 139 }; // p.40, sisa dari total 32,628

// ---------------------------------------------------------------------------
// FINANCIAL HIGHLIGHTS 2021-2025 (Rp miliar) — p.10
// ---------------------------------------------------------------------------
const REVENUE_IDR_B = [12249, 15829, 15443, 16732, 19951];
const GROSS_PROFIT_IDR_B = [3457, 5733, 4719, 4357, 5578];
const EBITDA_IDR_B = [3498, 5686, 4627, 4423, 5748];
const PROFIT_BEFORE_TAX_IDR_B = [2864, 4571, 3862, 3649, 4660];
const NET_PROFIT_IDR_B = [2089, 3399, 2931, 2735, 3366];
const NET_PROFIT_OWNERS_IDR_B = [1721, 2826, 2449, 2287, 2803];
const EPS_IDR = [986, 1618, 1412, 1319, 1616];

const TOTAL_ASSETS_IDR_B = [17686, 19898, 19233, 20973, 22865];
const TOTAL_CURRENT_ASSETS_IDR_B = [2179, 4539, 3697, 4987, 6319];
const TOTAL_CURRENT_LIAB_IDR_B = [1218, 1858, 2085, 896, 3340];
const TOTAL_NONCURRENT_LIAB_IDR_B = [4469, 3584, 1711, 3593, 2160];
const TOTAL_EQUITY_IDR_B = [11999, 14456, 15437, 16485, 17364];
const EQUITY_OWNERS_IDR_B = [10300, 12494, 13306, 14217, 15019];

const REVENUE_GROWTH_PCT = [34.6, 29.2, -2.4, 8.3, 19.2];
const GROSS_MARGIN_PCT = [28.2, 36.2, 30.6, 26.0, 28.0];
const OPERATING_MARGIN_PCT = [22.5, 31.1, 24.4, 20.8, 23.3];
const EBITDA_MARGIN_PCT = [28.6, 35.9, 30.0, 26.4, 28.8];
const NET_MARGIN_PCT = [17.1, 21.5, 19.0, 16.3, 16.9];
const ROE_PCT = [16.7, 22.6, 18.4, 16.1, 18.7];
const ROA_PCT = [9.7, 14.2, 12.7, 10.9, 12.3];

const NET_DEBT_EQUITY_X = [0.33, 0.17, 0.14, 0.09, 0.05];
const DEBT_EQUITY_X = [0.35, 0.23, 0.17, 0.19, 0.20];
const NET_DEBT_ASSETS_X = [0.22, 0.13, 0.12, 0.07, 0.04];

// CAGR 5-tahun (2021-2025) seperti dilaporkan di halaman infografis — p.9
const CAGR_5Y = { revenue: 13.0, ebitda: 13.2, netProfitOwners: 13.0, ffbInternal: 0.4, cpo: 4.5, pk: 4.2 };

// Rincian pendapatan & biaya FY2025 vs FY2024 — p.15
const REVENUE_DETAIL = {
  cpoAsp: { curr: 14355, prev: 12661, unit: "Rp/kg" }, // harga jual rata-rata CPO
  pkAsp: { curr: 12093, prev: 7565, unit: "Rp/kg" },
  cpoRevenueIdrT: { curr: 16.88, prev: 14.88 },
  pkRevenueIdrT: { curr: 3.07, prev: 1.85 },
  cpoRevenueSharePct: 84.6,
  cogsIdrT: { curr: 14.37, prev: 12.38 },
};

// Arus kas FY2025 (Rp triliun) — p.15
const CASH_FLOW_2025 = {
  operatingCf: 4.67,
  freeCf: 3.43,
  freeCfGrowthPct: 24.2,
  capexPpeIdrB: 1026,
  capexBearerPlantsIdrB: 497,
  dividendsPaidIdrT: 2.48,
  cashEndOfYearIdrT: 2.50,
  cashGrowthPct: 46.8,
};

const DIVIDEND_2025 = {
  totalSgdCents: 9.35,
  growthPct: 41,
  payoutRatioPct: 75,
  firstInterimSgdCents: 3.63,
  secondInterimSgdCents: 2.5, // dividen interim kedua — baru pertama kali FY2025
  finalProposedSgdCents: 3.22,
  payoutPolicyRangePct: [60, 75], // kebijakan baru, ditetapkan Feb 2025
};

const OUTLOOK_2026 = {
  capexIdrT: 1.5,
  replantingHa: [3000, 4000],
  newPlantingHa: [500, 1000],
  productionGrowthPct: 5,
  cpoRefPriceRangeMyr: [4000, 5500],
};

// ---------------------------------------------------------------------------
// KEBERLANJUTAN — p.30 (emisi), p.40-41 (tenaga kerja), p.43 (keselamatan),
// p.46 (RSPO & plasma)
// ---------------------------------------------------------------------------
const RSPO_MILLS_CERTIFIED = [8, 9, 9, 10, 10]; // per tahun, 2021-2025
const RSPO_CERTIFIED_HA = [56433, 66761, 79414, 84674, 84899];
const CSPO_CSPK_MT = [235111, 288129, 346466, 303018, 320191];
const RSPO_HGU_COVERAGE_PCT_2025 = 62; // 84,899 ha = 62% dari total HGU
const RSPO_TARGET_YEAR = 2027;

const PLASMA_ALLOCATION_PCT = [29.4, 29.6, 30.2, 33.5, 33.6];
const PLASMA_REGULATORY_MIN_PCT = 20;

const GHG = {
  grossEmissions2025MtCo2e: 2.87,
  grossEmissionsChangePct: -12.6,
  cropSequestrationMtCo2e: 1.21,
  methaneAvoidedMtCo2e: 0.211,
  netEmissions2025MtCo2e: 1.47,
  netIntensityMtCo2ePerMtCpo: 1.17,
  intensityReductionVs2016Pct: 28.2,
  newTarget2030ReductionPct: 50,
  methaneCaptureFacilities: 4,
};

// Sumber emisi bruto 2025 menurut jenis (%) — p.30. Empat kategori terkecil
// digabung ke "Lainnya" agar donat tetap terbaca (metode dataviz: fold ke Other).
const GHG_BY_TYPE = [
  { name: "Konversi lahan", pct: 37.6 },
  { name: "Metana dari POME", pct: 31.0 },
  { name: "Emisi pihak ketiga", pct: 12.7 },
  { name: "Oksidasi gambut", pct: 8.5 },
  { name: "Lainnya", pct: 10.2 }, // CO2 pupuk 4.9 + N2O pupuk 2.5 + N2O gambut 1.2 + BBM lapangan 1.1 + BBM pabrik 0.2 + listrik 0.2
];

const WORKFORCE = {
  total2025: 32628,
  byAge: [
    { label: "18-30 tahun", count: 13208, pct: 40.5 },
    { label: "31-50 tahun", count: 17876, pct: 54.8 },
    { label: "51 tahun ke atas", count: 1544, pct: 4.7 },
  ],
  byCategory: [
    { label: "Pekerja (Workers)", count: 31036, pct: 95.1 },
    { label: "Staf", count: 1318, pct: 4.0 },
    { label: "Manajemen", count: 237, pct: 0.7 },
    { label: "Manajemen Senior", count: 37, pct: 0.1 },
  ],
  womenSharePct2025: 29,
  womenBoardPct: 28.6, // 2 dari 7 anggota Dewan Komisaris/Direksi
  womenSeniorMgmtPct: 10.8,
  total5y: [31541, 33058, 32831, 31977, 32628],
  permanent5y: [30952, 32623, 32629, 31785, 32363],
};

const SAFETY = {
  lostTimeIncidentRate2025: 47.96, // per 1,000,000 jam kerja
  lostTimeVsTargetPct: 2.9, // lebih baik dari Triple Zero Target
  permanentDisabilityAccidents2025: 8,
  framework: "Triple Zero Target (TZT): nol fatalitas, penurunan tingkat keparahan & frekuensi kecelakaan",
};

// ---------------------------------------------------------------------------
// DEWAN KOMISARIS & DIREKSI — p.16-18 ; MANAJEMEN KUNCI — p.19
// ---------------------------------------------------------------------------
const BOARD = [
  { name: "Lim Gunawan Hariyanto", title: "Executive Chairman and Chief Executive Officer", since: 2012 },
  { name: "Lim Christina Hariyanto", title: "Executive Director", since: 2017 },
  { name: "Dato' Lee Yeow Chor", title: "Non-Executive Director · Group MD & CEO, IOI Corporation Berhad", since: 2012 },
  { name: "Lim Hung Siang", title: "Lead Independent Director", since: 2018 },
  { name: "Lawrence Lua Gek Pong", title: "Independent Director", since: 2020 },
  { name: "Witjaksana Darmosarkoro", title: "Independent Director · Agronomic Advisor", since: 2021 },
  { name: "Ng Yi Wayn", title: "Independent Director", since: 2024 },
];

const KEY_MANAGEMENT = [
  { name: "Roebianto", title: "Chief Operating Officer", since: 2004 },
  { name: "Sie Eddy Kurniawan", title: "Chief Financial Officer", since: 2013 },
  { name: "Lim Sian Choo", title: "Chief Sustainability Officer", since: 2020 },
];

// ---------------------------------------------------------------------------
// MILESTONE PERUSAHAAN — p.20
// ---------------------------------------------------------------------------
const MILESTONES = [
  { year: 1996, text: "Akuisisi konsesi lahan pertama seluas 17.500 ha di Kalimantan Tengah" },
  { year: 1998, text: "Mulai menanam kebun kelapa sawit pertama" },
  { year: 2003, text: "Pabrik CPO pertama beroperasi di Kalimantan Tengah (kapasitas 45 tph)" },
  { year: 2007, text: "Luas tertanam melampaui 50.000 ha; IOI Group mengakuisisi 33% saham" },
  { year: 2010, text: "Luas tertanam melampaui 100.000 ha" },
  { year: 2012, text: "Tercatat di Papan Utama Bursa Efek Singapura (April)" },
  { year: 2014, text: "Meraih dua sertifikat RSPO dan satu sertifikat ISPO pertama" },
  { year: 2015, text: "Kebijakan Keberlanjutan berbasis NDPE; Laporan Keberlanjutan perdana" },
  { year: 2017, text: "Meluncurkan BBCP, proyek konservasi berbasis lanskap seluas 9.000 ha di Ketapang, Kalimantan Barat" },
  { year: 2018, text: "Membantu 35 petani swadaya (223 ha) di Kalimantan Tengah meraih sertifikasi RSPO" },
  { year: 2019, text: "Sertifikat RSPO pertama untuk plasma smallholder (PT ASM); traceability TBS >98%" },
  { year: 2020, text: "Memulai proyek FlyForest — reboisasi 800 ha kawasan konservasi BBCP dengan bantuan drone" },
  { year: 2021, text: "Pendapatan tembus Rp10 triliun untuk pertama kalinya; fasilitas tangkap metana pertama selesai" },
  { year: 2022, text: "Sukuk Musharakah 2014/2029 dinaikkan ke peringkat AA2/Stable oleh RAM Ratings" },
  { year: 2023, text: "Usia ke-25 Bumitama & 10 tahun tercatat di SGX; rasio pembayaran dividen 55% (yield 14%)" },
  { year: 2024, text: "Menambah 2 pabrik di Kalimantan Barat (kapasitas gabungan 100 tph)" },
  { year: 2025, text: "Rasio pembayaran dividen tertinggi sepanjang sejarah (75%); menambah 3 fasilitas tangkap metana baru" },
];

// ---------------------------------------------------------------------------
// PENGHARGAAN — p.21 (dipilih yang paling relevan bagi manajemen)
// ---------------------------------------------------------------------------
const AWARDS = [
  { year: 2025, text: "The Edge Singapore Billion Dollar Club — Overall Sector Winner & Highest Returns to Shareholders Over Three Years (Consumer Defensive)" },
  { year: 2025, text: "Fortune Southeast Asia 500 — persentil ke-52 (peringkat keseluruhan)" },
  { year: 2025, text: "Medbun Awards 2025 — kategori OER tertinggi ke-3, dari Media Perkebunan Magazine" },
  { year: 2025, text: "500 Asia-Pacific's Best Companies 2025 — TIME Magazine & Statista (PT Bumitama Gunajaya Agro)" },
  { year: 2025, text: "Tax Award 2025 — PT BGA & PT BGB, dari Kantor Wilayah DJP Jakarta Selatan II" },
  { year: 2024, text: "The Edge Singapore Billion Dollar Club — Overall Sector Winner, Highest Returns to Shareholders & Highest PAT Growth Over Three Years" },
  { year: 2024, text: "IR Magazine Awards SEA 2024 — Best Overall Investor Relations (Small Cap)" },
  { year: 2023, text: "Asiamoney Awards — Overall Most Outstanding Company in Singapore (4 kategori)" },
  { year: 2023, text: "Conservation Leadership Award dari RSPO" },
];

// ---------------------------------------------------------------------------
// DIREKTORI PABRIK & ANAK USAHA (contoh unit yang teridentifikasi dari dokumen
// publik, bukan daftar lengkap 17 pabrik — laporan tahunan tidak merinci nama
// unit per pabrik).
// ---------------------------------------------------------------------------
const MILL_DIRECTORY = [
  { pt: "PT Gunajaya Karya Gemilang", unit: "Kendawangan POM", location: "Ketapang, Kalimantan Barat" },
  { pt: "PT Karya Makmur Bahagia (GMKM)", unit: "Gunung Makmur POM", location: "Kalimantan Tengah" },
  { pt: "PT Bumitama Gunajaya Abadi", unit: "Lamandau Mill · Estat Danau Merah & Tonam Raya", location: "Kotawaringin & Lamandau, Kalimantan Tengah" },
  { pt: "PT Langgeng Makmur Sejahtera", unit: "Estat Sungai Puring", location: "Kalimantan Tengah" },
  { pt: "PT Agro Sejahtera Manunggal", unit: "Pembangunan Raya POM", location: "Kalimantan Tengah" },
  { pt: "PT Pupuk Lapan Harsa", unit: "Fasilitas produksi pupuk (diakuisisi 2024)", location: "Indonesia" },
];

const SOURCES = [
  { label: "Bumitama Agri Ltd. — Annual Report 2025 (sumber utama seluruh data di dasbor ini)", url: "https://bumitama-agri.com/wp-content/uploads/2026/04/BAL-Annual-Report-2025.pdf" },
];

const AS_OF = "Tahun buku 2025 · Annual Report 2025, diterbitkan April 2026";
