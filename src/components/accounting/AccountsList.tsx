
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Account } from '@/types/accounting';

export function AccountsList() {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('code');

      if (error) throw error;
      return data as Account[];
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

    return (
      <Badge variant={variants[type] || 'outline'}>
        {labels[type] || type}
      </Badge>
    );
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
            <CardTitle>Plan de Cuentas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Catálogo de cuentas contables
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
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts?.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium font-mono">
                  {account.code}
                </TableCell>
                <TableCell className="font-medium">
                  {account.name}
                </TableCell>
                <TableCell>
                  {getAccountTypeBadge(account.account_type)}
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
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
