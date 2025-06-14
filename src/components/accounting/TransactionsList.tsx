
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Edit, Calculator, Receipt } from 'lucide-react';
import { Transaction } from '@/types/accounting';

export function TransactionsList() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      console.log('TransactionsList: Connecting to MongoDB...');
      const db = await connectToDatabase();
      
      // Use our mock MongoDB service - aggregate returns a Promise directly
      const transactionsData = await db.collection('transactions').aggregate([
        {
          $lookup: {
            from: 'journal_entries',
            localField: '_id',
            foreignField: 'transaction_id',
            as: 'journal_entries'
          }
        },
        {
          $sort: { created_at: -1 }
        }
      ]);

      console.log('TransactionsList: Fetched transactions from MongoDB:', transactionsData.length);
      return transactionsData as Transaction[];
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      posted: 'default',
      cancelled: 'destructive'
    };

    const labels: Record<string, string> = {
      draft: 'Borrador',
      posted: 'Registrada',
      cancelled: 'Cancelada'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getTransactionBalance = (transaction: Transaction) => {
    if (!transaction.journal_entries) return true;
    
    // Calculate balance from journal entries, not individual lines
    let totalDebits = 0;
    let totalCredits = 0;
    
    for (const entry of transaction.journal_entries) {
      if (entry.entry_lines) {
        totalDebits += entry.entry_lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
        totalCredits += entry.entry_lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);
      }
    }
    
    return Math.abs(totalDebits - totalCredits) < 0.01; // Consider floating point precision
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="warehouse-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Transacciones Contables
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Registro detallado de asientos contables y movimientos financieros
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Transacción
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Asientos</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((transaction) => {
              const isBalanced = getTransactionBalance(transaction);
              const entryCount = transaction.journal_entries?.length || 0;
              
              return (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.transaction_number}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{transaction.description}</div>
                    {transaction.reference && (
                      <div className="text-xs text-muted-foreground">
                        Ref: {transaction.reference}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                  <TableCell>{transaction.reference || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {entryCount} asientos
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(transaction.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isBalanced ? 'default' : 'destructive'} className="text-xs">
                      {isBalanced ? 'Balanceado' : 'Desbalanceado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" title="Ver asientos">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Editar transacción">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Comprobante">
                        <Receipt className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {(!transactions || transactions.length === 0) && (
          <div className="text-center py-8">
            <Calculator className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">No hay transacciones registradas</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Comienza registrando movimientos contables para llevar el control financiero.
            </p>
            <div className="mt-6">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Transacción
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
