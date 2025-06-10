
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { Account } from '@/types/accounting';

export function AccountsList() {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      console.log('AccountsList: Connecting to MongoDB...');
      const db = await connectToDatabase();
      
      const accountsData = await db.collection('accounts')
        .find()
        .sort()
        .toArray();

      console.log('AccountsList: Fetched accounts from MongoDB:', accountsData.length);
      
      // Sort by code in JavaScript
      const sortedData = (accountsData as Account[]).sort((a, b) => a.code.localeCompare(b.code));
      return sortedData;
    }
  });

  const getAccountTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      asset: 'default',
      liability: 'secondary',
      equity: 'outline',
      revenue: 'default',
      expense: 'destructive'
    };

    const labels: Record<string, string> = {
      asset: 'Activo',
      liability: 'Pasivo',
      equity: 'Patrimonio',
      revenue: 'Ingreso',
      expense: 'Gasto'
    };

    const colors: Record<string, string> = {
      asset: 'bg-green-100 text-green-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-blue-100 text-blue-800',
      revenue: 'bg-purple-100 text-purple-800',
      expense: 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge variant={variants[type] || 'outline'} className={colors[type] || ''}>
        {labels[type] || type}
      </Badge>
    );
  };

  const getAccountLevel = (code: string) => {
    const cleanCode = code.replace(/\D/g, '');
    return cleanCode.length;
  };

  const getParentCode = (code: string) => {
    const cleanCode = code.replace(/\D/g, '');
    if (cleanCode.length <= 1) return null;
    return cleanCode.slice(0, -1);
  };

  const formatAccountHierarchy = (account: Account) => {
    const level = getAccountLevel(account.code);
    const indent = '  '.repeat(Math.max(0, level - 1));
    return indent + account.name;
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
              <Building2 className="h-5 w-5" />
              Plan de Cuentas Contables
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Catálogo jerárquico de cuentas contables para clasificación financiera
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cuenta
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre de la Cuenta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts?.map((account) => {
              const level = getAccountLevel(account.code);
              return (
                <TableRow key={account.id}>
                  <TableCell className="font-medium font-mono">
                    {account.code}
                  </TableCell>
                  <TableCell className="font-medium">
                    <span 
                      className={`${level > 1 ? 'ml-' + ((level - 1) * 4) : ''}`}
                      style={{ marginLeft: `${(level - 1) * 16}px` }}
                    >
                      {account.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getAccountTypeBadge(account.account_type)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      Nivel {level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {account.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.is_active ? 'default' : 'secondary'}>
                      {account.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" title="Editar cuenta">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Eliminar cuenta">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {(!accounts || accounts.length === 0) && (
          <div className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">No hay cuentas configuradas</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Comienza creando el plan de cuentas contables para tu empresa.
            </p>
            <div className="mt-6">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Plan de Cuentas
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
