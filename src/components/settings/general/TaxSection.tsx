
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { GeneralSettingsValues } from "./GeneralSettingsForm";

interface TaxSectionProps {
  form: UseFormReturn<GeneralSettingsValues>;
}

export function TaxSection({ form }: TaxSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="gstNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GST Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter GST Number" {...field} />
            </FormControl>
            <FormDescription>
              Your business GST registration number
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="gstPercentage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GST Percentage</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0" 
                max="100" 
                placeholder="Enter GST %" 
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              Default GST percentage for invoices
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
