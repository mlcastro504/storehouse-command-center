
// Advanced Chat Module Types for WarehouseOS

import { User } from './warehouse';

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct' | 'department' | 'contextual';
  context_type?: 'order' | 'task' | 'pallet' | 'incident' | 'general';
  context_id?: string; // ID of the related entity (order, task, etc.)
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: ChatMember[];
  last_message?: ChatMessage;
  unread_count?: number;
  is_archived: boolean;
  department?: string;
  module?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  auto_archive_after_days?: number;
}

export interface ChatMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  last_read_at?: string;
  last_seen_at?: string;
  notifications_enabled: boolean;
  can_upload_files: boolean;
  can_mention_all: boolean;
  user?: User;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'file' | 'system' | 'voice' | 'quick_response';
  content: string;
  reply_to_id?: string;
  thread_id?: string;
  edited_at?: string;
  deleted_at?: string;
  is_pinned: boolean;
  is_official: boolean; // Messages marked as official by supervisors
  priority?: 'normal' | 'important' | 'urgent';
  reactions?: ChatReaction[];
  attachments?: ChatAttachment[];
  mentions?: ChatMention[];
  quick_responses?: string[];
  context_data?: any; // Additional data for contextual messages
  voice_duration_seconds?: number;
  sent_at: string;
  delivered_at?: string;
  read_by?: ChatReadReceipt[];
  sender?: User;
  reply_to?: ChatMessage;
  auto_generated: boolean; // For system-generated messages
}

export interface ChatMention {
  id: string;
  message_id: string;
  user_id?: string;
  role_name?: string; // For @role mentions
  mention_type: 'user' | 'role' | 'all';
  created_at: string;
  user?: User;
}

export interface ChatReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: User;
}

export interface ChatAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  thumbnail_url?: string;
  is_scanned_document: boolean;
  scan_context?: string; // Context when scanned from mobile/scanner
  uploaded_at: string;
  virus_scan_status: 'pending' | 'clean' | 'infected' | 'failed';
}

export interface ChatReadReceipt {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
  user?: User;
}

export interface ChatNotification {
  id: string;
  user_id: string;
  channel_id: string;
  message_id: string;
  type: 'mention' | 'direct_message' | 'channel_message' | 'role_mention' | 'urgent_message';
  read: boolean;
  delivered: boolean;
  push_sent: boolean;
  email_sent: boolean;
  created_at: string;
}

export interface UserChatStatus {
  id: string;
  user_id: string;
  status: 'online' | 'busy' | 'break' | 'away' | 'offline';
  custom_message?: string;
  last_activity_at: string;
  auto_away_enabled: boolean;
  do_not_disturb_until?: string;
  current_location?: string; // Current warehouse location
  current_module?: string; // Current module being used
  device_type: 'desktop' | 'mobile' | 'scanner' | 'tablet';
  updated_at: string;
}

export interface ChatPermission {
  id: string;
  role_id: string;
  can_create_channels: boolean;
  can_delete_messages: boolean;
  can_edit_messages: boolean;
  can_pin_messages: boolean;
  can_mark_official: boolean;
  can_upload_files: boolean;
  max_file_size_mb: number;
  can_mention_all: boolean;
  can_create_contextual_chats: boolean;
  can_moderate_channels: boolean;
  can_access_audit_logs: boolean;
  can_initiate_global_chats: boolean;
  can_override_permissions: boolean;
  max_channels_per_user: number;
}

export interface QuickResponse {
  id: string;
  text: string;
  category: 'general' | 'picking' | 'putaway' | 'loading' | 'maintenance' | 'emergency';
  is_active: boolean;
  role_specific?: string[];
  module_specific?: string[];
  created_by: string;
  created_at: string;
}

export interface ChatAuditLog {
  id: string;
  action_type: 'message_sent' | 'message_deleted' | 'message_edited' | 'channel_created' | 'user_joined' | 'user_left' | 'permission_changed' | 'file_uploaded';
  performed_by: string;
  target_user_id?: string;
  channel_id?: string;
  message_id?: string;
  details: any;
  ip_address?: string;
  device_info?: string;
  timestamp: string;
}

export interface ChatIntegration {
  id: string;
  module_name: string;
  webhook_url?: string;
  auto_create_channels: boolean;
  auto_notify_roles: string[];
  message_template?: string;
  is_active: boolean;
  created_at: string;
}

export interface ContextualChatTrigger {
  id: string;
  trigger_type: 'task_assigned' | 'order_created' | 'error_occurred' | 'status_changed' | 'deadline_approaching';
  module: string;
  condition: any; // JSON condition for when to trigger
  auto_create_channel: boolean;
  auto_invite_roles: string[];
  message_template: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

// Enhanced filter and search types
export interface ChatSearchFilter {
  query?: string;
  channel_ids?: string[];
  user_ids?: string[];
  date_from?: string;
  date_to?: string;
  message_types?: string[];
  has_attachments?: boolean;
  is_pinned?: boolean;
  is_official?: boolean;
  context_type?: string;
  context_id?: string;
  mentions_me?: boolean;
  priority?: string[];
}

export interface ChatAnalytics {
  total_messages_today: number;
  total_active_users: number;
  total_channels: number;
  urgent_messages_count: number;
  response_time_avg_minutes: number;
  most_active_channels: Array<{
    channel_id: string;
    channel_name: string;
    message_count: number;
  }>;
  most_active_users: Array<{
    user_id: string;
    user_name: string;
    message_count: number;
  }>;
  module_activity: Array<{
    module: string;
    message_count: number;
    active_users: number;
  }>;
}

// Mobile and scanner specific types
export interface MobileChatAction {
  id: string;
  action_type: 'scan_and_report' | 'voice_message' | 'quick_photo' | 'location_share' | 'emergency_alert';
  label: string;
  icon: string;
  available_for_roles: string[];
  available_in_modules: string[];
  is_active: boolean;
}

export interface VoiceMessage {
  id: string;
  message_id: string;
  audio_url: string;
  duration_seconds: number;
  transcription?: string;
  transcription_confidence?: number;
  uploaded_at: string;
}

export interface ChatTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  is_default: boolean;
  is_active: boolean;
}
