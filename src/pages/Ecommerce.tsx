
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EcommerceConnections } from '@/components/ecommerce/EcommerceConnections';
import { EcommerceProducts } from '@/components/ecommerce/EcommerceProducts';
import { EcommerceOrders } from '@/components/ecommerce/EcommerceOrders';
import { EcommerceDashboard } from '@/components/ecommerce/EcommerceDashboard';
import { EcommerceSyncLogs } from '@/components/ecommerce/EcommerceSyncLogs';

const Ecommerce = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

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
                    🛒 Módulo de E-commerce
                  </CardTitle>
                  <CardDescription>
                    Integra y gestiona tus tiendas online desde una sola plataforma
                  </CardDescription>
                </CardHeader>
              </Card>

              <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="connections">Conexiones</TabsTrigger>
                  <TabsTrigger value="products">Productos</TabsTrigger>
                  <TabsTrigger value="orders">Pedidos</TabsTrigger>
                  <TabsTrigger value="logs">Logs de Sync</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                  <EcommerceDashboard />
                </TabsContent>

                <TabsContent value="connections">
                  <EcommerceConnections />
                </TabsContent>

                <TabsContent value="products">
                  <EcommerceProducts />
                </TabsContent>

                <TabsContent value="orders">
                  <EcommerceOrders />
                </TabsContent>

                <TabsContent value="logs">
                  <EcommerceSyncLogs />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Ecommerce;
