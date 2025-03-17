
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

export type MessageChannel = 'sms' | 'whatsapp';
export type EventType = 
  | 'sale_completed' 
  | 'service_check_in' 
  | 'service_in_progress' 
  | 'service_ready' 
  | 'service_completed';

export interface MessageTemplate {
  id: string;
  name: string;
  type: MessageChannel;
  template_text: string;
  event_type: EventType;
  created_at: string;
  updated_at: string;
}

export interface MessageLog {
  id: string;
  customer_id?: string;
  template_id?: string;
  channel: MessageChannel;
  recipient: string;
  message_text: string;
  status: 'sent' | 'delivered' | 'failed';
  error_message?: string;
  event_reference?: string;
  sent_at: string;
}

export function useCommunication() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [logs, setLogs] = useState<MessageLog[]>([]);

  // Fetch message templates
  const fetchTemplates = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching templates",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch message logs
  const fetchLogs = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('message_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching message logs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create or update template
  const saveTemplate = async (template: Partial<MessageTemplate> & { name: string; template_text: string; type: MessageChannel; event_type: EventType }) => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      
      const templateData = {
        ...template,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };
      
      if (template.id) {
        // Update existing template
        const { data, error } = await supabase
          .from('message_templates')
          .update(templateData)
          .eq('id', template.id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        
        toast({
          title: "Template updated",
          description: "Message template has been updated successfully",
        });
        
        return data;
      } else {
        // Create new template
        const { data, error } = await supabase
          .from('message_templates')
          .insert({
            ...templateData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        
        toast({
          title: "Template created",
          description: "New message template has been created successfully",
        });
        
        return data;
      }
    } catch (error: any) {
      toast({
        title: "Error saving template",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete template
  const deleteTemplate = async (templateId: string) => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Template deleted",
        description: "Message template has been deleted successfully",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting template",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to customer
  const sendMessage = async ({
    customerId,
    customerPhone,
    customerName,
    messageType,
    templateId,
    templateText,
    variables,
    eventReference
  }: {
    customerId?: string;
    customerPhone: string;
    customerName?: string;
    messageType: MessageChannel;
    templateId?: string;
    templateText?: string;
    variables?: Record<string, string>;
    eventReference?: string;
  }) => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      
      const response = await supabase.functions.invoke('send-message', {
        body: {
          customerId,
          customerPhone,
          customerName,
          messageType,
          templateId,
          templateText,
          variables,
          eventReference
        }
      });
      
      if (response.error) throw new Error(response.error.message);
      
      toast({
        title: "Message sent",
        description: `${messageType.toUpperCase()} message sent successfully`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get notification settings
  const getNotificationSettings = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      
      if (!data) {
        // Create default settings if none exist
        const { data: newSettings, error: insertError } = await supabase
          .from('notification_settings')
          .insert({
            user_id: user.id
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newSettings;
      }
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error fetching notification settings",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (settings: any) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Settings updated",
        description: "Notification settings have been updated successfully",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    isLoading,
    templates,
    logs,
    fetchTemplates,
    fetchLogs,
    saveTemplate,
    deleteTemplate,
    sendMessage,
    getNotificationSettings,
    updateNotificationSettings
  };
}
