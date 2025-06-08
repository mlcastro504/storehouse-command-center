
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, Lock, Users } from 'lucide-react';

const mockChannels = [
  {
    id: '1',
    name: 'general',
    type: 'public',
    unreadCount: 3,
    members: 25,
    lastMessage: 'Mensaje reciente...'
  },
  {
    id: '2',
    name: 'almacen',
    type: 'public',
    unreadCount: 0,
    members: 12,
    lastMessage: 'Todo listo para hoy'
  },
  {
    id: '3',
    name: 'gerencia',
    type: 'private',
    unreadCount: 1,
    members: 5,
    lastMessage: 'Reunión mañana a las 10'
  }
];

export const ChatChannelsList = () => {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {mockChannels.map((channel) => (
          <Button
            key={channel.id}
            variant="ghost"
            className="w-full justify-start h-auto p-3"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center gap-2">
                {channel.type === 'private' ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Hash className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{channel.name}</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {channel.members}
                </div>
                {channel.unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {channel.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate w-full text-left">
              {channel.lastMessage}
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};
