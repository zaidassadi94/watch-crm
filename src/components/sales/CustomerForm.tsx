
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CustomerSuggestion } from '@/types/inventory';
import { SaleFormValues } from './saleFormSchema';
import { Search } from 'lucide-react';

interface CustomerFormProps {
  form: UseFormReturn<SaleFormValues>;
  customerSuggestions: CustomerSuggestion[];
  showCustomerSuggestions: boolean;
  setCustomerSearchTerm: (term: string) => void;
  selectCustomer: (customer: CustomerSuggestion) => void;
}

export function CustomerForm({
  form,
  customerSuggestions,
  showCustomerSuggestions,
  setCustomerSearchTerm,
  selectCustomer,
}: CustomerFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Customer Information</h3>
      
      {/* Customer Name with Suggestions */}
      <FormField
        control={form.control}
        name="customer_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer Name *</FormLabel>
            <div className="relative">
              <Popover
                open={showCustomerSuggestions}
                onOpenChange={(open) => {
                  if (open && field.value) {
                    setCustomerSearchTerm(field.value);
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        placeholder="Customer name"
                        {...field}
                        className="pr-8"
                        onChange={(e) => {
                          field.onChange(e);
                          setCustomerSearchTerm(e.target.value);
                        }}
                      />
                      <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[300px]" align="start">
                  {customerSuggestions.length > 0 ? (
                    <div className="max-h-60 overflow-auto">
                      {customerSuggestions.map((customer, index) => (
                        <div
                          key={index}
                          className="flex flex-col px-2 py-1.5 hover:bg-accent cursor-pointer"
                          onClick={() => selectCustomer(customer)}
                        >
                          <div className="font-medium">{customer.name}</div>
                          {customer.email && (
                            <div className="text-xs text-muted-foreground">
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="text-xs text-muted-foreground">
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      {field.value?.length > 0 
                        ? 'No customers found' 
                        : 'Type to search customers'}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Customer Email */}
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

      {/* Customer Phone */}
      <FormField
        control={form.control}
        name="customer_phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input placeholder="+1234567890" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
