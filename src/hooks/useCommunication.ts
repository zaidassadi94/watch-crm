
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { 
  MessageTemplate, 
  MessageLog, 
  NotificationSettings,
  SendMessageParams
} from '@/types/messages';

export function useCommunication() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all message templates
  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setTemplates(data as MessageTemplate[]);
    } catch (error: any) {
      console.error('Error fetching message templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load message templates',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  // Fetch message logs
  const fetchLogs = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('message_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false });
        
      if (error) throw error;
      
      setLogs(data as MessageLog[]);
    } catch (error: any) {
      console.error('Error fetching message logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load message logs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  // Add a new template
  const addTemplate = useCallback(async (template: Omit<MessageTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          ...template,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setTemplates(prev => [...prev, data as MessageTemplate]);
      toast({
        title: 'Success',
        description: 'Template created successfully'
      });
      
      return data as MessageTemplate;
    } catch (error: any) {
      console.error('Error adding template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create template',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, toast]);
  
  // Update an existing template
  const updateTemplate = useCallback(async (
    id: string, 
    updates: Partial<Omit<MessageTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('message_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setTemplates(prev => 
        prev.map(template => 
          template.id === id 
            ? { ...template, ...updates, updated_at: new Date().toISOString() } 
            : template
        )
      );
      
      toast({
        title: 'Success',
        description: 'Template updated successfully'
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update template',
        variant: 'destructive'
      });
      return false;
    }
  }, [user, toast]);
  
  // Delete a template
  const deleteTemplate = useCallback(async (id: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setTemplates(prev => prev.filter(template => template.id !== id));
      
      toast({
        title: 'Success',
        description: 'Template deleted successfully'
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete template',
        variant: 'destructive'
      });
      return false;
    }
  }, [user, toast]);
  
  // Send a message
  const sendMessage = useCallback(async (params: SendMessageParams) => {
    if (!user) return false;
    
    try {
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('send-message', {
        body: {
          ...params,
          userToken: await supabase.auth.getSession()
        }
      });
      
      if (error) throw error;
      
      // Refresh logs after sending a message
      fetchLogs();
      
      toast({
        title: 'Message sent',
        description: `Message was sent to ${params.customerPhone} via ${params.messageType}`
      });
      
      return true;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      });
      return false;
    }
  }, [user, toast, fetchLogs]);
  
  // Fetch notification settings
  const fetchNotificationSettings = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        setNotificationSettings(data as NotificationSettings);
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
      }
    } catch (error: any) {
      console.error('Error fetching notification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification settings',
        variant: 'destructive'
      });
    }
  }, [user, toast]);
  
  // Update notification settings
  const updateNotificationSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    if (!user || !notificationSettings) return false;
    
    try {
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
    }
  }, [user, toast, notificationSettings]);
  
  // Initialize data on mount
  useEffect(() => {
    if (user) {
      fetchTemplates();
      fetchLogs();
      fetchNotificationSettings();
    }
  }, [user, fetchTemplates, fetchLogs, fetchNotificationSettings]);
  
  return {
    templates,
    logs,
    notificationSettings,
    isLoading,
    fetchTemplates,
    fetchLogs,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    sendMessage,
    fetchNotificationSettings,
    updateNotificationSettings
  };
}
