
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMessageTemplates } from './communication/useMessageTemplates';
import { useMessageLogs } from './communication/useMessageLogs';
import { useNotificationSettings } from './communication/useNotificationSettings';
import { useMessageSender } from './communication/useMessageSender';
import { 
  MessageTemplate, 
  MessageLog, 
  NotificationSettings,
  SendMessageParams,
  EventType,
  MessageChannel
} from '@/types/messages';

// Re-export the types for backward compatibility
export type { MessageTemplate, MessageLog, NotificationSettings, EventType, MessageChannel };

export function useCommunication() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Use the individual hooks
  const messageTemplates = useMessageTemplates();
  const messageLogs = useMessageLogs();
  const notificationSettingsHook = useNotificationSettings();
  const messageSender = useMessageSender();
  
  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          await Promise.all([
            messageTemplates.fetchTemplates(),
            messageLogs.fetchLogs(),
            notificationSettingsHook.fetchNotificationSettings()
          ]);
        } catch (error) {
          console.error('Error initializing communication data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    initializeData();
  }, [user]);
  
  // Combine all functionality into a single hook interface for backward compatibility
  return {
    // Templates
    templates: messageTemplates.templates,
    fetchTemplates: messageTemplates.fetchTemplates,
    addTemplate: messageTemplates.addTemplate,
    updateTemplate: messageTemplates.updateTemplate,
    deleteTemplate: messageTemplates.deleteTemplate,
    saveTemplate: messageTemplates.saveTemplate,
    
    // Logs
    logs: messageLogs.logs,
    fetchLogs: messageLogs.fetchLogs,
    
    // Notification settings
    notificationSettings: notificationSettingsHook.notificationSettings,
    fetchNotificationSettings: notificationSettingsHook.fetchNotificationSettings,
    updateNotificationSettings: notificationSettingsHook.updateNotificationSettings,
    
    // Message sending
    sendMessage: messageSender.sendMessage,
    
    // General
    isLoading: isLoading || 
               messageTemplates.isLoading || 
               messageLogs.isLoading || 
               notificationSettingsHook.isLoading
  };
}
