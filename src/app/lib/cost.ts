/**
 * calcLineCost — the single source of truth for line-item pricing.
 *
 * Rule:
 *  - If defaultQuantity > 1, pricePerUnit is a BUNDLE price for that quantity.
 *    Line cost = pricePerUnit × (selectedQuantity / defaultQuantity)
 *  - If defaultQuantity === 1, it's a true per-unit price.
 *    Line cost = pricePerUnit × selectedQuantity
 */
export function calcLineCost(
  pricePerUnit: number,
  defaultQuantity: number,
  selectedQuantity: number
): number {
  if (defaultQuantity <= 1) {
    return pricePerUnit * selectedQuantity;
  }
  return pricePerUnit * (selectedQuantity / defaultQuantity);
}

/**
 * calcEventTotal — sum of all line costs for an event.
 */
export function calcEventTotal(
  items: { foodItemId: string; quantity: number }[],
  foodItemMap: Map<string, { pricePerUnit: number; defaultQuantity: number }>
): number {
  return items.reduce((sum, item) => {
    const fi = foodItemMap.get(item.foodItemId);
    if (!fi) return sum;
    return sum + calcLineCost(fi.pricePerUnit, fi.defaultQuantity, item.quantity);
  }, 0);
}
