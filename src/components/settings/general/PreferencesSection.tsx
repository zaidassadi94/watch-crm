
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { GeneralSettingsValues } from "./GeneralSettingsForm";

interface PreferencesSectionProps {
  form: UseFormReturn<GeneralSettingsValues>;
}

export function PreferencesSection({ form }: PreferencesSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="enableNotifications"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Notifications</FormLabel>
              <FormDescription>
                Enable system notifications
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="enableDarkMode"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Dark Mode</FormLabel>
              <FormDescription>
                Enable dark mode theme
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
