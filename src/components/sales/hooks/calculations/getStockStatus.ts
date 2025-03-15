
/**
 * Determine stock status based on level
 */
export function getStockStatusBasedOnLevel(level: number): string {
  if (level <= 0) return 'out_of_stock';
  if (level <= 5) return 'low_stock';
  return 'in_stock';
}
