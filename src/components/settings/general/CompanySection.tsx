
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { GeneralSettingsValues } from "./GeneralSettingsForm";

interface CompanySectionProps {
  form: UseFormReturn<GeneralSettingsValues>;
}

export function CompanySection({ form }: CompanySectionProps) {
  return (
    <FormField
      control={form.control}
      name="companyName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Company Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter your company name" {...field} />
          </FormControl>
          <FormDescription>
            This will be displayed throughout the CRM
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
