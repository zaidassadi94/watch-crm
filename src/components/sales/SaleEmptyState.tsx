
import { DollarSign, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SaleEmptyStateProps {
  onCreateSale: () => void;
}

export function SaleEmptyState({ onCreateSale }: SaleEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <DollarSign className="h-10 w-10 text-muted-foreground mb-3" />
      <h3 className="text-lg font-medium">No sales found</h3>
      <p className="text-muted-foreground mb-4">
        You haven't created any sales yet.
      </p>
      <Button size="sm" onClick={onCreateSale}>
        <PlusCircle className="h-4 w-4 mr-2" /> New Sale
      </Button>
    </div>
  );
}
