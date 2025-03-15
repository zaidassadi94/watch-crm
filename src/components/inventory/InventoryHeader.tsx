
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InventoryHeaderProps {
  isLoaded: boolean;
  onCreateItem: () => void;
}

export function InventoryHeader({ isLoaded, onCreateItem }: InventoryHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col md:flex-row justify-between md:items-center gap-4",
      isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
    )}>
      <div>
        <h1 className="text-2xl font-bold mb-1">Inventory</h1>
        <p className="text-muted-foreground">
          Manage watch inventory and stock levels
        </p>
      </div>
      <Button className="w-full md:w-auto gap-2" onClick={onCreateItem}>
        <PlusCircle className="h-4 w-4" /> Add Product
      </Button>
    </div>
  );
}
