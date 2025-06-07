
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSettingsInitializer } from '@/hooks/useSettingsInitializer';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { IntegrationSettings } from '@/components/settings/IntegrationSettings';
import { SystemSettings } from '@/components/settings/SystemSettings';

const Settings = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Initialize settings for the user
  useSettingsInitializer();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-4">
            <div className="mb-4">
              <SidebarTrigger />
            </div>
            
            <div className="max-w-7xl mx-auto space-y-6">
              <Card className="warehouse-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    ⚙️ Configuración del Sistema
                  </CardTitle>
                  <CardDescription>
                    Gestiona las configuraciones de tu cuenta y del sistema
                  </CardDescription>
                </CardHeader>
              </Card>

              <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="account">Cuenta</TabsTrigger>
                  <TabsTrigger value="security">Seguridad</TabsTrigger>
                  <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                  <TabsTrigger value="integrations">Integraciones</TabsTrigger>
                  <TabsTrigger value="system">Sistema</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                  <GeneralSettings />
                </TabsContent>

                <TabsContent value="account">
                  <AccountSettings />
                </TabsContent>

                <TabsContent value="security">
                  <SecuritySettings />
                </TabsContent>

                <TabsContent value="notifications">
                  <NotificationSettings />
                </TabsContent>

                <TabsContent value="integrations">
                  <IntegrationSettings />
                </TabsContent>

                <TabsContent value="system">
                  <SystemSettings />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
