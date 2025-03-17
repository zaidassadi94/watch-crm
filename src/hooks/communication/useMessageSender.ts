
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { SendMessageParams } from '@/types/messages';

export function useMessageSender() {
  const { user } = useAuth();
  const { toast } = useToast();

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
  }, [user, toast]);

  return {
    sendMessage
  };
}
