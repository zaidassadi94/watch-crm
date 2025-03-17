
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CustomerSuggestions } from './CustomerSuggestions';
import { UseFormReturn } from 'react-hook-form';
import { ServiceFormValues } from './serviceFormSchema';
import { CustomerSuggestion } from '@/types/inventory';

interface CustomerInfoSectionProps {
  form: UseFormReturn<ServiceFormValues>;
  customerSuggestions: CustomerSuggestion[];
  showCustomerSuggestions: boolean;
  setShowCustomerSuggestions: (show: boolean) => void;
  searchTerm: string; // Add this prop to fix the type error
  setSearchTerm: (term: string) => void;
  selectCustomer: (customer: CustomerSuggestion) => void;
}

export function CustomerInfoSection({
  form,
  customerSuggestions,
  showCustomerSuggestions,
  setShowCustomerSuggestions,
  searchTerm,
  setSearchTerm,
  selectCustomer
}: CustomerInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Customer Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="customer_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter customer name" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    setSearchTerm(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="customer_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="customer@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="customer_phone"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(123) 456-7890" 
                  {...field} 
                />
              </FormControl>
              {showCustomerSuggestions && customerSuggestions.length > 0 && (
                <div className="absolute z-50 bg-popover border rounded-md w-full mt-1 shadow-md">
                  <div className="max-h-60 overflow-auto py-1">
                    {customerSuggestions.map((customer, idx) => (
                      <div
                        key={idx}
                        className="px-2 py-1.5 hover:bg-accent cursor-pointer"
                        onClick={() => selectCustomer(customer)}
                      >
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {customer.phone} {customer.email ? `• ${customer.email}` : ''}
                          {customer.watches && customer.watches.length > 0 && (
                            <div className="mt-1">
                              <span className="font-medium text-xs">Watch: </span>
                              {customer.watches[0].brand} 
                              {customer.watches[0].model && ` - ${customer.watches[0].model}`}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
