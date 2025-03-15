
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { GeneralSettingsValues } from "./GeneralSettingsForm";

interface DateFormatSectionProps {
  form: UseFormReturn<GeneralSettingsValues>;
}

export function DateFormatSection({ form }: DateFormatSectionProps) {
  return (
    <FormField
      control={form.control}
      name="dateFormat"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Date Format</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            How dates will be displayed throughout the application
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
