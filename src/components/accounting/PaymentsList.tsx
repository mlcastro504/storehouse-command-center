import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Eye, Edit, CreditCard, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Payment } from '@/types/accounting';
import { CreatePaymentDialog } from './CreatePaymentDialog';

export function PaymentsList() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'received' | 'made'>('received');

  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      console.log('PaymentsList: Connecting to MongoDB...');
      const db = await connectToDatabase();
      
      // Use our mock MongoDB service - aggregate returns a Promise directly
      const paymentsData = await db.collection('payments').aggregate([
        {
          $lookup: {
            from: 'contacts',
            localField: 'contact_id',
            foreignField: '_id',
            as: 'contact'
          }
        },
        {
          $unwind: {
            path: '$contact',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'payment_invoices',
            localField: '_id',
            foreignField: 'payment_id',
            as: 'payment_invoices'
          }
        },
        {
          $sort: { created_at: -1 }
        }
      ]);

      console.log('PaymentsList: Fetched payments from MongoDB:', paymentsData.length);
      return paymentsData as (Payment & { contact: { name: string; email?: string } })[];
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      completed: 'default',
      cancelled: 'destructive'
    };

    const labels: Record<string, string> = {
      pending: 'Pendiente',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      transfer: 'Transferencia',
      card: 'Tarjeta',
      check: 'Cheque',
      other: 'Otro'
    };

    return (
      <Badge variant="outline" className="text-xs">
        {labels[method] || method}
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

  const receivedPayments = payments?.filter(p => p.payment_type === 'received') || [];
  const madePayments = payments?.filter(p => p.payment_type === 'made') || [];

  const openCreateDialog = (type: 'received' | 'made') => {
    setPaymentType(type);
    setCreateDialogOpen(true);
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
                <CreditCard className="h-5 w-5" />
                Gestión de Pagos y Cobros
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Control de pagos realizados y cobros recibidos
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => openCreateDialog('received')} variant="default">
                <ArrowDownCircle className="h-4 w-4 mr-2" />
                Registrar Cobro
              </Button>
              <Button onClick={() => openCreateDialog('made')} variant="outline">
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Registrar Pago
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="received" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="received">Cobros Recibidos</TabsTrigger>
              <TabsTrigger value="made">Pagos Realizados</TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Facturas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivedPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.payment_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.contact?.name || 'Sin contacto'}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.contact?.email || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(payment.payment_method)}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {payment.payment_invoices?.length || 0} facturas
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" title="Ver detalles">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {payment.status === 'pending' && (
                            <Button variant="ghost" size="sm" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {receivedPayments.length === 0 && (
                <div className="text-center py-8">
                  <ArrowDownCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-muted-foreground">No hay cobros registrados</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Comienza registrando tu primer cobro de cliente.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => openCreateDialog('received')}>
                      <ArrowDownCircle className="h-4 w-4 mr-2" />
                      Registrar Cobro
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="made" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Facturas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {madePayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.payment_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.contact?.name || 'Sin contacto'}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.contact?.email || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(payment.payment_method)}
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {payment.payment_invoices?.length || 0} facturas
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" title="Ver detalles">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {payment.status === 'pending' && (
                            <Button variant="ghost" size="sm" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {madePayments.length === 0 && (
                <div className="text-center py-8">
                  <ArrowUpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-muted-foreground">No hay pagos registrados</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Comienza registrando tu primer pago a proveedor.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => openCreateDialog('made')}>
                      <ArrowUpCircle className="h-4 w-4 mr-2" />
                      Registrar Pago
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CreatePaymentDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        paymentType={paymentType}
        onSuccess={() => {
          refetch();
          setCreateDialogOpen(false);
        }}
      />
    </div>
  );
}
