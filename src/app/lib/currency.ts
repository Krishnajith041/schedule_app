/**
 * Formats a number as Indian Rupees with en-IN grouping.
 * e.g. 125000 → ₹1,25,000
 */
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatINR(amount: number): string {
  return inrFormatter.format(amount);
}
