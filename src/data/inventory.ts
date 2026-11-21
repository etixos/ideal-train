export type StockStatus = 'In stock' | 'Low stock' | 'Out of stock' | 'Discontinued';

export interface Product {
  sku: string;
  name: string;
  category: string;
  vendor: string;
  location: string;
  onHand: number;
  reorderPoint: number;
  onOrder: number;
  unitCost: number;
  price: number;
  sold30: number;
  status: StockStatus;
  lastReceived: string;
}

const raw: [string, string, string, string, number, number, number, number, number, number][] = [
  ['HG-APP-1042', 'Waxed Canvas Field Jacket', 'Apparel', 'Halyard Outfitters', 48, 20, 0, 84, 198, 31],
  ['HG-APP-1107', 'Merino Crew Sweater — Oat', 'Apparel', 'Northfold Woolens', 12, 18, 36, 38, 118, 27],
  ['HG-APP-1188', 'Selvedge Work Shirt', 'Apparel', 'Halyard Outfitters', 0, 15, 48, 29, 88, 40],
  ['HG-HOM-2210', 'Enamel Stock Pot, 8 qt', 'Home Goods', 'Brightwater Enamel', 33, 12, 0, 41, 96, 14],
  ['HG-HOM-2244', 'Linen Table Runner', 'Home Goods', 'Sorrel Textile Co.', 71, 25, 0, 11, 34, 22],
  ['HG-HOM-2290', 'Beeswax Taper Candles (pair)', 'Home Goods', 'Cooper Hill Apiary', 9, 30, 120, 3.2, 14, 64],
  ['HG-PAN-3015', 'Stone-Ground Grits, 2 lb', 'Pantry', 'Millrace Grain', 140, 60, 0, 4.1, 9.5, 88],
  ['HG-PAN-3051', 'Sorghum Syrup, 12 oz', 'Pantry', 'Pecan Ridge Farm', 54, 40, 0, 5.6, 13, 47],
  ['HG-PAN-3077', 'Smoked Sea Salt Tin', 'Pantry', 'Tidewater Salt Works', 18, 35, 72, 3.8, 11, 52],
  ['HG-HDW-4120', 'Hand-Forged Claw Hammer', 'Hardware', 'Anvil & Ash', 22, 10, 0, 34, 79, 9],
  ['HG-HDW-4166', 'Brass Cabinet Pulls (set of 6)', 'Hardware', 'Calloway Brass', 6, 12, 24, 19, 46, 15],
  ['HG-HDW-4199', 'Japanese Pull Saw', 'Hardware', 'Kessler Tool', 15, 8, 0, 22, 54, 7],
  ['HG-STA-5008', 'Clothbound Ledger, A5', 'Stationery', 'Fairmont Bindery', 96, 40, 0, 7.5, 24, 58],
  ['HG-STA-5033', 'Fountain Pen Ink — Iron Gall', 'Stationery', 'Fairmont Bindery', 0, 20, 0, 9, 22, 0],
  ['HG-STA-5061', 'Pencil Roll, Waxed Canvas', 'Stationery', 'Halyard Outfitters', 27, 15, 0, 14, 38, 11],
  ['HG-GFT-6012', 'Holiday Gift Box — Pantry', 'Gifts', 'House Assembled', 64, 50, 150, 28, 72, 93],
  ['HG-GFT-6040', 'Cedar Keepsake Box', 'Gifts', 'Anvil & Ash', 19, 10, 0, 18, 48, 8],
  ['HG-GFT-6075', 'Letterpress Card Set', 'Gifts', 'Fairmont Bindery', 112, 40, 0, 6, 18, 41],
];
const locs = ['A-01', 'A-04', 'B-02', 'B-07', 'C-03', 'C-11', 'D-05', 'D-08', 'E-02'];

export const PRODUCTS: Product[] = raw.map(([sku, name, category, vendor, onHand, reorderPoint, onOrder, unitCost, price, sold30], i) => ({
  sku,
  name,
  category,
  vendor,
  location: locs[i % locs.length],
  onHand,
  reorderPoint,
  onOrder,
  unitCost,
  price,
  sold30,
  status: sku === 'HG-STA-5033' ? 'Discontinued' : onHand === 0 ? 'Out of stock' : onHand < reorderPoint ? 'Low stock' : 'In stock',
  lastReceived: `2026-${String(9 + (i % 3)).padStart(2, '0')}-${String(3 + ((i * 7) % 24)).padStart(2, '0')}`,
}));

export const PURCHASE_ORDERS = [
  { id: 'PO-24811', vendor: 'Halyard Outfitters', lines: 6, total: 8420, status: 'Sent', due: '2026-11-28' },
  { id: 'PO-24809', vendor: 'Cooper Hill Apiary', lines: 2, total: 1190, status: 'Confirmed', due: '2026-11-25' },
  { id: 'PO-24803', vendor: 'House Assembled', lines: 4, total: 4300, status: 'Partially received', due: '2026-11-22' },
  { id: 'PO-24797', vendor: 'Tidewater Salt Works', lines: 1, total: 274, status: 'Draft', due: '2026-12-02' },
  { id: 'PO-24790', vendor: 'Calloway Brass', lines: 3, total: 912, status: 'Received', due: '2026-11-14' },
];

export const STOCK_ACTIVITY = [
  { time: '09:42', who: 'Dana Whitlock', what: 'Received 48 × Selvedge Work Shirt', ref: 'PO-24803', kind: 'receive' },
  { time: '09:15', who: 'System', what: 'Low-stock alert: Beeswax Taper Candles', ref: 'HG-HOM-2290', kind: 'alert' },
  { time: '08:57', who: 'Marcus Bell', what: 'Cycle count adjusted Aisle B (−3 units)', ref: 'CC-1182', kind: 'adjust' },
  { time: 'Yesterday', who: 'Priya Natarajan', what: 'Transferred 12 × Cedar Keepsake Box to Harbor', ref: 'TR-0931', kind: 'transfer' },
  { time: 'Yesterday', who: 'Dana Whitlock', what: 'Created PO-24811 for Halyard Outfitters', ref: 'PO-24811', kind: 'order' },
];
