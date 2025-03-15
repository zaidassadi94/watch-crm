
import React from 'react';
import { SaleItemInternal, calculateTotal } from '../saleFormSchema';
import { useSettings } from '@/hooks/useSettings';

interface SaleItemSummaryProps {
  items: SaleItemInternal[];
}

export function SaleItemSummary({ items }: SaleItemSummaryProps) {
  const { currencySymbol } = useSettings();
  const total = calculateTotal(items);
  
  return (
    <div className="flex justify-end mt-4">
      <div className="text-right">
        <span className="text-sm font-medium">Total: </span>
        <span className="text-lg font-bold">{currencySymbol}{total.totalPrice.toFixed(2)}</span>
        <div className="text-sm text-muted-foreground">
          Profit: {currencySymbol}{total.totalProfit.toFixed(2)} ({total.marginPercentage.toFixed(2)}%)
        </div>
      </div>
    </div>
  );
}
