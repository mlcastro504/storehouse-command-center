
// Tipos para el módulo de chat interno

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: ChatMember[];
  last_message?: ChatMessage;
  unread_count?: number;
}

export interface ChatMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_at?: string;
  notifications_enabled: boolean;
  user?: User;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  content: string;
  reply_to_id?: string;
  edited_at?: string;
  deleted_at?: string;
  reactions?: ChatReaction[];
  attachments?: ChatAttachment[];
  mentions?: string[];
  sent_at: string;
  sender?: User;
  reply_to?: ChatMessage;
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
  uploaded_at: string;
}

export interface ChatNotification {
  id: string;
  user_id: string;
  channel_id: string;
  message_id: string;
  type: 'mention' | 'direct_message' | 'channel_message';
  read: boolean;
  created_at: string;
}
