

export interface UserSettings {
  id: string;
  user_id: string;
  company_name: string;
  language: string;
  timezone: string;
  currency: string;
  date_format: string;
  dark_mode: boolean;
  compact_view: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSecuritySettings {
  id: string;
  user_id: string;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  session_timeout: boolean;
  email_notifications: boolean;
  login_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserNotificationSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  email_frequency: string;
  email_order_updates: boolean;
  email_stock_alerts: boolean;
  email_system_updates: boolean;
  email_security_alerts: boolean;
  in_app_enabled: boolean;
  in_app_sound: boolean;
  in_app_order_updates: boolean;
  in_app_stock_alerts: boolean;
  in_app_task_assignments: boolean;
  in_app_system_messages: boolean;
  sms_enabled: boolean;
  sms_critical_only: boolean;
  sms_emergency_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  id: string;
  user_id: string;
  maintenance_mode: boolean;
  debug_mode: boolean;
  log_level: string;
  session_timeout_minutes: number;
  backup_frequency: string;
  cache_enabled: boolean;
  api_rate_limit: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

