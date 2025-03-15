
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
  setSearchTerm: (term: string) => void;
  selectCustomer: (customer: CustomerSuggestion) => void;
}

export function CustomerInfoSection({
  form,
  customerSuggestions,
  showCustomerSuggestions,
  setShowCustomerSuggestions,
  setSearchTerm,
  selectCustomer
}: CustomerInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Customer Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="customer_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter customer name" {...field} />
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
          render={() => (
            <CustomerSuggestions 
              form={form}
              customerSuggestions={customerSuggestions}
              showCustomerSuggestions={showCustomerSuggestions}
              setShowCustomerSuggestions={setShowCustomerSuggestions}
              setSearchTerm={setSearchTerm}
              selectCustomer={selectCustomer}
            />
          )}
        />
      </div>
    </div>
  );
}
