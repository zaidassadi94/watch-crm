
import React from 'react';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CompanySection } from "./CompanySection";
import { RegionalSection } from "./RegionalSection";
import { DateFormatSection } from "./DateFormatSection";
import { PreferencesSection } from "./PreferencesSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const generalSettingsSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  currency: z.string({
    required_error: "Please select a currency.",
  }),
  language: z.string({
    required_error: "Please select a language.",
  }),
  dateFormat: z.string({
    required_error: "Please select a date format.",
  }),
  enableNotifications: z.boolean().default(true),
  enableDarkMode: z.boolean().default(false),
});

export type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

interface GeneralSettingsFormProps {
  initialSettings: GeneralSettingsValues;
}

export function GeneralSettingsForm({ initialSettings }: GeneralSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: initialSettings,
  });

  async function onSubmit(data: GeneralSettingsValues) {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save settings",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if settings already exist for this user
      const { data: existingSettings, error: fetchError } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      let saveError;
      
      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('user_settings')
          .update({
            company_name: data.companyName,
            currency: data.currency,
            language: data.language,
            date_format: data.dateFormat,
            enable_notifications: data.enableNotifications,
            enable_dark_mode: data.enableDarkMode,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
          
        saveError = error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            company_name: data.companyName,
            currency: data.currency,
            language: data.language,
            date_format: data.dateFormat,
            enable_notifications: data.enableNotifications,
            enable_dark_mode: data.enableDarkMode,
          });
          
        saveError = error;
      }
      
      if (saveError) throw saveError;
      
      // Dispatch a custom event to notify other components about settings change
      window.dispatchEvent(new CustomEvent('settings-updated', { 
        detail: {
          company_name: data.companyName,
          currency: data.currency,
          language: data.language,
          date_format: data.dateFormat,
          enable_notifications: data.enableNotifications,
          enable_dark_mode: data.enableDarkMode,
        }
      }));
      
      toast({
        title: "Settings saved",
        description: "Your general settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CompanySection form={form} />
        <RegionalSection form={form} />
        <DateFormatSection form={form} />
        <PreferencesSection form={form} />
        
        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
