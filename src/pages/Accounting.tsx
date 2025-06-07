
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountsList } from '@/components/accounting/AccountsList';
import { TransactionsList } from '@/components/accounting/TransactionsList';
import { InvoicesList } from '@/components/accounting/InvoicesList';
import { ContactsList } from '@/components/accounting/ContactsList';
import { AccountingDashboard } from '@/components/accounting/AccountingDashboard';

const Accounting = () => {
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
                    📊 Módulo de Contabilidad
                  </CardTitle>
                  <CardDescription>
                    Gestión completa de contabilidad, facturas y finanzas
                  </CardDescription>
                </CardHeader>
              </Card>

              <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="invoices">Facturas</TabsTrigger>
                  <TabsTrigger value="transactions">Transacciones</TabsTrigger>
                  <TabsTrigger value="accounts">Plan Contable</TabsTrigger>
                  <TabsTrigger value="contacts">Contactos</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                  <AccountingDashboard />
                </TabsContent>

                <TabsContent value="invoices">
                  <InvoicesList />
                </TabsContent>

                <TabsContent value="transactions">
                  <TransactionsList />
                </TabsContent>

                <TabsContent value="accounts">
                  <AccountsList />
                </TabsContent>

                <TabsContent value="contacts">
                  <ContactsList />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Accounting;
