// Mock operational data for the Bumitama Gunajaya Agro (BGA Group) plantation dashboard.
// Figures are illustrative — wire this up to the group's mill/estate reporting system to go live.

const MONTHS = [
  "Oct '25", "Nov '25", "Dec '25", "Jan '26", "Feb '26", "Mar '26",
  "Apr '26", "May '26", "Jun '26", "Jul '26", "Aug '26", "Sep '26",
];

// Thousand metric tons
const FFB_PRODUCTION = [305, 298, 285, 270, 265, 290, 315, 330, 340, 335, 320, 310];
const OER = [22.1, 22.3, 22.0, 21.8, 22.2, 22.6, 23.0, 23.2, 22.9, 22.7, 22.6, 22.6];
const KER = [4.9, 5.0, 4.8, 4.8, 4.9, 5.0, 5.2, 5.3, 5.1, 5.0, 5.0, 5.1];
const CPO_PRODUCTION = FFB_PRODUCTION.map((f, i) => Math.round(f * OER[i]) / 100);

// USD per metric ton, CPO reference price
const CPO_PRICE = [820, 835, 850, 845, 860, 875, 890, 905, 895, 880, 870, 860];

// Rainfall, mm — actual vs 10-year average
const RAINFALL_ACTUAL = [280, 260, 240, 180, 150, 190, 220, 160, 120, 100, 90, 110];
const RAINFALL_AVERAGE = [260, 250, 230, 190, 170, 200, 210, 180, 140, 110, 100, 120];

const ESTATES = [
  { name: "Sungai Rangit Estate", region: "Central Kalimantan", mature: 12500, immature: 1200, yield: 22.4, oer: 22.8, status: "good", mill: "Sungai Rangit POM", millCapacity: 60, millUtilization: 88 },
  { name: "Hatan Tiring Estate", region: "Central Kalimantan", mature: 9800, immature: 800, yield: 19.6, oer: 21.9, status: "warning", mill: "Hatan Tiring POM", millCapacity: 45, millUtilization: 74 },
  { name: "Karya Kencana Estate", region: "Central Kalimantan", mature: 14200, immature: 2100, yield: 23.1, oer: 23.4, status: "good", mill: "Karya Kencana POM", millCapacity: 90, millUtilization: 91 },
  { name: "Sukamandang Estate", region: "Central Kalimantan", mature: 8600, immature: 1500, yield: 17.8, oer: 21.2, status: "critical", mill: "Sukamandang POM", millCapacity: 45, millUtilization: 61 },
  { name: "Bumi Sawit Kencana Estate", region: "Central Kalimantan", mature: 11300, immature: 900, yield: 21.0, oer: 22.5, status: "good", mill: "Bumi Sawit Kencana POM", millCapacity: 60, millUtilization: 85 },
  { name: "Ladang Sawit Mas Estate", region: "West Kalimantan", mature: 9200, immature: 1100, yield: 20.3, oer: 22.1, status: "good", mill: "Ladang Sawit Mas POM", millCapacity: 60, millUtilization: 83 },
  { name: "Kapuas Agro Estate", region: "West Kalimantan", mature: 7400, immature: 1900, yield: 18.5, oer: 21.6, status: "warning", mill: "shared — Ladang Sawit Mas POM", millCapacity: 0, millUtilization: null },
  { name: "Riau Andalan Estate", region: "Riau", mature: 6800, immature: 600, yield: 21.7, oer: 22.9, status: "good", mill: "Riau Andalan POM", millCapacity: 45, millUtilization: 87 },
  { name: "Siak Raya Estate", region: "Riau", mature: 5200, immature: 400, yield: 19.1, oer: 21.8, status: "warning", mill: "shared — Riau Andalan POM", millCapacity: 0, millUtilization: null },
  { name: "Bangka Agro Lestari Estate", region: "Bangka Belitung", mature: 4100, immature: 300, yield: 16.9, oer: 20.8, status: "critical", mill: "Bangka Agro Lestari POM", millCapacity: 30, millUtilization: 58 },
];

const REGIONS = ["All regions", "Central Kalimantan", "West Kalimantan", "Riau", "Bangka Belitung"];

const STATUS_META = {
  good: { label: "On track", dot: "var(--status-good)" },
  warning: { label: "Watch", dot: "var(--status-warning)" },
  critical: { label: "Attention", dot: "var(--status-critical)" },
};
