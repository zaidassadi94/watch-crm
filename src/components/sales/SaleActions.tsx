
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SaleActionsProps {
  isLoaded: boolean;
  onCreateSale: () => void;
}

export function SaleActions({ isLoaded, onCreateSale }: SaleActionsProps) {
  return (
    <div className={cn(
      "flex flex-col md:flex-row justify-between md:items-center gap-4",
      isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
    )}>
      <div>
        <h1 className="text-2xl font-bold mb-1">Sales</h1>
        <p className="text-muted-foreground">
          Manage sales, quotes, and invoices
        </p>
      </div>
      <Button className="w-full md:w-auto gap-2" onClick={onCreateSale}>
        <PlusCircle className="h-4 w-4" /> New Sale
      </Button>
    </div>
  );
}
