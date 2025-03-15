
import React, { useState } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const resetFilters = () => {
    onStatusChange('');
    onPaymentMethodChange('');
  };

  const hasActiveFilters = status !== '' || paymentMethod !== '';
  const activeFilterCount = (status !== '' ? 1 : 0) + (paymentMethod !== '' ? 1 : 0);

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
      
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 gap-1">
            <Filter className="h-4 w-4" /> 
            Filter
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 rounded-full text-xs">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Sales</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Payment Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Payment Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <X className="mr-1 h-4 w-4" />
                Reset Filters
              </Button>
              <Button size="sm" onClick={() => setIsFilterOpen(false)}>Apply</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
