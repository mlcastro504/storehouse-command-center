
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

export function AccountingKPIs() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['accounting-kpis'],
    queryFn: async () => {
      console.log('AccountingKPIs: Fetching KPIs...');
      const db = await connectToDatabase();
      
      // Aquí calcularíamos los KPIs reales basados en los datos
      // Por ahora, datos de ejemplo
      return {
        totalRevenue: 85430,
        totalExpenses: 62150,
        netIncome: 23280,
        cashFlow: 15640,
        accountsReceivable: 25840,
        accountsPayable: 18530,
        overdueInvoices: 8,
        totalInvoices: 23,
        grossMargin: 0.72,
        operatingMargin: 0.27
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'percent',
      minimumFractionDigits: 1
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(kpis?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(kpis?.totalExpenses || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +3.2% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(kpis?.netIncome || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margen: {formatPercentage((kpis?.netIncome || 0) / (kpis?.totalRevenue || 1))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flujo de Caja</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(kpis?.cashFlow || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Positivo este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Operativas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Cuentas</CardTitle>
            <CardDescription>Resumen de cuentas por cobrar y pagar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Cuentas por Cobrar</span>
                <span className="text-sm font-bold">{formatCurrency(kpis?.accountsReceivable || 0)}</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Cuentas por Pagar</span>
                <span className="text-sm font-bold">{formatCurrency(kpis?.accountsPayable || 0)}</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Balance Neto</span>
                <span className="text-sm font-bold text-green-600">
                  {formatCurrency((kpis?.accountsReceivable || 0) - (kpis?.accountsPayable || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores de Rentabilidad</CardTitle>
            <CardDescription>Márgenes y eficiencia operativa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Margen Bruto</span>
                <span className="text-sm font-bold">{formatPercentage(kpis?.grossMargin || 0)}</span>
              </div>
              <Progress value={(kpis?.grossMargin || 0) * 100} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Margen Operativo</span>
                <span className="text-sm font-bold">{formatPercentage(kpis?.operatingMargin || 0)}</span>
              </div>
              <Progress value={(kpis?.operatingMargin || 0) * 100} className="h-2" />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">
                {kpis?.overdueInvoices || 0} facturas vencidas de {kpis?.totalInvoices || 0} totales
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
