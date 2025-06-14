import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Edit, BookOpen, Search, Filter } from 'lucide-react';
import { JournalEntry } from '@/types/accounting';
import { CreateJournalEntryDialog } from './CreateJournalEntryDialog';

export function JournalEntriesList() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: journalEntries, isLoading, refetch } = useQuery({
    queryKey: ['journal-entries', searchTerm],
    queryFn: async () => {
      console.log('JournalEntriesList: Connecting to MongoDB...');
      const db = await connectToDatabase();
      
      // Use our mock MongoDB service - aggregate returns a Promise directly
      const entriesData = await db.collection('journal_entries').aggregate([
        {
          $lookup: {
            from: 'journal_entry_lines',
            localField: '_id',
            foreignField: 'journal_entry_id',
            as: 'entry_lines'
          }
        },
        {
          $sort: { created_at: -1 }
        }
      ]);

      console.log('JournalEntriesList: Fetched journal entries from MongoDB:', entriesData.length);
      
      let filteredEntries = entriesData as JournalEntry[];
      
      if (searchTerm) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.entry_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.reference?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return filteredEntries;
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
      posted: 'Registrado',
      cancelled: 'Cancelado'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getReferenceTypeBadge = (referenceType?: string) => {
    if (!referenceType) return null;

    const labels: Record<string, string> = {
      invoice: 'Factura',
      payment: 'Pago',
      adjustment: 'Ajuste',
      manual: 'Manual'
    };

    return (
      <Badge variant="secondary" className="text-xs">
        {labels[referenceType] || referenceType}
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

  const getEntryBalance = (entry: JournalEntry) => {
    if (!entry.entry_lines) return true;
    
    const totalDebits = entry.entry_lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
    const totalCredits = entry.entry_lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);
    
    return Math.abs(totalDebits - totalCredits) < 0.01;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="warehouse-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Libro Diario - Asientos Contables
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Registro cronológico de todas las transacciones contables
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Asiento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por descripción, número o referencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Líneas</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {journalEntries?.map((entry) => {
                const isBalanced = getEntryBalance(entry);
                const lineCount = entry.entry_lines?.length || 0;
                
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.entry_number}
                    </TableCell>
                    <TableCell>{formatDate(entry.entry_date)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{entry.description}</div>
                      {entry.reference && (
                        <div className="text-xs text-muted-foreground">
                          Ref: {entry.reference}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{entry.reference || '-'}</TableCell>
                    <TableCell>
                      {getReferenceTypeBadge(entry.reference_type)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {lineCount} líneas
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(entry.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isBalanced ? 'default' : 'destructive'} className="text-xs">
                        {isBalanced ? '✓ Balanceado' : '✗ Desbalanceado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(entry.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" title="Ver detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {entry.status === 'draft' && (
                          <Button variant="ghost" size="sm" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {(!journalEntries || journalEntries.length === 0) && (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-muted-foreground">No hay asientos contables</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Comienza registrando tu primer asiento contable.
              </p>
              <div className="mt-6">
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Asiento
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateJournalEntryDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setCreateDialogOpen(false);
        }}
      />
    </div>
  );
}
