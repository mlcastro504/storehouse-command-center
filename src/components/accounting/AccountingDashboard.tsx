
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Calculator } from 'lucide-react';

export function AccountingDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['accounting-stats'],
    queryFn: async () => {
      const [invoicesRes, transactionsRes, contactsRes] = await Promise.all([
        supabase.from('invoices').select('total_amount, status, invoice_type'),
        supabase.from('transactions').select('total_amount, status'),
        supabase.from('contacts').select('contact_type')
      ]);

      const invoices = invoicesRes.data || [];
      const transactions = transactionsRes.data || [];
      const contacts = contactsRes.data || [];

      const totalSales = invoices
        .filter(i => i.invoice_type === 'sale' && i.status === 'paid')
        .reduce((sum, i) => sum + i.total_amount, 0);

      const totalPurchases = invoices
        .filter(i => i.invoice_type === 'purchase' && i.status === 'paid')
        .reduce((sum, i) => sum + i.total_amount, 0);

      const pendingInvoices = invoices.filter(i => i.status === 'sent').length;
      const totalTransactions = transactions.length;
      const totalContacts = contacts.length;

      return {
        totalSales,
        totalPurchases,
        pendingInvoices,
        totalTransactions,
        totalContacts,
        netIncome: totalSales - totalPurchases
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="warehouse-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalSales || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos por ventas pagadas
            </p>
          </CardContent>
        </Card>

        <Card className="warehouse-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.totalPurchases || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gastos por compras pagadas
            </p>
          </CardContent>
        </Card>

        <Card className="warehouse-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats?.netIncome || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ventas - Compras
            </p>
          </CardContent>
        </Card>

        <Card className="warehouse-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.pendingInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Facturas enviadas sin pagar
            </p>
          </CardContent>
        </Card>

        <Card className="warehouse-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <Calculator className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.totalTransactions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de transacciones registradas
            </p>
          </CardContent>
        </Card>

        <Card className="warehouse-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactos</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {stats?.totalContacts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes y proveedores registrados
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="warehouse-card">
        <CardHeader>
          <CardTitle>Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Ingresos por Ventas:</span>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(stats?.totalSales || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Gastos por Compras:</span>
              <span className="text-sm font-bold text-red-600">
                -{formatCurrency(stats?.totalPurchases || 0)}
              </span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="text-base font-bold">Beneficio Neto:</span>
              <span className={`text-base font-bold ${(stats?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats?.netIncome || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
