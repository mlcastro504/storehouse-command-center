
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  RotateCcw, 
  CheckCircle, 
  XCircle,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EcommerceAdvancedService } from '@/services/ecommerceAdvancedService';
import { toast } from 'sonner';

export const EcommerceReturnsManager = () => {
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [processingReturn, setProcessingReturn] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  // Query para obtener devoluciones
  const { data: returns, isLoading } = useQuery({
    queryKey: ['ecommerce-returns'],
    queryFn: EcommerceAdvancedService.getReturns
  });

  // Mutación para procesar devolución
  const processReturnMutation = useMutation({
    mutationFn: ({ returnId, approved, notes }: {
      returnId: string;
      approved: boolean;
      notes?: string;
    }) => EcommerceAdvancedService.processReturn(returnId, approved, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecommerce-returns'] });
      setProcessingReturn(null);
      setNotes('');
      toast.success('Devolución procesada exitosamente');
    },
    onError: () => {
      toast.error('Error al procesar la devolución');
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'approved': return 'default';
      case 'rejected': return 'secondary';
      case 'processed': return 'default';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'processed': return 'Procesada';
      default: return status;
    }
  };

  const getQualityStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'passed': return 'default';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const handleProcessReturn = (approved: boolean) => {
    if (!processingReturn) return;
    
    processReturnMutation.mutate({
      returnId: processingReturn.id,
      approved,
      notes
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando devoluciones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Devoluciones</h2>
          <p className="text-gray-600">Administra devoluciones y control de calidad</p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">
                  {returns?.filter(r => r.status === 'pending').length || 0}
                </div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {returns?.filter(r => r.status === 'approved').length || 0}
                </div>
                <div className="text-sm text-gray-600">Aprobadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">
                  {returns?.filter(r => r.status === 'rejected').length || 0}
                </div>
                <div className="text-sm text-gray-600">Rechazadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {returns?.filter(r => r.status === 'processed').length || 0}
                </div>
                <div className="text-sm text-gray-600">Procesadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de devoluciones */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Orden Original</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Control Calidad</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns?.map((returnItem) => (
                <TableRow key={returnItem.id}>
                  <TableCell className="font-medium">
                    {returnItem.return_number}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{returnItem.order?.order_number}</div>
                      <div className="text-xs text-gray-500">
                        {returnItem.order?.external_order_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {returnItem.return_reason}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {returnItem.return_type === 'full' ? 'Completa' : 'Parcial'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(returnItem.status)}>
                      {getStatusText(returnItem.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getQualityStatusColor(returnItem.quality_check_status)}>
                      {returnItem.quality_check_status === 'pending' ? 'Pendiente' :
                       returnItem.quality_check_status === 'passed' ? 'Aprobado' : 'Rechazado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(returnItem.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReturn(returnItem)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      
                      {returnItem.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => setProcessingReturn(returnItem)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setProcessingReturn(returnItem);
                              setNotes('');
                              setTimeout(() => handleProcessReturn(false), 100);
                            }}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {returns?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <RotateCcw className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay devoluciones</h3>
              <p className="text-gray-600">No se han registrado devoluciones aún</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalles de devolución */}
      <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de Devolución - {selectedReturn?.return_number}</DialogTitle>
          </DialogHeader>
          
          {selectedReturn && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Información General</h4>
                  <div className="space-y-1 text-sm">
                    <p>Orden Original: {selectedReturn.order?.order_number}</p>
                    <p>Motivo: {selectedReturn.return_reason}</p>
                    <p>Tipo: {selectedReturn.return_type === 'full' ? 'Completa' : 'Parcial'}</p>
                    <p>Estado: {getStatusText(selectedReturn.status)}</p>
                    <p>Monto Reembolso: ${selectedReturn.total_refund_amount || 'N/A'}</p>
                    <p>Fecha: {new Date(selectedReturn.created_at).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold">Control de Calidad</h4>
                  <div className="space-y-1 text-sm">
                    <p>Estado: {selectedReturn.quality_check_status}</p>
                    {selectedReturn.processed_by && (
                      <p>Procesado por: {selectedReturn.processed_by}</p>
                    )}
                    {selectedReturn.processed_at && (
                      <p>Fecha proceso: {new Date(selectedReturn.processed_at).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedReturn.return_lines && selectedReturn.return_lines.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Productos Devueltos</h4>
                  <div className="border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Condición</TableHead>
                          <TableHead>Restock</TableHead>
                          <TableHead>Reembolso</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedReturn.return_lines.map((line: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{line.product?.name || 'N/A'}</TableCell>
                            <TableCell>{line.quantity_returned}</TableCell>
                            <TableCell>
                              <Badge variant={
                                line.condition_received === 'good' ? 'default' :
                                line.condition_received === 'damaged' ? 'destructive' : 'secondary'
                              }>
                                {line.condition_received || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={line.restockable ? 'default' : 'secondary'}>
                                {line.restockable ? 'Sí' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>${line.refund_amount || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {selectedReturn.quality_check_notes && (
                <div>
                  <h4 className="font-semibold">Notas de Control de Calidad</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedReturn.quality_check_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de procesamiento de devolución */}
      <Dialog open={!!processingReturn} onOpenChange={() => setProcessingReturn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procesar Devolución - {processingReturn?.return_number}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Notas de Control de Calidad</h4>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar comentarios sobre el estado de los productos devueltos..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setProcessingReturn(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleProcessReturn(false)}
                disabled={processReturnMutation.isPending}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rechazar
              </Button>
              <Button
                onClick={() => handleProcessReturn(true)}
                disabled={processReturnMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aprobar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
