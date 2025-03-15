
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/ui-custom/DataTable';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useInventoryDialogs } from '@/hooks/useInventoryDialogs';
import { InventoryDialog } from '@/components/inventory/InventoryDialog';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventorySearch } from '@/components/inventory/InventorySearch';
import { InventoryEmptyState } from '@/components/inventory/InventoryEmptyState';
import { getInventoryTableColumns } from '@/components/inventory/InventoryTableColumns';
import { useSettings } from '@/hooks/useSettings';

export function InventoryContent() {
  const { inventory, isLoading, isLoaded, fetchInventory, handleDelete } = useInventoryData();
  const [searchTerm, setSearchTerm] = useState('');
  const { currencySymbol } = useSettings();
  
  const {
    isDialogOpen,
    setIsDialogOpen,
    selectedItem,
    handleEditItem,
    handleCreateItem
  } = useInventoryDialogs();

  const columns = getInventoryTableColumns({
    onEdit: handleEditItem,
    onDelete: handleDelete,
    currencySymbol
  });

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className={cn(
        "space-y-6 transition-all duration-300",
        isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
      )}
    >
      <InventoryHeader 
        isLoaded={isLoaded}
        onCreateItem={handleCreateItem}
      />

      <Card>
        <CardContent className="p-6">
          <InventorySearch 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          <DataTable 
            columns={columns} 
            data={filteredItems}
            isLoading={isLoading}
            emptyState={
              <InventoryEmptyState
                searchTerm={searchTerm}
                onCreateItem={handleCreateItem}
              />
            }
          />
        </CardContent>
      </Card>

      <InventoryDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        item={selectedItem}
        onSaved={fetchInventory}
      />
    </div>
  );
}
