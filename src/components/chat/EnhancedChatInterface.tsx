
import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Camera, 
  MapPin, 
  AlertTriangle,
  Pin,
  Reply,
  MoreVertical,
  Search,
  Phone,
  Video,
  Info
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface EnhancedChatInterfaceProps {
  channelId?: string;
  channelType?: 'public' | 'private' | 'direct' | 'contextual';
  contextData?: any;
}

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'busy' | 'away' | 'offline';
    role: string;
  };
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'system';
  priority?: 'normal' | 'important' | 'urgent';
  isPinned?: boolean;
  isOfficial?: boolean;
  replyTo?: string;
  mentions?: string[];
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }>;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  readBy?: Array<{
    userId: string;
    readAt: string;
  }>;
}

const mockMessages: Message[] = [
  {
    id: '1',
    sender: {
      id: '1',
      name: 'Juan Pérez',
      avatar: 'JP',
      status: 'online',
      role: 'Supervisor Picking'
    },
    content: 'Buenos días equipo, necesitamos acelerar las tareas de picking para el pedido #2024-001',
    timestamp: '2024-01-10T09:15:00Z',
    type: 'text',
    priority: 'important',
    isOfficial: true,
    mentions: ['@picking'],
    reactions: [
      { emoji: '👍', count: 3, users: ['2', '3', '4'] }
    ]
  },
  {
    id: '2',
    sender: {
      id: '2',
      name: 'María García',
      avatar: 'MG',
      status: 'online',
      role: 'Operario Picking'
    },
    content: 'Entendido @Juan Pérez, ¿hay algún problema específico con el stock?',
    timestamp: '2024-01-10T09:16:00Z',
    type: 'text',
    replyTo: '1',
    mentions: ['Juan Pérez']
  },
  {
    id: '3',
    sender: {
      id: '3',
      name: 'Carlos Ruiz',
      avatar: 'CR',
      status: 'busy',
      role: 'Operario Picking'
    },
    content: 'Reporto falta de stock en la ubicación A-12-3 para el producto SKU-12345',
    timestamp: '2024-01-10T09:18:00Z',
    type: 'text',
    priority: 'urgent',
    attachments: [
      {
        id: 'att1',
        name: 'ubicacion_A12-3.jpg',
        type: 'image',
        url: '/placeholder-image.jpg',
        size: 2048576
      }
    ]
  }
];

const quickResponses = [
  'Entendido ✓',
  'En proceso...',
  'Completado',
  'Necesito ayuda',
  'Problema resuelto',
  'Voy en camino',
  'Dame 5 minutos',
  'Revisando...'
];

export const EnhancedChatInterface = ({ 
  channelId, 
  channelType = 'public',
  contextData 
}: EnhancedChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mockMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', {
        content: message,
        channelId,
        replyTo: replyingTo,
        contextData
      });
      setMessage('');
      setReplyingTo(null);
      setShowQuickResponses(false);
    }
  };

  const handleQuickResponse = (response: string) => {
    setMessage(response);
    setShowQuickResponses(false);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic
  };

  const handleReaction = (messageId: string, emoji: string) => {
    console.log('Adding reaction:', messageId, emoji);
  };

  const handleMention = (userName: string) => {
    setMessage(prev => prev + `@${userName} `);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">URGENTE</Badge>;
      case 'important':
        return <Badge variant="default" className="text-xs">IMPORTANTE</Badge>;
      default:
        return null;
    }
  };

  const currentChannel = {
    name: contextData?.orderNumber ? `Pedido ${contextData.orderNumber}` : 'Canal General',
    type: channelType,
    memberCount: 25,
    description: contextData?.description || 'Canal principal de comunicación'
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {channelType === 'contextual' && (
                <Badge variant="outline" className="text-xs">
                  CONTEXTUAL
                </Badge>
              )}
              <h3 className="font-semibold">{currentChannel.name}</h3>
              {currentChannel.type === 'private' && (
                <Badge variant="secondary" className="text-xs">PRIVADO</Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentChannel.memberCount} miembros activos
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Ver información del canal</DropdownMenuItem>
                <DropdownMenuItem>Configurar notificaciones</DropdownMenuItem>
                <DropdownMenuItem>Ver miembros</DropdownMenuItem>
                <DropdownMenuItem>Buscar mensajes</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {showSearch && (
          <div className="mt-3">
            <Input
              placeholder="Buscar en la conversación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        )}

        {contextData && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-900">
              Contexto: {contextData.type}
            </div>
            <div className="text-xs text-blue-700 mt-1">
              {contextData.description}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {mockMessages.map((msg) => (
            <div key={msg.id} className="group relative">
              {/* Reply indicator */}
              {msg.replyTo && (
                <div className="ml-12 mb-2 text-xs text-muted-foreground border-l-2 border-muted pl-2">
                  Respondiendo a mensaje anterior
                </div>
              )}
              
              <div className="flex gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{msg.sender.avatar}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(msg.sender.status)}`} />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{msg.sender.name}</span>
                    <Badge variant="outline" className="text-xs">{msg.sender.role}</Badge>
                    {getPriorityBadge(msg.priority)}
                    {msg.isOfficial && (
                      <Badge variant="default" className="text-xs">OFICIAL</Badge>
                    )}
                    {msg.isPinned && (
                      <Pin className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(msg.timestamp), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </span>
                  </div>
                  
                  <div className={`text-sm ${msg.priority === 'urgent' ? 'font-medium' : ''}`}>
                    {msg.content}
                  </div>

                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="space-y-2">
                      {msg.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-2 p-2 bg-muted rounded border">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm font-medium">{attachment.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(attachment.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {msg.reactions.map((reaction, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleReaction(msg.id, reaction.emoji)}
                        >
                          {reaction.emoji} {reaction.count}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Message actions (visible on hover) */}
                  <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1 bg-background border rounded p-1 shadow-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleReaction(msg.id, '👍')}
                      >
                        <Smile className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setReplyingTo(msg.id)}
                      >
                        <Reply className="h-3 w-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Fijar mensaje</DropdownMenuItem>
                          <DropdownMenuItem>Marcar como oficial</DropdownMenuItem>
                          <DropdownMenuItem>Copiar enlace</DropdownMenuItem>
                          <Separator />
                          <DropdownMenuItem className="text-red-600">
                            Reportar mensaje
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-muted border-t border-b">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Respondiendo a mensaje...
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Quick responses */}
      {showQuickResponses && (
        <div className="px-4 py-2 border-t">
          <div className="flex flex-wrap gap-2">
            {quickResponses.map((response, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickResponse(response)}
              >
                {response}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              placeholder="Escribe un mensaje... (@usuario para mencionar)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="min-h-[40px] max-h-[120px] resize-none pr-24"
              rows={1}
            />
            
            {/* Input actions */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleFileUpload}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowQuickResponses(!showQuickResponses)}
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${isRecording ? 'text-red-500' : ''}`}
                onClick={handleVoiceRecord}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <Button onClick={handleSendMessage} size="sm" disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile quick actions */}
        <div className="flex gap-2 mt-2 lg:hidden">
          <Button variant="outline" size="sm">
            <MapPin className="h-4 w-4 mr-1" />
            Ubicación
          </Button>
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Emergencia
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          console.log('Files selected:', files);
        }}
      />
    </div>
  );
};
