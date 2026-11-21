/**
 * Sample data for a fictional multi-store retailer, "Hollis & Grant Mercantile".
 * Deterministic (seeded) so charts and reports are stable across reloads.
 */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const rand = rng(20261121);
const jitter = (base: number, pct: number) => base * (1 + (rand() * 2 - 1) * pct);

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const STORES = ['Main Street', 'Riverside', 'Harbor', 'Old Town', 'Northgate'];
export const CATEGORIES = ['Apparel', 'Home Goods', 'Pantry', 'Hardware', 'Stationery', 'Gifts'];

const season = [0.78, 0.74, 0.86, 0.9, 0.96, 0.94, 0.92, 0.97, 0.93, 1.02, 1.24, 1.58];

export const monthlySales = MONTHS.map((month, i) => {
  const revenue = Math.round(jitter(410000 * season[i], 0.04));
  const prior = Math.round(revenue / jitter(1.07, 0.03));
  const target = Math.round(395000 * season[i] * 1.05);
  const cogs = Math.round(revenue * jitter(0.58, 0.02));
  const opex = Math.round(jitter(112000, 0.05));
  return { month, revenue, prior, target, cogs, grossMargin: revenue - cogs, opex, net: revenue - cogs - opex, transactions: Math.round(revenue / jitter(46, 0.05)) };
});

export const salesByCategory = MONTHS.map((month, i) => {
  const row: Record<string, number | string> = { month };
  const weights = [0.27, 0.21, 0.17, 0.15, 0.09, 0.11];
  const holiday = i >= 10 ? [1.1, 1.2, 0.9, 0.7, 1.0, 1.9] : [1, 1, 1, 1, 1, 1];
  CATEGORIES.forEach((c, k) => (row[c] = Math.round(jitter(410000 * season[i] * weights[k] * holiday[k], 0.06))));
  return row;
});

export const storePerformance = STORES.map((store, i) => {
  const sales = Math.round(jitter([1.38, 1.02, 0.94, 0.81, 0.7][i] * 1_000_000, 0.03));
  const target = Math.round(sales / jitter([0.98, 1.04, 0.93, 1.02, 0.96][i], 0.005));
  return { store, sales, target, attainment: sales / target, sqft: [6200, 4800, 5100, 3900, 3400][i], staff: [28, 21, 22, 17, 15][i], conversion: jitter(0.31, 0.12), basket: jitter(47, 0.1), nps: Math.round(jitter(54, 0.18)) };
});

export const categoryShare = CATEGORIES.map((name, i) => ({ name, value: [27, 21, 17, 15, 9, 11][i] }));

export const dailyTraffic = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(2026, 7, 23 + i);
  const dow = d.getDay();
  const weekday = [1.35, 0.78, 0.82, 0.86, 0.95, 1.12, 1.48][dow];
  const trend = 1 + i * 0.004;
  const visitors = Math.round(jitter(1850 * weekday * trend, 0.08));
  return { date: d.toISOString().slice(0, 10), label: `${d.getMonth() + 1}/${d.getDate()}`, visitors, conversion: jitter(0.3, 0.1), avg7: 0 };
});
dailyTraffic.forEach((d, i) => {
  const win = dailyTraffic.slice(Math.max(0, i - 6), i + 1);
  d.avg7 = Math.round(win.reduce((s, x) => s + x.visitors, 0) / win.length);
});

/** Basket size vs. dwell time — scatter sample. */
export const basketScatter = Array.from({ length: 140 }, () => {
  const dwell = 3 + rand() * 38;
  const store = STORES[Math.floor(rand() * 3)];
  return { dwell: +dwell.toFixed(1), basket: +Math.max(6, jitter(12 + dwell * 1.9, 0.35)).toFixed(2), store };
});

/** Transaction values for a histogram. */
export const transactionValues = Array.from({ length: 900 }, () => {
  const u = rand() + rand() + rand();
  return Math.max(2, Math.round(Math.exp(2.6 + u * 0.55) * 1.1));
});

export function histogram(values: number[], bins = 18) {
  const max = Math.min(Math.max(...values), 260);
  const w = max / bins;
  const out = Array.from({ length: bins }, (_, i) => ({ bin: `$${Math.round(i * w)}`, from: i * w, to: (i + 1) * w, count: 0 }));
  for (const v of values) out[Math.min(bins - 1, Math.floor(Math.min(v, max - 0.01) / w))].count++;
  return out;
}

/** Hourly staffing coverage heatmap: day × hour → % of required coverage. */
export const HOURS = ['8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p'];
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const coverageHeatmap = DAYS.map((day, di) => ({
  day,
  values: HOURS.map((_, hi) => {
    const peak = Math.exp(-Math.pow(hi - (di >= 5 ? 5 : 8), 2) / 10);
    return Math.round(Math.min(125, Math.max(55, jitter(92 - peak * 22 + (di === 4 ? -8 : 0), 0.08))));
  }),
}));

/** Profit bridge (waterfall): prior year net → current year net. */
export const profitBridge = [
  { name: 'FY2025 net', value: 612000, kind: 'total' as const },
  { name: 'Volume', value: 284000, kind: 'delta' as const },
  { name: 'Price / mix', value: 96000, kind: 'delta' as const },
  { name: 'Shrink', value: -58000, kind: 'delta' as const },
  { name: 'Labor', value: -141000, kind: 'delta' as const },
  { name: 'Occupancy', value: -37000, kind: 'delta' as const },
  { name: 'Marketing', value: -44000, kind: 'delta' as const },
  { name: 'FY2026 net', value: 712000, kind: 'total' as const },
];

export const funnel = [
  { stage: 'Store visits', value: 168400 },
  { stage: 'Engaged browsing', value: 104900 },
  { stage: 'Fitting / demo', value: 61800 },
  { stage: 'Purchase', value: 51200 },
  { stage: 'Loyalty sign-up', value: 12700 },
];

export const kpis = {
  revenueYtd: monthlySales.slice(0, 11).reduce((s, m) => s + m.revenue, 0),
  revenuePriorYtd: monthlySales.slice(0, 11).reduce((s, m) => s + m.prior, 0),
  grossMarginPct: 0.418,
  grossMarginPriorPct: 0.409,
  inventoryTurns: 4.6,
  inventoryTurnsPrior: 4.9,
  sellThrough: 0.672,
  sellThroughPrior: 0.648,
  laborPct: 0.142,
  laborPctPrior: 0.137,
  shrinkPct: 0.0124,
  shrinkPctPrior: 0.0141,
};
