
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

      const channels = await db.collection('chat_channels')
        .find(filter)
        .sort({ updated_at: -1 })
        .toArray();

      return channels as ChatChannel[];
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
      
      const messages = await db.collection('chat_messages')
        .find({ channel_id: channelId, deleted_at: null })
        .sort({ sent_at: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      // Populate sender information
      for (const message of messages) {
        const sender = await db.collection('users').findOne({ id: message.sender_id });
        if (sender) {
          message.sender = sender;
        }
      }

      return messages.reverse() as ChatMessage[];
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

      // Process mentions and create notifications
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
        
        if (mention.startsWith('@')) {
          const mentionTarget = mention.substring(1);
          
          if (mentionTarget === 'all' || mentionTarget === 'todos') {
            // Get all channel members
            const channel = await db.collection('chat_channels').findOne({ id: message.channel_id });
            userIds = channel?.members?.map((m: any) => m.user_id) || [];
          } else {
            // Check if it's a role mention
            const role = await db.collection('roles').findOne({ name: mentionTarget });
            if (role) {
              const users = await db.collection('users').find({ 'role.name': mentionTarget }).toArray();
              userIds = users.map(u => u.id);
            } else {
              // Individual user mention
              const user = await db.collection('users').findOne({ 
                $or: [
                  { firstName: { $regex: mentionTarget, $options: 'i' } },
                  { lastName: { $regex: mentionTarget, $options: 'i' } },
                  { email: { $regex: mentionTarget, $options: 'i' } }
                ]
              });
              if (user) {
                userIds = [user.id];
              }
            }
          }
        }

        // Create notifications
        for (const userId of userIds) {
          if (userId !== message.sender_id) {
            await this.createNotification({
              user_id: userId,
              channel_id: message.channel_id,
              message_id: message.id,
              type: mention.includes('@all') ? 'role_mention' : 'mention',
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
        { $set: statusData },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  static async getUserStatus(userId: string): Promise<UserChatStatus | null> {
    try {
      const db = await connectToDatabase();
      
      const status = await db.collection('user_chat_status').findOne({ user_id: userId });
      return status as UserChatStatus;
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

      const responses = await db.collection('quick_responses')
        .find(filter)
        .sort({ category: 1, text: 1 })
        .toArray();

      return responses as QuickResponse[];
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
        $text: { $search: query }
      };

      if (channelId) {
        filter.channel_id = channelId;
      }

      if (userId) {
        filter.sender_id = userId;
      }

      const messages = await db.collection('chat_messages')
        .find(filter)
        .sort({ sent_at: -1 })
        .limit(50)
        .toArray();

      return messages as ChatMessage[];
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
      const channelData = {
        name: `${contextType} #${contextId}`,
        description: `Chat contextual para ${contextType} ${contextId}`,
        type: 'contextual',
        context_type: contextType,
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
          role: 'member',
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
        await db.collection('chat_messages').updateOne(
          { id: messageId },
          {
            $addToSet: {
              read_by: {
                user_id: userId,
                read_at: new Date().toISOString()
              }
            }
          }
        );
      }

      // Update member's last read timestamp
      await db.collection('chat_channels').updateOne(
        { 
          id: channelId,
          'members.user_id': userId 
        },
        {
          $set: {
            'members.$.last_read_at': new Date().toISOString()
          }
        }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
}
