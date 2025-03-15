
/**
 * Determine stock status based on current stock level
 */
export function getStockStatusBasedOnLevel(stockLevel: number): string {
  if (stockLevel <= 0) {
    return 'out_of_stock';
  } else if (stockLevel <= 5) {
    return 'low_stock';
  } else {
    return 'in_stock';
  }
}
