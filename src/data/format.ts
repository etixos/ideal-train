export const fmtCurrency = (n: number, digits = 0) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits });
export const fmtCompact = (n: number) => (Math.abs(n) >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : Math.abs(n) >= 1e3 ? `${(n / 1e3).toFixed(n >= 1e5 ? 0 : 1)}K` : `${Math.round(n)}`);
export const fmtMoneyCompact = (n: number) => `${n < 0 ? '−' : ''}$${fmtCompact(Math.abs(n))}`;
export const fmtNum = (n: number, digits = 0) => n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const fmtPct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;
export const fmtSignedPct = (n: number, digits = 1) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n * 100).toFixed(digits)}%`;
/** Accounting format: negatives in parentheses. */
export const fmtAcct = (n: number) => (n < 0 ? `(${fmtNum(Math.abs(n))})` : fmtNum(n));
