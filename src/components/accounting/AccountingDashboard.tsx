
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Calculator, CreditCard, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export function AccountingDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['accounting-stats'],
    queryFn: async () => {
      console.log('AccountingDashboard: Connecting to MongoDB...');
      const db = await connectToDatabase();
      
      const [invoicesData, transactionsData, contactsData, accountsData] = await Promise.all([
        db.collection('invoices').find({}).toArray(),
        db.collection('transactions').find({}).toArray(),
        db.collection('contacts').find({}).toArray(),
        db.collection('accounts').find({}).toArray()
      ]);

      console.log('AccountingDashboard: Data fetched from MongoDB', {
        invoices: invoicesData.length,
        transactions: transactionsData.length,
        contacts: contactsData.length,
        accounts: accountsData.length
      });

      const invoices = invoicesData || [];
      const transactions = transactionsData || [];
      const contacts = contactsData || [];

      const totalSales = invoices
        .filter(i => i.invoice_type === 'sale' && i.status === 'paid')
        .reduce((sum, i) => sum + (i.total_amount || 0), 0);

      const totalPurchases = invoices
        .filter(i => i.invoice_type === 'purchase' && i.status === 'paid')
        .reduce((sum, i) => sum + (i.total_amount || 0), 0);

      const pendingInvoices = invoices.filter(i => i.status === 'sent').length;
      const overdueInvoices = invoices.filter(i => {
        if (i.status !== 'sent' || !i.due_date) return false;
        return new Date(i.due_date) < new Date();
      }).length;

      const totalTransactions = transactions.length;
      const totalContacts = contacts.length;
      const customers = contacts.filter(c => c.contact_type === 'customer' || c.contact_type === 'both').length;
      const suppliers = contacts.filter(c => c.contact_type === 'supplier' || c.contact_type === 'both').length;

      // Calculate accounts receivable and payable
      const accountsReceivable = invoices
        .filter(i => i.invoice_type === 'sale' && ['sent', 'overdue'].includes(i.status))
        .reduce((sum, i) => sum + ((i.total_amount || 0) - (i.paid_amount || 0)), 0);

      const accountsPayable = invoices
        .filter(i => i.invoice_type === 'purchase' && ['sent', 'overdue'].includes(i.status))
        .reduce((sum, i) => sum + ((i.total_amount || 0) - (i.paid_amount || 0)), 0);

      // Calculate monthly revenue trend
      const currentMonth = new Date();
      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      
      const currentMonthSales = invoices
        .filter(i => i.invoice_type === 'sale' && i.status === 'paid' && new Date(i.invoice_date) >= lastMonth)
        .reduce((sum, i) => sum + (i.total_amount || 0), 0);

      return {
        totalSales,
        totalPurchases,
        pendingInvoices,
        overdueInvoices,
        totalTransactions,
        totalContacts,
        customers,
        suppliers,
        accountsReceivable,
        accountsPayable,
        currentMonthSales,
        netIncome: totalSales - totalPurchases,
        cashFlow: totalSales - totalPurchases + accountsReceivable - accountsPayable
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">Cuentas por Cobrar</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats?.accountsReceivable || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendiente de cobro
            </p>
          </CardContent>
        </Card>

        <Card className="warehouse-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas por Pagar</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats?.accountsPayable || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendiente de pago
            </p>
          </CardContent>
        </Card>

        <Card className="warehouse-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
            <div className="flex items-center gap-2 mt-1">
              {(stats?.overdueInvoices || 0) > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats?.overdueInvoices} vencidas
                </Badge>
              )}
            </div>
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
              Total registradas
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
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {stats?.customers || 0} clientes, {stats?.suppliers || 0} proveedores
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cuentas por Cobrar:</span>
                <span className="text-sm font-bold text-blue-600">
                  {formatCurrency(stats?.accountsReceivable || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cuentas por Pagar:</span>
                <span className="text-sm font-bold text-orange-600">
                  -{formatCurrency(stats?.accountsPayable || 0)}
                </span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="text-base font-bold">Beneficio Neto:</span>
                <span className={`text-base font-bold ${(stats?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats?.netIncome || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-bold">Flujo de Efectivo:</span>
                <span className={`text-base font-bold ${(stats?.cashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats?.cashFlow || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="warehouse-card">
          <CardHeader>
            <CardTitle>Alertas Financieras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.overdueInvoices || 0) > 0 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">
                    {stats?.overdueInvoices} facturas vencidas requieren atención
                  </span>
                </div>
              )}
              
              {(stats?.accountsPayable || 0) > (stats?.accountsReceivable || 0) && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-700">
                    Las cuentas por pagar superan las cuentas por cobrar
                  </span>
                </div>
              )}

              {(stats?.netIncome || 0) < 0 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">
                    Los gastos superan los ingresos
                  </span>
                </div>
              )}

              {(stats?.overdueInvoices || 0) === 0 && (stats?.netIncome || 0) >= 0 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700">
                    Estado financiero saludable
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
