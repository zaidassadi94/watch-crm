
import React from 'react';
import { Search, Filter } from 'lucide-react';
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

interface SaleSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
}

export function SaleSearch({ 
  searchTerm, 
  onSearchChange,
  status,
  onStatusChange,
  paymentMethod,
  onPaymentMethodChange
}: SaleSearchProps) {
  const hasActiveFilters = status !== '' || paymentMethod !== '';
  const activeFilterCount = (status !== '' ? 1 : 0) + (paymentMethod !== '' ? 1 : 0);

  // Status options for the dropdown
  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Quote', value: 'quote' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  // Payment method options for the dropdown
  const paymentOptions = [
    { label: 'All Payment Methods', value: '' },
    { label: 'Cash', value: 'cash' },
    { label: 'Card', value: 'card' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Other', value: 'other' }
  ];

  // Function to reset all filters
  const resetFilters = () => {
    onStatusChange('');
    onPaymentMethodChange('');
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sales..."
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
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter Sales</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">
            Status
          </DropdownMenuLabel>
          {statusOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={status === option.value}
              onCheckedChange={() => onStatusChange(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">
            Payment Method
          </DropdownMenuLabel>
          {paymentOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={paymentMethod === option.value}
              onCheckedChange={() => onPaymentMethodChange(option.value)}
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
              Reset Filters
            </Button>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
