
import { useState } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface InventorySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  stockStatus: string;
  onStockStatusChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
}

export function InventorySearch({ 
  searchTerm, 
  onSearchChange,
  stockStatus,
  onStockStatusChange,
  category,
  onCategoryChange
}: InventorySearchProps) {
  const hasActiveFilters = stockStatus !== '' || category !== '';
  const activeFilterCount = (stockStatus !== '' ? 1 : 0) + (category !== '' ? 1 : 0);
  
  // Stock status options
  const stockStatusOptions = [
    { label: 'All Stock Statuses', value: '' },
    { label: 'In Stock', value: 'in_stock' },
    { label: 'Low Stock', value: 'low_stock' },
    { label: 'Out of Stock', value: 'out_of_stock' }
  ];
  
  // Category options
  const categoryOptions = [
    { label: 'All Categories', value: '' },
    { label: 'Watches', value: 'watches' },
    { label: 'Parts', value: 'parts' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Tools', value: 'tools' }
  ];

  // Function to reset all filters
  const resetFilters = () => {
    onStockStatusChange('');
    onCategoryChange('');
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 gap-1">
            <Filter className="h-4 w-4 mr-1" /> 
            Filter
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 rounded-full text-xs">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter Inventory</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">
            Stock Status
          </DropdownMenuLabel>
          {stockStatusOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value || 'empty-stock'}
              checked={stockStatus === option.value}
              onCheckedChange={() => onStockStatusChange(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">
            Category
          </DropdownMenuLabel>
          {categoryOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value || 'empty-category'}
              checked={category === option.value}
              onCheckedChange={() => onCategoryChange(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground h-8 mt-2"
              onClick={resetFilters}
            >
              <X className="mr-1 h-4 w-4" />
              Reset Filters
            </Button>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
