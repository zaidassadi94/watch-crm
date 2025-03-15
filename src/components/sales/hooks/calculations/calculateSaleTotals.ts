
import { SaleItemInternal } from '../../saleFormSchema';

/**
 * Calculate totals for a set of sale items
 */
export function calculateSaleTotals(items: SaleItemInternal[]) {
  const totalPrice = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalCost = items.reduce((sum, item) => sum + (item.quantity * (item.cost_price || 0)), 0);
  const totalProfit = totalPrice - totalCost;
  const marginPercentage = totalPrice > 0 ? (totalProfit / totalPrice) * 100 : 0;
  
  return {
    totalPrice,
    totalCost,
    totalProfit,
    marginPercentage
  };
}
