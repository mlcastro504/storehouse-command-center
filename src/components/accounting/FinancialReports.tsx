
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, LineChart, BookOpen, TrendingUp, Download, Calculator, Building2 } from 'lucide-react';
import { BalanceTrial, IncomeStatementLine, BalanceSheetLine } from '@/types/accounting';

export function FinancialReports() {
  const [reportPeriod, setReportPeriod] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  // Balance de Comprobación
  const { data: trialBalance, isLoading: trialBalanceLoading } = useQuery({
    queryKey: ['trial-balance', reportPeriod],
    queryFn: async () => {
      console.log('FinancialReports: Fetching trial balance...');
      const db = await connectToDatabase();
      
      // Por ahora datos de ejemplo - en implementación real calcularíamos desde journal_entries
      const sampleData: BalanceTrial[] = [
        {
          account_id: '1',
          account_code: '1100',
          account_name: 'Caja',
          account_type: 'asset',
          opening_balance: 5000,
          debit_total: 25000,
          credit_total: 18000,
          closing_balance: 12000
        },
        {
          account_id: '2',
          account_code: '1200',
          account_name: 'Bancos',
          account_type: 'asset',
          opening_balance: 15000,
          debit_total: 45000,
          credit_total: 32000,
          closing_balance: 28000
        },
        {
          account_id: '3',
          account_code: '1300',
          account_name: 'Cuentas por Cobrar',
          account_type: 'asset',
          opening_balance: 8000,
          debit_total: 35000,
          credit_total: 17000,
          closing_balance: 26000
        },
        {
          account_id: '4',
          account_code: '2100',
          account_name: 'Cuentas por Pagar',
          account_type: 'liability',
          opening_balance: 6000,
          debit_total: 12000,
          credit_total: 24000,
          closing_balance: 18000
        },
        {
          account_id: '5',
          account_code: '3100',
          account_name: 'Capital Social',
          account_type: 'equity',
          opening_balance: 20000,
          debit_total: 0,
          credit_total: 5000,
          closing_balance: 25000
        },
        {
          account_id: '6',
          account_code: '4100',
          account_name: 'Ingresos por Ventas',
          account_type: 'revenue',
          opening_balance: 0,
          debit_total: 2000,
          credit_total: 85000,
          closing_balance: 83000
        },
        {
          account_id: '7',
          account_code: '5100',
          account_name: 'Costo de Ventas',
          account_type: 'expense',
          opening_balance: 0,
          debit_total: 45000,
          credit_total: 1000,
          closing_balance: 44000
        },
        {
          account_id: '8',
          account_code: '5200',
          account_name: 'Gastos Operativos',
          account_type: 'expense',
          opening_balance: 0,
          debit_total: 18000,
          credit_total: 500,
          closing_balance: 17500
        }
      ];
      
      return sampleData;
    }
  });

  // Estado de Resultados
  const { data: incomeStatement } = useQuery({
    queryKey: ['income-statement', reportPeriod],
    queryFn: async () => {
      console.log('FinancialReports: Fetching income statement...');
      
      const revenueAccounts: IncomeStatementLine[] = [
        { account_type: 'revenue', account_name: 'Ingresos por Ventas', amount: 83000, percentage: 100 },
        { account_type: 'revenue', account_name: 'Otros Ingresos', amount: 2000, percentage: 2.4 }
      ];
      
      const expenseAccounts: IncomeStatementLine[] = [
        { account_type: 'expense', account_name: 'Costo de Ventas', amount: 44000, percentage: 53.0 },
        { account_type: 'expense', account_name: 'Gastos Operativos', amount: 17500, percentage: 21.1 },
        { account_type: 'expense', account_name: 'Gastos Financieros', amount: 1200, percentage: 1.4 }
      ];
      
      return { revenue: revenueAccounts, expenses: expenseAccounts };
    }
  });

  // Balance General
  const { data: balanceSheet } = useQuery({
    queryKey: ['balance-sheet', reportPeriod],
    queryFn: async () => {
      console.log('FinancialReports: Fetching balance sheet...');
      
      const assets: BalanceSheetLine[] = [
        { account_type: 'asset', account_name: 'Activos Corrientes', amount: 66000, percentage: 60.0 },
        { account_type: 'asset', account_name: 'Activos Fijos', amount: 44000, percentage: 40.0 }
      ];
      
      const liabilities: BalanceSheetLine[] = [
        { account_type: 'liability', account_name: 'Pasivos Corrientes', amount: 18000, percentage: 16.4 },
        { account_type: 'liability', account_name: 'Pasivos a Largo Plazo', amount: 15000, percentage: 13.6 }
      ];
      
      const equity: BalanceSheetLine[] = [
        { account_type: 'equity', account_name: 'Capital Social', amount: 25000, percentage: 22.7 },
        { account_type: 'equity', account_name: 'Utilidades Retenidas', amount: 52000, percentage: 47.3 }
      ];
      
      return { assets, liabilities, equity };
    }
  });

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
    }).format(value / 100);
  };

  return (
    <div className="space-y-6">
      {/* Filtros de Período */}
      <Card>
        <CardHeader>
          <CardTitle>Parámetros de Reportes</CardTitle>
          <CardDescription>Selecciona el período para generar los reportes financieros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha Inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={reportPeriod.start_date}
                onChange={(e) => setReportPeriod(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha Fin</Label>
              <Input
                id="end_date"
                type="date"
                value={reportPeriod.end_date}
                onChange={(e) => setReportPeriod(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Formato de Exportación</Label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reportes */}
      <Tabs defaultValue="trial-balance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trial-balance">Balance de Comprobación</TabsTrigger>
          <TabsTrigger value="income-statement">Estado de Resultados</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance General</TabsTrigger>
          <TabsTrigger value="cash-flow">Flujo de Caja</TabsTrigger>
        </TabsList>

        <TabsContent value="trial-balance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Balance de Comprobación
                  </CardTitle>
                  <CardDescription>
                    Resumen de saldos de todas las cuentas contables
                  </CardDescription>
                </div>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {trialBalanceLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Cuenta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Saldo Inicial</TableHead>
                      <TableHead className="text-right">Debe</TableHead>
                      <TableHead className="text-right">Haber</TableHead>
                      <TableHead className="text-right">Saldo Final</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trialBalance?.map((account) => (
                      <TableRow key={account.account_id}>
                        <TableCell className="font-mono">{account.account_code}</TableCell>
                        <TableCell className="font-medium">{account.account_name}</TableCell>
                        <TableCell>
                          <span className="capitalize">{account.account_type}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.opening_balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.debit_total)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.credit_total)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(account.closing_balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income-statement" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estado de Resultados (PyG)
                  </CardTitle>
                  <CardDescription>
                    Ingresos, gastos y utilidad del período
                  </CardDescription>
                </div>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ingresos */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">INGRESOS</h3>
                <Table>
                  <TableBody>
                    {incomeStatement?.revenue.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.account_name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        <TableCell className="text-right">{formatPercentage(item.percentage)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2">
                      <TableCell className="font-bold">TOTAL INGRESOS</TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {formatCurrency(incomeStatement?.revenue.reduce((sum, item) => sum + item.amount, 0) || 0)}
                      </TableCell>
                      <TableCell className="text-right font-bold">100.0%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Gastos */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600">GASTOS</h3>
                <Table>
                  <TableBody>
                    {incomeStatement?.expenses.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.account_name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        <TableCell className="text-right">{formatPercentage(item.percentage)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2">
                      <TableCell className="font-bold">TOTAL GASTOS</TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        {formatCurrency(incomeStatement?.expenses.reduce((sum, item) => sum + item.amount, 0) || 0)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatPercentage(incomeStatement?.expenses.reduce((sum, item) => sum + item.percentage, 0) || 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Utilidad */}
              <div className="border-t-2 pt-4">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-bold text-lg">UTILIDAD NETA</TableCell>
                      <TableCell className="text-right font-bold text-lg text-blue-600">
                        {formatCurrency(
                          (incomeStatement?.revenue.reduce((sum, item) => sum + item.amount, 0) || 0) -
                          (incomeStatement?.expenses.reduce((sum, item) => sum + item.amount, 0) || 0)
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        {formatPercentage(
                          100 - (incomeStatement?.expenses.reduce((sum, item) => sum + item.percentage, 0) || 0)
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Balance General
                  </CardTitle>
                  <CardDescription>
                    Activos, pasivos y patrimonio a la fecha
                  </CardDescription>
                </div>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Activos */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">ACTIVOS</h3>
                <Table>
                  <TableBody>
                    {balanceSheet?.assets.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.account_name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        <TableCell className="text-right">{formatPercentage(item.percentage)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2">
                      <TableCell className="font-bold">TOTAL ACTIVOS</TableCell>
                      <TableCell className="text-right font-bold text-blue-600">
                        {formatCurrency(balanceSheet?.assets.reduce((sum, item) => sum + item.amount, 0) || 0)}
                      </TableCell>
                      <TableCell className="text-right font-bold">100.0%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Pasivos */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600">PASIVOS</h3>
                <Table>
                  <TableBody>
                    {balanceSheet?.liabilities.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.account_name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        <TableCell className="text-right">{formatPercentage(item.percentage)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2">
                      <TableCell className="font-bold">TOTAL PASIVOS</TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        {formatCurrency(balanceSheet?.liabilities.reduce((sum, item) => sum + item.amount, 0) || 0)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatPercentage(balanceSheet?.liabilities.reduce((sum, item) => sum + item.percentage, 0) || 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Patrimonio */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">PATRIMONIO</h3>
                <Table>
                  <TableBody>
                    {balanceSheet?.equity.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.account_name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        <TableCell className="text-right">{formatPercentage(item.percentage)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2">
                      <TableCell className="font-bold">TOTAL PATRIMONIO</TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {formatCurrency(balanceSheet?.equity.reduce((sum, item) => sum + item.amount, 0) || 0)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatPercentage(balanceSheet?.equity.reduce((sum, item) => sum + item.percentage, 0) || 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Flujo de Caja
                  </CardTitle>
                  <CardDescription>
                    Movimientos de efectivo del período
                  </CardDescription>
                </div>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">Flujo de Caja en Desarrollo</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Esta funcionalidad estará disponible próximamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
