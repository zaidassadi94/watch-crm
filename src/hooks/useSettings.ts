
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserSettings {
  company_name: string;
  currency: string;
  language: string;
  date_format: string;
  enable_notifications: boolean;
  enable_dark_mode: boolean;
}

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    company_name: 'Watch CRM',
    currency: 'INR',
    language: 'en',
    date_format: 'DD/MM/YYYY',
    enable_notifications: true,
    enable_dark_mode: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching settings:", error);
        }
        
        if (data) {
          setSettings({
            company_name: data.company_name || 'Watch CRM',
            currency: data.currency || 'INR',
            language: data.language || 'en',
            date_format: data.date_format || 'DD/MM/YYYY',
            enable_notifications: data.enable_notifications !== false,
            enable_dark_mode: data.enable_dark_mode || false,
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
    
    // Listen for settings changes
    const handleSettingsUpdate = () => {
      fetchSettings();
    };
    
    window.addEventListener('settings-updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, [user]);

  const getCurrencySymbol = () => {
    switch (settings.currency) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '₹';
    }
  };

  return {
    settings,
    isLoading,
    currencySymbol: getCurrencySymbol(),
  };
}
