
import { useState } from 'react';
import { InventoryItem } from '@/types/inventory';

export function useInventoryDialogs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleCreateItem = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    selectedItem,
    handleEditItem,
    handleCreateItem
  };
}
