
import { useState } from 'react';
import { Search, Filter, Download, ChevronDown, X } from 'lucide-react';
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
  const hasActiveFilters = customerType !== '' || customerStatus !== '';
  const activeFilterCount = (status !== '' ? 1 : 0) + (customerType !== '' ? 1 : 0);
  
  // Type options for dropdown
  const typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Regular', value: 'Regular' },
    { label: 'VIP', value: 'VIP' }
  ];
  
  // Status options for dropdown
  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  // Function to reset all filters
  const resetFilters = () => {
    onCustomerTypeChange('');
    onCustomerStatusChange('');
  };

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
            <DropdownMenuLabel>Filter Customers</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">
              Customer Type
            </DropdownMenuLabel>
            {typeOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value || 'empty-type'}
                checked={customerType === option.value}
                onCheckedChange={() => onCustomerTypeChange(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">
              Status
            </DropdownMenuLabel>
            {statusOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value || 'empty-status'}
                checked={customerStatus === option.value}
                onCheckedChange={() => onCustomerStatusChange(option.value)}
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
        
        <Button variant="outline" size="sm" className="h-10 gap-1">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>
    </div>
  );
}
