
import { useState } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem 
} from '@/components/ui/dropdown-menu';
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
  const hasActiveFilters = status !== '' || serviceType !== '';
  const activeFilterCount = (status !== '' ? 1 : 0) + (serviceType !== '' ? 1 : 0);
  
  // Status options for the dropdown
  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in progress' },
    { label: 'Ready for Pickup', value: 'ready for pickup' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  // Service type options for the dropdown
  const serviceTypeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Repair', value: 'repair' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Battery Replacement', value: 'battery_replacement' },
    { label: 'Assessment', value: 'assessment' },
    { label: 'Other', value: 'other' }
  ];

  // Function to reset all filters
  const resetFilters = () => {
    setStatus('');
    setServiceType('');
  };

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
          <DropdownMenuLabel>Filter Services</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">
            Status
          </DropdownMenuLabel>
          {statusOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value || 'empty'}
              checked={status === option.value}
              onCheckedChange={() => setStatus(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">
            Service Type
          </DropdownMenuLabel>
          {serviceTypeOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value || 'empty-type'}
              checked={serviceType === option.value}
              onCheckedChange={() => setServiceType(option.value)}
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
