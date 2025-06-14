
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatChannelsList } from '@/components/chat/ChatChannelsList';
import { CreateChannelDialog } from '@/components/chat/CreateChannelDialog';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { 
  MessageCircle, 
  Users, 
  Hash, 
  Bell,
  Settings,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { useMessageSimulator } from '@/hooks/useMessageSimulator';
import { mockChannels, contextualChats as mockContextualChats, mockUserStatuses } from '@/data/mock-chat';

export default function Chat() {
  const [selectedChannel, setSelectedChannel] = useState<string>('general');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(5);

  useMessageSimulator(['general', 'almacen', 'gerencia']);

  const contextualChats = mockContextualChats;

  const allChannels = [
    ...mockChannels,
    ...contextualChats.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      members: c.members,
      member_ids: c.member_ids,
      unreadCount: c.unreadCount,
      lastMessage: c.context.description,
    }))
  ];

  const currentChannelDetails = allChannels.find(c => c.id === selectedChannel);
  
  const getOnlineCount = (memberIds?: string[]) => {
    if (!memberIds) return 0;
    return memberIds.filter(id => mockUserStatuses[id] === 'online').length;
  }

  const onlineCount = getOnlineCount(currentChannelDetails?.member_ids);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Chat Interno</h1>
            <p className="text-muted-foreground">
              Comunicación en tiempo real integrada con operaciones
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
            <CreateChannelDialog />
          </div>
        </div>

        <Tabs defaultValue="channels" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="channels" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Canales
            </TabsTrigger>
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Directos
            </TabsTrigger>
            <TabsTrigger value="contextual" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contextuales
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <TabsContent value="channels" className="mt-0">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Canales
                      </span>
                      <CreateChannelDialog />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ChatChannelsList 
                      selectedChannel={selectedChannel}
                      setSelectedChannel={setSelectedChannel}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contextual" className="mt-0">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Chats Contextuales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    {contextualChats.map((chat) => (
                      <Button
                        key={chat.id}
                        variant={selectedChannel === chat.id ? "secondary" : "ghost"}
                        className="w-full justify-start h-auto p-3"
                        onClick={() => setSelectedChannel(chat.id)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="text-left">
                            <div className="font-medium text-sm">{chat.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {chat.context.description}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {chat.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {chat.unreadCount}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {chat.lastActivity}
                            </span>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="direct" className="mt-0">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Mensajes Directos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="text-center py-8 text-muted-foreground">
                      No hay conversaciones directas activas
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Configuración
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Notificaciones
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Estado de presencia
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Respuestas rápidas
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Privacidad
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>

            {/* Main Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  {selectedChannel ? (
                    <ChatInterface
                      channelId={selectedChannel}
                      channelName={currentChannelDetails?.name}
                      channelMembers={currentChannelDetails?.members}
                      onlineMembers={onlineCount}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">
                          Selecciona un canal o conversación
                        </h3>
                        <p>
                          Elige un canal del sidebar para comenzar a chatear
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
}
