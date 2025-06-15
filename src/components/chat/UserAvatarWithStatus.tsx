
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { mockUserStatuses } from '@/data/mock-chat';

// This is a mock. In a real app, this would come from a real-time service.
const statuses = mockUserStatuses;

type Status = 'online' | 'away' | 'offline';

interface UserAvatarWithStatusProps {
  userId?: string;
  fallback: string;
  className?: string;
}

export const UserAvatarWithStatus = ({ userId, fallback, className }: UserAvatarWithStatusProps) => {
  const status: Status = userId && statuses[userId] ? statuses[userId] : 'offline';

  const statusColor = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400',
  }[status];

  return (
    <div className={cn("relative shrink-0", className)}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">
          {fallback}
        </AvatarFallback>
      </Avatar>
      <span className={cn(
        "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background",
        statusColor
      )} />
    </div>
  );
};
