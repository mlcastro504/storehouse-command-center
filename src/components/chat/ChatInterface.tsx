
import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip, Smile, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/types/chat';
import * as chatService from '@/services/chatService';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const ChatInterface = ({ channelId, channelName, channelMembers }: { channelId: string, channelName?: string, channelMembers?: number }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    const fetchMessages = async () => {
      if (channelId) {
        setIsLoading(true);
        const initialMessages = await chatService.ChatService.getMessages(channelId);
        setMessages(initialMessages);
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [channelId]);

  useEffect(() => {
    // A short delay to allow the DOM to update before scrolling
    setTimeout(() => scrollToBottom(), 100);
  }, [messages]);


  useEffect(() => {
    if (!channelId || isLoading) return;

    const interval = setInterval(async () => {
      const updatedMessages = await chatService.ChatService.getMessages(channelId);
      if (updatedMessages.length !== messages.length) {
        setMessages(updatedMessages);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [channelId, messages.length, isLoading]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && user) {
      const messageData: Partial<ChatMessage> = {
        channel_id: channelId,
        sender_id: user.id,
        content: newMessage,
        message_type: 'text',
        sent_at: new Date().toISOString(),
        sender: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt || new Date(),
            lastLoginAt: user.lastLoginAt,
        }
      };
      setNewMessage('');
      // Optimistic update
      setMessages(prev => [...prev, messageData as ChatMessage]);
      await chatService.ChatService.sendMessage(messageData);
      // No need to refetch here, polling will handle it and correct the data if needed.
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-4 space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <div className="flex-1 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-2/3" />
            <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold"># {channelName || channelId}</h3>
          {channelMembers !== undefined && <p className="text-sm text-muted-foreground">{channelMembers} miembros</p>}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Información del canal (próximamente)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={msg.id || index} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {msg.sender?.firstName?.[0] || 'S'}
                  {msg.sender?.lastName?.[0] || 'Y'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{msg.sender?.firstName} {msg.sender?.lastName}</span>
                  <span className="text-xs text-muted-foreground">{new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4 bg-background">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder={user ? "Escribe un mensaje..." : "Inicia sesión para chatear"}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-20"
              disabled={!user}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0" disabled>
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0" disabled>
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button onClick={handleSendMessage} size="icon" disabled={!newMessage.trim() || !user}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
