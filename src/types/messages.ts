
export type EventType = 'sale_completed' | 'service_check_in' | 'service_in_progress' | 'service_ready' | 'service_completed';
export type MessageChannel = 'sms' | 'whatsapp';

export interface MessageTemplate {
  id: string;
  user_id: string;
  name: string;
  type: MessageChannel;
  template_text: string;
  event_type: EventType;
  created_at: string;
  updated_at: string;
}

export interface MessageLog {
  id: string;
  user_id: string;
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

export interface NotificationSettings {
  id: string;
  user_id: string;
  sale_confirmation: boolean;
  service_check_in: boolean;
  service_in_progress: boolean;
  service_ready: boolean;
  service_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SendMessageParams {
  customerId?: string;
  customerPhone: string;
  customerName?: string;
  messageType: MessageChannel;
  templateId?: string;
  templateText?: string;
  variables?: Record<string, string>;
  eventReference?: string;
}
