
import React from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CustomerSuggestion } from '@/types/inventory';
import { UseFormReturn } from 'react-hook-form';
import { ServiceFormValues } from './serviceFormSchema';

interface CustomerSuggestionsProps {
  form: UseFormReturn<ServiceFormValues>;
  customerSuggestions: CustomerSuggestion[];
  showCustomerSuggestions: boolean;
  setShowCustomerSuggestions: (show: boolean) => void;
  setSearchTerm: (term: string) => void;
  selectCustomer: (customer: CustomerSuggestion) => void;
}

export function CustomerSuggestions({
  form,
  customerSuggestions,
  showCustomerSuggestions,
  setShowCustomerSuggestions,
  setSearchTerm,
  selectCustomer
}: CustomerSuggestionsProps) {
  return (
    <FormItem className="relative">
      <FormLabel>Phone</FormLabel>
      <Popover 
        open={showCustomerSuggestions} 
        onOpenChange={setShowCustomerSuggestions}
      >
        <PopoverTrigger asChild>
          <FormControl>
            <div className="relative">
              <Input 
                placeholder="(123) 456-7890" 
                {...form.register('customer_phone')} 
                onChange={(e) => {
                  form.register('customer_phone').onChange(e);
                  setSearchTerm(e.target.value);
                }}
              />
              {customerSuggestions.length > 0 && (
                <ChevronsUpDown className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-72 overflow-auto">
            {customerSuggestions.map((customer, index) => (
              <div
                key={index}
                className="flex flex-col px-2 py-1.5 hover:bg-accent cursor-pointer"
                onClick={() => selectCustomer(customer)}
              >
                <div className="font-medium">{customer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {customer.phone}
                  {customer.email ? ` • ${customer.email}` : ''}
                </div>
                {customer.watches && customer.watches.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Previous watch: {customer.watches[0].brand} 
                    {customer.watches[0].model ? ` ${customer.watches[0].model}` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
