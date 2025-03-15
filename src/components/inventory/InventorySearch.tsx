
import { useState } from 'react';
import { Search, Filter, Download, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface InventorySearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  stockStatus: string;
  setStockStatus: (value: string) => void;
}

export function InventorySearch({ 
  searchTerm, 
  setSearchTerm,
  category,
  setCategory,
  stockStatus,
  setStockStatus
}: InventorySearchProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const resetFilters = () => {
    setCategory('');
    setStockStatus('');
  };

  const hasActiveFilters = category !== '' || stockStatus !== '';

  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <div className="relative w-full md:w-80">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search inventory..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 gap-1">
              <Filter className="h-4 w-4" /> 
              Filter
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 rounded-full text-xs">
                  {(category !== '' ? 1 : 0) + (stockStatus !== '' ? 1 : 0)}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Inventory</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="watches">Watches</SelectItem>
                    <SelectItem value="parts">Parts</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Status</label>
                <Select value={stockStatus} onValueChange={setStockStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <X className="mr-1 h-4 w-4" />
                  Reset Filters
                </Button>
                <Button size="sm" onClick={() => setIsFilterOpen(false)}>Apply</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button variant="outline" size="sm" className="h-10 gap-1">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>
    </div>
  );
}
