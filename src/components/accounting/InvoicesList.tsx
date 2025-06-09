
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Edit, Trash2, Download, Send } from 'lucide-react';
import { Invoice } from '@/types/accounting';
import { CreateInvoiceDialog } from './CreateInvoiceDialog';

export function InvoicesList() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      console.log('InvoicesList: Connecting to MongoDB...');
      const db = await connectToDatabase();
      
      const invoicesData = await db.collection('invoices')
        .aggregate([
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
            $sort: { created_at: -1 }
          }
        ])
        .toArray();

      console.log('InvoicesList: Fetched invoices from MongoDB:', invoicesData.length);
      return invoicesData as (Invoice & { contact: { name: string; email?: string } })[];
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      sent: 'secondary',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'destructive'
    };

    const labels: Record<string, string> = {
      draft: 'Borrador',
      sent: 'Enviada',
      paid: 'Pagada',
      overdue: 'Vencida',
      cancelled: 'Cancelada'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPaymentStatus = (invoice: Invoice) => {
    const totalAmount = invoice.total_amount || 0;
    const paidAmount = invoice.paid_amount || 0;
    
    if (paidAmount === 0) return 'Sin pagar';
    if (paidAmount >= totalAmount) return 'Pagado completo';
    return 'Pago parcial';
  };

  const getPaymentBadge = (invoice: Invoice) => {
    const status = getPaymentStatus(invoice);
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Sin pagar': 'destructive',
      'Pago parcial': 'secondary',
      'Pagado completo': 'default'
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="text-xs">
        {status}
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

  const isOverdue = (invoice: Invoice) => {
    if (!invoice.due_date || invoice.status === 'paid') return false;
    return new Date(invoice.due_date) < new Date();
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
              <CardTitle>Gestión de Facturas</CardTitle>
              <p className="text-sm text-muted-foreground">
                Facturas de venta y compra con seguimiento de pagos
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pagado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((invoice) => (
                <TableRow key={invoice.id} className={isOverdue(invoice) ? 'bg-red-50' : ''}>
                  <TableCell className="font-medium">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.contact?.name || 'Sin contacto'}</div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.contact?.email || '-'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={invoice.invoice_type === 'sale' ? 'default' : 'secondary'}>
                      {invoice.invoice_type === 'sale' ? 'Venta' : 'Compra'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                  <TableCell>
                    {invoice.due_date ? (
                      <span className={isOverdue(invoice) ? 'text-red-600 font-medium' : ''}>
                        {formatDate(invoice.due_date)}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(invoice.total_amount)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(invoice.paid_amount || 0)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(invoice.status)}
                  </TableCell>
                  <TableCell>
                    {getPaymentBadge(invoice)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" title="Ver detalles">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Descargar PDF">
                        <Download className="h-4 w-4" />
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button variant="ghost" size="sm" title="Enviar">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {(!invoices || invoices.length === 0) && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-muted-foreground">No hay facturas</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Comienza creando tu primera factura.
              </p>
              <div className="mt-6">
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Factura
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateInvoiceDialog 
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
