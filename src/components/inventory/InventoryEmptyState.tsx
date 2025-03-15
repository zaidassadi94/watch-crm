
import { Package, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryEmptyStateProps {
  searchTerm: string;
  onCreateItem: () => void;
}

export function InventoryEmptyState({ searchTerm, onCreateItem }: InventoryEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="bg-muted/30 rounded-full p-3 mb-3">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">No products found</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {searchTerm 
          ? "Try adjusting your search terms" 
          : "Get started by adding your first product"}
      </p>
      {!searchTerm && (
        <Button size="sm" className="gap-1" onClick={onCreateItem}>
          <PlusCircle className="h-4 w-4" /> Add Product
        </Button>
      )}
    </div>
  );
}
