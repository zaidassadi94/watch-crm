
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { MessageLog } from '@/types/messages';

export function useMessageLogs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return {
    logs,
    isLoading,
    fetchLogs
  };
}
