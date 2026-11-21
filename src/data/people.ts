export interface Employee {
  id: string;
  name: string;
  role: string;
  store: string;
  type: 'Full-time' | 'Part-time' | 'Seasonal';
  hours: number;
  email: string;
}

export const EMPLOYEES: Employee[] = [
  { id: 'E-101', name: 'Dana Whitlock', role: 'Store Manager', store: 'Main Street', type: 'Full-time', hours: 40, email: 'dana.w@hollisgrant.example' },
  { id: 'E-102', name: 'Marcus Bell', role: 'Inventory Lead', store: 'Main Street', type: 'Full-time', hours: 38, email: 'marcus.b@hollisgrant.example' },
  { id: 'E-103', name: 'Priya Natarajan', role: 'Assistant Manager', store: 'Riverside', type: 'Full-time', hours: 40, email: 'priya.n@hollisgrant.example' },
  { id: 'E-104', name: 'Theo Alvarez', role: 'Sales Associate', store: 'Main Street', type: 'Part-time', hours: 24, email: 'theo.a@hollisgrant.example' },
  { id: 'E-105', name: 'June Okafor', role: 'Sales Associate', store: 'Harbor', type: 'Part-time', hours: 20, email: 'june.o@hollisgrant.example' },
  { id: 'E-106', name: 'Samuel Reyes', role: 'Cashier', store: 'Main Street', type: 'Seasonal', hours: 28, email: 'samuel.r@hollisgrant.example' },
  { id: 'E-107', name: 'Hannah Lindqvist', role: 'Visual Merchandiser', store: 'Old Town', type: 'Full-time', hours: 36, email: 'hannah.l@hollisgrant.example' },
  { id: 'E-108', name: 'Oliver Grant', role: 'Stock Associate', store: 'Northgate', type: 'Part-time', hours: 22, email: 'oliver.g@hollisgrant.example' },
];

export type ShiftKind = 'open' | 'mid' | 'close' | 'off' | 'pto';
export interface Shift {
  emp: string;
  day: number;
  start: number;
  end: number;
  kind: ShiftKind;
  station: string;
}

const pattern: [string, number, number, number, ShiftKind, string][] = [
  ['E-101', 0, 8, 16, 'open', 'Floor'], ['E-101', 1, 8, 16, 'open', 'Floor'], ['E-101', 2, 8, 16, 'open', 'Office'], ['E-101', 3, 10, 18, 'mid', 'Floor'], ['E-101', 4, 8, 16, 'open', 'Floor'],
  ['E-102', 0, 7, 15, 'open', 'Stockroom'], ['E-102', 1, 7, 15, 'open', 'Stockroom'], ['E-102', 3, 7, 15, 'open', 'Receiving'], ['E-102', 4, 7, 15, 'open', 'Receiving'], ['E-102', 5, 9, 15, 'mid', 'Stockroom'],
  ['E-103', 2, 12, 20, 'close', 'Floor'], ['E-103', 3, 12, 20, 'close', 'Floor'], ['E-103', 4, 12, 20, 'close', 'Floor'], ['E-103', 5, 10, 18, 'mid', 'Floor'], ['E-103', 6, 10, 18, 'mid', 'Floor'],
  ['E-104', 0, 12, 18, 'mid', 'Register'], ['E-104', 4, 14, 20, 'close', 'Register'], ['E-104', 5, 9, 17, 'open', 'Floor'], ['E-104', 6, 12, 18, 'mid', 'Floor'],
  ['E-105', 1, 14, 20, 'close', 'Floor'], ['E-105', 2, 14, 20, 'close', 'Floor'], ['E-105', 5, 12, 20, 'close', 'Register'],
  ['E-106', 0, 16, 21, 'close', 'Register'], ['E-106', 1, 16, 21, 'close', 'Register'], ['E-106', 3, 16, 21, 'close', 'Register'], ['E-106', 5, 14, 21, 'close', 'Register'], ['E-106', 6, 12, 18, 'mid', 'Register'],
  ['E-107', 0, 9, 17, 'open', 'Displays'], ['E-107', 1, 9, 17, 'open', 'Displays'], ['E-107', 2, 0, 0, 'pto', ''], ['E-107', 3, 0, 0, 'pto', ''], ['E-107', 4, 9, 17, 'open', 'Displays'],
  ['E-108', 2, 7, 13, 'open', 'Stockroom'], ['E-108', 4, 7, 13, 'open', 'Receiving'], ['E-108', 6, 8, 14, 'open', 'Stockroom'],
];

export const SHIFTS: Shift[] = pattern.map(([emp, day, start, end, kind, station]) => ({ emp, day, start, end, kind, station }));
export const WEEK_DAYS = ['Mon 23', 'Tue 24', 'Wed 25', 'Thu 26', 'Fri 27', 'Sat 28', 'Sun 29'];

export const TIME_OFF = [
  { name: 'Hannah Lindqvist', dates: 'Nov 25–26', reason: 'Family', status: 'Approved' },
  { name: 'Theo Alvarez', dates: 'Dec 1', reason: 'Exam', status: 'Pending' },
  { name: 'June Okafor', dates: 'Dec 20–27', reason: 'Vacation', status: 'Pending' },
];
