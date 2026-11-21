/** Shared workflow used by every platform simulation: reviewing and receiving a purchase order. */
import { PURCHASE_ORDERS } from '../data/inventory';

export type Step = 'list' | 'detail' | 'receive';

export interface POLine {
  sku: string;
  name: string;
  ordered: number;
  received: number;
  cost: number;
}

export const LINES: Record<string, POLine[]> = {
  'PO-24811': [
    { sku: 'HG-APP-1042', name: 'Waxed Canvas Field Jacket', ordered: 24, received: 0, cost: 84 },
    { sku: 'HG-APP-1107', name: 'Merino Crew Sweater — Oat', ordered: 36, received: 0, cost: 38 },
    { sku: 'HG-APP-1188', name: 'Selvedge Work Shirt', ordered: 48, received: 0, cost: 29 },
    { sku: 'HG-STA-5061', name: 'Pencil Roll, Waxed Canvas', ordered: 30, received: 0, cost: 14 },
  ],
  'PO-24809': [
    { sku: 'HG-HOM-2290', name: 'Beeswax Taper Candles (pair)', ordered: 120, received: 0, cost: 3.2 },
    { sku: 'HG-HOM-2244', name: 'Linen Table Runner', ordered: 40, received: 0, cost: 11 },
  ],
  'PO-24803': [
    { sku: 'HG-GFT-6012', name: 'Holiday Gift Box — Pantry', ordered: 150, received: 96, cost: 28 },
    { sku: 'HG-PAN-3077', name: 'Smoked Sea Salt Tin', ordered: 72, received: 72, cost: 3.8 },
  ],
  'PO-24797': [{ sku: 'HG-PAN-3077', name: 'Smoked Sea Salt Tin', ordered: 72, received: 0, cost: 3.8 }],
  'PO-24790': [{ sku: 'HG-HDW-4166', name: 'Brass Cabinet Pulls (set of 6)', ordered: 24, received: 24, cost: 19 }],
};

export const ORDERS = PURCHASE_ORDERS;
export type Order = (typeof ORDERS)[number];

export const statusTone = (s: string) => (s === 'Received' ? 'success' : s === 'Partially received' ? 'warning' : s === 'Draft' ? 'neutral' : 'info') as 'success' | 'warning' | 'neutral' | 'info';
