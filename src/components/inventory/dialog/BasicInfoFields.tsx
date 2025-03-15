
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { InventoryFormValues } from './InventoryFormSchema';

interface BasicInfoFieldsProps {
  form: UseFormReturn<InventoryFormValues>;
}

export function BasicInfoFields({ form }: BasicInfoFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter product name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand *</FormLabel>
            <FormControl>
              <Input placeholder="Enter brand name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="sku"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SKU *</FormLabel>
            <FormControl>
              <Input placeholder="Enter product SKU" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="luxury_watches">Luxury Watches</SelectItem>
                <SelectItem value="dive_watches">Dive Watches</SelectItem>
                <SelectItem value="chronographs">Chronographs</SelectItem>
                <SelectItem value="dress_watches">Dress Watches</SelectItem>
                <SelectItem value="pilot_watches">Pilot Watches</SelectItem>
                <SelectItem value="smart_watches">Smart Watches</SelectItem>
                <SelectItem value="sports_watches">Sports Watches</SelectItem>
                <SelectItem value="vintage_watches">Vintage Watches</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
