
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { NotificationSettings } from '@/types/messages';

export function useNotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notification settings
  const fetchNotificationSettings = useCallback(async () => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        setNotificationSettings(data as NotificationSettings);
        return data as NotificationSettings;
      } else {
        // Create default settings if none exist
        const { data: newSettings, error: createError } = await supabase
          .from('notification_settings')
          .insert({
            user_id: user.id,
            sale_confirmation: true,
            service_check_in: true,
            service_in_progress: true,
            service_ready: true,
            service_completed: true
          })
          .select()
          .single();
          
        if (createError) throw createError;
        
        setNotificationSettings(newSettings as NotificationSettings);
        return newSettings as NotificationSettings;
      }
    } catch (error: any) {
      console.error('Error fetching notification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification settings',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  // Update notification settings
  const updateNotificationSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    if (!user || !notificationSettings) return false;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('notification_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationSettings.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setNotificationSettings(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: 'Success',
        description: 'Notification settings updated'
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update notification settings',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, notificationSettings]);

  return {
    notificationSettings,
    isLoading,
    fetchNotificationSettings,
    updateNotificationSettings
  };
}
