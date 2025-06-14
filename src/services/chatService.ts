import { connectToDatabase } from '@/lib/mongodb';
import { 
  ChatChannel, 
  ChatMessage, 
  ChatMember, 
  UserChatStatus,
  ChatNotification,
  QuickResponse
} from '@/types/chat';

export class ChatService {
  static async getChannels(userId: string, type?: string): Promise<ChatChannel[]> {
    try {
      const db = await connectToDatabase();
      
      let filter: any = {
        $or: [
          { type: 'public' },
          { 'members.user_id': userId }
        ]
      };

      if (type) {
        filter.type = type;
      }

      const channelsData = await db.collection('chat_channels')
        .find(filter)
        .sort({ updated_at: -1 })
        .toArray();

      // Convert MongoDB documents to ChatChannel interfaces
      const channels: ChatChannel[] = channelsData.map(doc => ({
        id: doc._id?.toString() || doc.id || `channel_${Date.now()}`,
        name: doc.name || '',
        description: doc.description || '',
        type: doc.type || 'public',
        context_type: doc.context_type,
        context_id: doc.context_id,
        created_by: doc.created_by || 'system',
        created_at: doc.created_at || new Date().toISOString(),
        updated_at: doc.updated_at || new Date().toISOString(),
        members: doc.members || [],
        last_message: doc.last_message,
        unread_count: doc.unread_count || 0,
        is_archived: doc.is_archived || false,
        department: doc.department,
        module: doc.module,
        priority: doc.priority,
        auto_archive_after_days: doc.auto_archive_after_days
      }));

      return channels;
    } catch (error) {
      console.error('Error fetching channels:', error);
      throw error;
    }
  }

  static async createChannel(channelData: Partial<ChatChannel>): Promise<string> {
    try {
      const db = await connectToDatabase();
      
      const channel = {
        ...channelData,
        id: new Date().getTime().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_archived: false
      };

      const result = await db.collection('chat_channels').insertOne(channel);
      return result.insertedId.toString();
    } catch (error) {
      console.error('Error creating channel:', error);
      throw error;
    }
  }

  static async getMessages(channelId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    try {
      const db = await connectToDatabase();
      
      const messagesData = await db.collection('chat_messages')
        .find({ channel_id: channelId, deleted_at: null })
        .sort({ sent_at: -1 })
        .limit(limit)
        .toArray();

      // Convert MongoDB documents to ChatMessage interfaces
      const messages: ChatMessage[] = messagesData.map(doc => ({
        id: doc._id?.toString() || doc.id || `msg_${Date.now()}`,
        channel_id: doc.channel_id || '',
        sender_id: doc.sender_id || '',
        message_type: doc.message_type || 'text',
        content: doc.content || '',
        reply_to_id: doc.reply_to_id,
        thread_id: doc.thread_id,
        edited_at: doc.edited_at,
        deleted_at: doc.deleted_at,
        is_pinned: doc.is_pinned || false,
        is_official: doc.is_official || false,
        priority: doc.priority,
        reactions: doc.reactions || [],
        attachments: doc.attachments || [],
        mentions: doc.mentions || [],
        quick_responses: doc.quick_responses || [],
        context_data: doc.context_data,
        voice_duration_seconds: doc.voice_duration_seconds,
        sent_at: doc.sent_at || new Date().toISOString(),
        delivered_at: doc.delivered_at,
        read_by: doc.read_by || [],
        sender: doc.sender,
        reply_to: doc.reply_to,
        auto_generated: doc.auto_generated || false
      }));

      // Populate sender information with proper typing
      for (const message of messages) {
        const senderDoc = await db.collection('users').findOne({ id: message.sender_id });
        if (senderDoc) {
          message.sender = {
            id: senderDoc._id?.toString() || senderDoc.id || '',
            email: senderDoc.email || '',
            firstName: senderDoc.firstName || senderDoc.first_name || '',
            lastName: senderDoc.lastName || senderDoc.last_name || '',
            role: senderDoc.role || { name: 'user', permissions: [] },
            isActive: senderDoc.isActive !== false,
            lastLoginAt: senderDoc.lastLoginAt || senderDoc.last_login_at
          };
        }
      }

      return messages.reverse();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  static async sendMessage(messageData: Partial<ChatMessage>): Promise<string> {
    try {
      const db = await connectToDatabase();
      
      const message = {
        ...messageData,
        id: new Date().getTime().toString(),
        sent_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
        is_pinned: false,
        is_official: false,
        auto_generated: false,
        read_by: []
      };

      const result = await db.collection('chat_messages').insertOne(message);
      
      // Update channel last message
      await db.collection('chat_channels').updateOne(
        { id: messageData.channel_id },
        { 
          $set: { 
            updated_at: new Date().toISOString(),
            last_message: message
          }
        }
      );

      // Process mentions if they exist
      if (message.mentions && message.mentions.length > 0) {
        await this.processMentions(message as ChatMessage);
      }

      return result.insertedId.toString();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async processMentions(message: ChatMessage): Promise<void> {
    try {
      const db = await connectToDatabase();
      
      for (const mention of message.mentions || []) {
        let userIds: string[] = [];
        
        // Check if mention has mention_type property and handle accordingly
        if (mention.mention_type === 'all') {
          // Get all channel members
          const channel = await db.collection('chat_channels').findOne({ id: message.channel_id });
          userIds = channel?.members?.map((m: any) => m.user_id) || [];
        } else if (mention.mention_type === 'role' && mention.role_name) {
          // Role mention
          const users = await db.collection('users').find({ 'role.name': mention.role_name }).toArray();
          userIds = users.map(u => u.id);
        } else if (mention.mention_type === 'user' && mention.user_id) {
          // Individual user mention
          userIds = [mention.user_id];
        }

        // Create notifications
        for (const userId of userIds) {
          if (userId !== message.sender_id) {
            await this.createNotification({
              user_id: userId,
              channel_id: message.channel_id,
              message_id: message.id,
              type: mention.mention_type === 'all' ? 'role_mention' : 'mention',
              read: false,
              delivered: false,
              push_sent: false,
              email_sent: false,
              created_at: new Date().toISOString()
            });
          }
        }
      }
    } catch (error) {
      console.error('Error processing mentions:', error);
    }
  }

  static async createNotification(notification: Partial<ChatNotification>): Promise<void> {
    try {
      const db = await connectToDatabase();
      
      const notificationData = {
        ...notification,
        id: new Date().getTime().toString()
      };

      await db.collection('chat_notifications').insertOne(notificationData);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  static async updateUserStatus(userId: string, status: Partial<UserChatStatus>): Promise<void> {
    try {
      const db = await connectToDatabase();
      
      const statusData = {
        ...status,
        user_id: userId,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await db.collection('user_chat_status').updateOne(
        { user_id: userId },
        { $set: statusData }
      );
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  static async getUserStatus(userId: string): Promise<UserChatStatus | null> {
    try {
      const db = await connectToDatabase();
      
      const statusDoc = await db.collection('user_chat_status').findOne({ user_id: userId });
      
      if (!statusDoc) return null;
      
      // Convert MongoDB document to UserChatStatus interface
      const status: UserChatStatus = {
        id: statusDoc._id?.toString() || statusDoc.id || `status_${Date.now()}`,
        user_id: statusDoc.user_id || '',
        status: statusDoc.status || 'offline',
        custom_message: statusDoc.custom_message,
        last_activity_at: statusDoc.last_activity_at || new Date().toISOString(),
        auto_away_enabled: statusDoc.auto_away_enabled || false,
        do_not_disturb_until: statusDoc.do_not_disturb_until,
        current_location: statusDoc.current_location,
        current_module: statusDoc.current_module,
        device_type: statusDoc.device_type,
        updated_at: statusDoc.updated_at || new Date().toISOString()
      };
      
      return status;
    } catch (error) {
      console.error('Error fetching user status:', error);
      return null;
    }
  }

  static async getQuickResponses(category?: string, role?: string): Promise<QuickResponse[]> {
    try {
      const db = await connectToDatabase();
      
      let filter: any = { is_active: true };
      
      if (category) {
        filter.category = category;
      }
      
      if (role) {
        filter.$or = [
          { role_specific: { $exists: false } },
          { role_specific: { $in: [role] } }
        ];
      }

      const responsesData = await db.collection('quick_responses')
        .find(filter)
        .sort({ category: 1, text: 1 })
        .toArray();

      // Convert MongoDB documents to QuickResponse interfaces
      const responses: QuickResponse[] = responsesData.map(doc => ({
        id: doc._id?.toString() || doc.id || `response_${Date.now()}`,
        text: doc.text || '',
        category: doc.category || '',
        is_active: doc.is_active !== false,
        role_specific: doc.role_specific || [],
        module_specific: doc.module_specific || [],
        created_by: doc.created_by || 'system',
        created_at: doc.created_at || new Date().toISOString()
      }));

      return responses;
    } catch (error) {
      console.error('Error fetching quick responses:', error);
      return [];
    }
  }

  static async searchMessages(query: string, channelId?: string, userId?: string): Promise<ChatMessage[]> {
    try {
      const db = await connectToDatabase();
      
      let filter: any = {
        deleted_at: null,
        content: { $regex: query, $options: 'i' } // Simple text search simulation
      };

      if (channelId) {
        filter.channel_id = channelId;
      }

      if (userId) {
        filter.sender_id = userId;
      }

      const messagesData = await db.collection('chat_messages')
        .find(filter)
        .sort({ sent_at: -1 })
        .toArray();

      // Take only first 50 results and convert to ChatMessage interfaces
      const messages: ChatMessage[] = messagesData.slice(0, 50).map(doc => ({
        id: doc._id?.toString() || doc.id || `msg_${Date.now()}`,
        channel_id: doc.channel_id || '',
        sender_id: doc.sender_id || '',
        message_type: doc.message_type || 'text',
        content: doc.content || '',
        reply_to_id: doc.reply_to_id,
        thread_id: doc.thread_id,
        edited_at: doc.edited_at,
        deleted_at: doc.deleted_at,
        is_pinned: doc.is_pinned || false,
        is_official: doc.is_official || false,
        priority: doc.priority,
        reactions: doc.reactions || [],
        attachments: doc.attachments || [],
        mentions: doc.mentions || [],
        quick_responses: doc.quick_responses || [],
        context_data: doc.context_data,
        voice_duration_seconds: doc.voice_duration_seconds,
        sent_at: doc.sent_at || new Date().toISOString(),
        delivered_at: doc.delivered_at,
        read_by: doc.read_by || [],
        sender: doc.sender,
        reply_to: doc.reply_to,
        auto_generated: doc.auto_generated || false
      }));

      return messages;
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  static async createContextualChat(contextType: string, contextId: string, autoInviteRoles: string[] = []): Promise<string> {
    try {
      const db = await connectToDatabase();
      
      // Check if contextual chat already exists
      const existingChat = await db.collection('chat_channels').findOne({
        type: 'contextual',
        context_type: contextType,
        context_id: contextId
      });

      if (existingChat) {
        return existingChat.id;
      }

      // Create new contextual chat
      const channelData: Partial<ChatChannel> = {
        name: `${contextType} #${contextId}`,
        description: `Chat contextual para ${contextType} ${contextId}`,
        type: 'contextual' as const,
        context_type: contextType as any,
        context_id: contextId,
        created_by: 'system',
        members: []
      };

      // Add users with specified roles
      if (autoInviteRoles.length > 0) {
        const users = await db.collection('users').find({
          'role.name': { $in: autoInviteRoles },
          isActive: true
        }).toArray();

        channelData.members = users.map(user => ({
          id: new Date().getTime().toString(),
          channel_id: '',
          user_id: user.id,
          role: 'member' as const,
          joined_at: new Date().toISOString(),
          notifications_enabled: true,
          can_upload_files: true,
          can_mention_all: false
        }));
      }

      return await this.createChannel(channelData);
    } catch (error) {
      console.error('Error creating contextual chat:', error);
      throw error;
    }
  }

  static async markMessagesAsRead(channelId: string, userId: string, messageIds: string[]): Promise<void> {
    try {
      const db = await connectToDatabase();
      
      for (const messageId of messageIds) {
        // Simulate adding to read_by array
        const message = await db.collection('chat_messages').findOne({ id: messageId });
        if (message) {
          const readBy = message.read_by || [];
          readBy.push({
            user_id: userId,
            read_at: new Date().toISOString()
          });
          
          await db.collection('chat_messages').updateOne(
            { id: messageId },
            { $set: { read_by: readBy } }
          );
        }
      }

      // Update member's last read timestamp
      const channel = await db.collection('chat_channels').findOne({ id: channelId });
      if (channel && channel.members) {
        const updatedMembers = channel.members.map((member: any) => {
          if (member.user_id === userId) {
            return { ...member, last_read_at: new Date().toISOString() };
          }
          return member;
        });
        
        await db.collection('chat_channels').updateOne(
          { id: channelId },
          { $set: { members: updatedMembers } }
        );
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
}
