
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserSettings } from '@/types/inventory';
import { format } from 'date-fns';

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    user_id: '',
    company_name: 'Watch CRM',
    currency: 'INR',
    language: 'en',
    date_format: 'DD/MM/YYYY',
    enable_notifications: true,
    enable_dark_mode: false,
    gst_number: '',
    gst_percentage: 18,
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
            ...data,
            company_name: data.company_name || 'Watch CRM',
            currency: data.currency || 'INR',
            language: data.language || 'en',
            date_format: data.date_format || 'DD/MM/YYYY',
            enable_notifications: data.enable_notifications !== false,
            enable_dark_mode: data.enable_dark_mode || false,
            gst_number: data.gst_number || '',
            gst_percentage: data.gst_percentage || 18,
          });
        } else {
          // Set default settings if none found
          setSettings({
            user_id: user.id,
            company_name: 'Watch CRM',
            currency: 'INR',
            language: 'en',
            date_format: 'DD/MM/YYYY',
            enable_notifications: true,
            enable_dark_mode: false,
            gst_number: '',
            gst_percentage: 18,
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      switch (settings.date_format) {
        case 'DD/MM/YYYY':
          return format(date, 'dd/MM/yyyy');
        case 'MM/DD/YYYY':
          return format(date, 'MM/dd/yyyy');
        case 'YYYY-MM-DD':
          return format(date, 'yyyy-MM-dd');
        default:
          return format(date, 'dd/MM/yyyy');
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  return {
    settings,
    isLoading,
    currencySymbol: getCurrencySymbol(),
    formatDate,
  };
}
