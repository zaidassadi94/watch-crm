
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ServiceFormValues } from './serviceFormSchema';

interface WatchDetailsSectionProps {
  form: UseFormReturn<ServiceFormValues>;
}

export function WatchDetailsSection({ form }: WatchDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Watch Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="watch_brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Rolex, Omega, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="watch_model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Submariner, Speedmaster, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="serial_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial Number</FormLabel>
              <FormControl>
                <Input placeholder="Watch serial number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
