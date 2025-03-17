
import { useState } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ServiceSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  serviceType: string;
  setServiceType: (value: string) => void;
}

export function ServiceSearch({ 
  searchTerm, 
  setSearchTerm,
  status,
  setStatus,
  serviceType,
  setServiceType
}: ServiceSearchProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const resetFilters = () => {
    setStatus('');
    setServiceType('');
    setIsFilterOpen(false);
  };

  const hasActiveFilters = status !== '' || serviceType !== '';
  const activeFilterCount = (status !== '' ? 1 : 0) + (serviceType !== '' ? 1 : 0);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search service requests..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
            <SheetTitle>Filter Services</SheetTitle>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(value) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="ready for pickup">Ready for Pickup</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type</label>
              <Select value={serviceType} onValueChange={(value) => setServiceType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="battery_replacement">Battery Replacement</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            
          <SheetFooter>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <X className="mr-1 h-4 w-4" />
              Reset Filters
            </Button>
            <Button size="sm" onClick={() => setIsFilterOpen(false)}>Apply</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
