
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GeneralSettingsForm, GeneralSettingsValues } from "./GeneralSettingsForm";

export function GeneralSettingsContainer() {
  const [initialSettings, setInitialSettings] = useState<GeneralSettingsValues>({
    companyName: "Watch CRM",
    currency: "INR",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    enableNotifications: true,
    enableDarkMode: false,
    gstNumber: "",
    gstPercentage: 18,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) {
          if (error.code !== 'PGRST116') { // No rows returned
            console.error("Error fetching settings:", error);
          }
          setIsLoading(false);
          return;
        }
        
        if (data) {
          // Update form with stored settings
          setInitialSettings({
            companyName: data.company_name || "Watch CRM",
            currency: data.currency || "INR",
            language: data.language || "en",
            dateFormat: data.date_format || "DD/MM/YYYY",
            enableNotifications: data.enable_notifications !== false,
            enableDarkMode: data.enable_dark_mode || false,
            gstNumber: data.gst_number || "",
            gstPercentage: data.gst_percentage || 18,
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Configure your CRM appearance and regional preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GeneralSettingsForm initialSettings={initialSettings} />
      </CardContent>
    </Card>
  );
}
