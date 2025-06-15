
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, Lock, Users } from 'lucide-react';
import { mockChannels } from '@/data/mock-chat';

export const ChatChannelsList = ({ setSelectedChannel, selectedChannel }: { setSelectedChannel: (id: string) => void, selectedChannel: string | null }) => {
  // In a real app, this would be stateful and update in real-time
  const channels = mockChannels; 

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {channels.map((channel) => (
          <Button
            key={channel.id}
            variant={selectedChannel === channel.id ? "secondary" : "ghost"}
            className="w-full justify-start h-auto p-3 flex-col items-start"
            onClick={() => setSelectedChannel(channel.id)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {channel.type === 'private' ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Hash className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{channel.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {channel.members}
                </div>
                {/* This is just visual for now, not real-time */}
                {channel.unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {channel.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate w-full text-left pl-6">
              {channel.lastMessage}
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};
