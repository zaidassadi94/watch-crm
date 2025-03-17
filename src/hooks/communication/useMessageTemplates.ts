
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { MessageTemplate, EventType, MessageChannel } from '@/types/messages';

export function useMessageTemplates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
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
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
        
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
      
      return data as MessageTemplate;
    } catch (error: any) {
      console.error('Error updating template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update template',
        variant: 'destructive'
      });
      return null;
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
  
  // Save template (handles both create and update)
  const saveTemplate = useCallback(async (
    template: Partial<MessageTemplate> & { name: string; type: MessageChannel; template_text: string; event_type: EventType }
  ) => {
    if (!user) return null;
    
    try {
      if (template.id) {
        // Update existing template
        const { data, error } = await supabase
          .from('message_templates')
          .update({
            name: template.name,
            type: template.type,
            template_text: template.template_text,
            event_type: template.event_type,
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id)
          .eq('user_id', user.id)
          .select()
          .single();
          
        if (error) throw error;
        
        setTemplates(prev => 
          prev.map(t => t.id === template.id ? data as MessageTemplate : t)
        );
        
        toast({
          title: 'Success',
          description: 'Template updated successfully'
        });
        
        return data as MessageTemplate;
      } else {
        // Create new template
        const { data, error } = await supabase
          .from('message_templates')
          .insert({
            name: template.name,
            type: template.type,
            template_text: template.template_text,
            event_type: template.event_type,
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
      }
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, toast]);

  return {
    templates,
    isLoading,
    fetchTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    saveTemplate
  };
}
