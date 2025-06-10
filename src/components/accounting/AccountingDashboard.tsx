
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, BookOpen, Receipt, CreditCard, TrendingUp, Building2 } from 'lucide-react';
import { AccountsList } from './AccountsList';
import { JournalEntriesList } from './JournalEntriesList';
import { InvoicesList } from './InvoicesList';
import { PaymentsList } from './PaymentsList';
import { FinancialReports } from './FinancialReports';
import { AccountingKPIs } from './AccountingKPIs';

export function AccountingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* KPIs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas por Cobrar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€25,840</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas por Pagar</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€18,530</div>
            <p className="text-xs text-muted-foreground">
              -5% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              8 vencidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance General</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€142,350</div>
            <p className="text-xs text-muted-foreground">
              Total activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="accounts">Plan de Cuentas</TabsTrigger>
          <TabsTrigger value="journal">Asientos</TabsTrigger>
          <TabsTrigger value="invoices">Facturación</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AccountingKPIs />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <AccountsList />
        </TabsContent>

        <TabsContent value="journal" className="space-y-4">
          <JournalEntriesList />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <InvoicesList />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentsList />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <FinancialReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
