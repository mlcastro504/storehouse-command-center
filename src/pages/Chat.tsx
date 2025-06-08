
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatChannelsList } from '@/components/chat/ChatChannelsList';
import { CreateChannelDialog } from '@/components/chat/CreateChannelDialog';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { MessageCircle, Users, Hash } from 'lucide-react';

export default function Chat() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Chat Interno</h1>
            <p className="text-muted-foreground">
              Comunicación en tiempo real entre equipos
            </p>
          </div>
          <CreateChannelDialog />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Canales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ChatChannelsList />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-0 h-full">
              <ChatInterface />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
