
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

interface CustomerSearchToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  customerType: string;
  onCustomerTypeChange: (type: string) => void;
  customerStatus: string;
  onCustomerStatusChange: (status: string) => void;
}

export function CustomerSearchToolbar({ 
  searchTerm, 
  onSearchChange, 
  customerType,
  onCustomerTypeChange,
  customerStatus,
  onCustomerStatusChange 
}: CustomerSearchToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const resetFilters = () => {
    onCustomerTypeChange('');
    onCustomerStatusChange('');
  };

  const hasActiveFilters = customerType !== '' || customerStatus !== '';

  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <div className="relative w-full md:w-80">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search customers..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
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
                  {(customerType !== '' ? 1 : 0) + (customerStatus !== '' ? 1 : 0)}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Customers</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Type</label>
                <Select value={customerType} onValueChange={onCustomerTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={customerStatus} onValueChange={onCustomerStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
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
