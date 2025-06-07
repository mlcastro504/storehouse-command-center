
// Tipos para el sistema de notificaciones

export interface Notification {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'alert';
  category: 'system' | 'inventory' | 'orders' | 'quality' | 'security' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  read_at?: string;
  action_url?: string;
  action_text?: string;
  data?: Record<string, any>;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description?: string;
  event_type: string;
  title_template: string;
  message_template: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'alert';
  category: 'system' | 'inventory' | 'orders' | 'quality' | 'security' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: NotificationChannel[];
  conditions?: NotificationCondition[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationChannel {
  type: 'in_app' | 'email' | 'sms' | 'push' | 'webhook';
  enabled: boolean;
  config?: Record<string, any>;
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
}

export interface NotificationRule {
  id: string;
  name: string;
  description?: string;
  rule_type: 'stock_level' | 'expiry_date' | 'overdue_task' | 'system_error' | 'custom';
  conditions: NotificationCondition[];
  template_id: string;
  target_users?: string[];
  target_roles?: string[];
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  last_triggered?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  template?: NotificationTemplate;
}

export interface NotificationLog {
  id: string;
  notification_id?: string;
  rule_id?: string;
  template_id?: string;
  recipient_id: string;
  channel_type: 'in_app' | 'email' | 'sms' | 'push' | 'webhook';
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  error_message?: string;
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
}
