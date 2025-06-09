
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Package, ArrowRight, QrCode, CheckCircle } from 'lucide-react';
import { StockMoveService } from '@/services/stockMoveService';
import { toast } from 'sonner';

interface TaskExecutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  onTaskCompleted: () => void;
}

export const TaskExecutionDialog: React.FC<TaskExecutionDialogProps> = ({
  open,
  onOpenChange,
  task,
  onTaskCompleted
}) => {
  const [quantityMoved, setQuantityMoved] = useState<number>(task?.quantity_needed || 0);
  const [validationCode, setValidationCode] = useState('');
  const [executionNotes, setExecutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validationCode.trim()) {
      toast.error('Debe ingresar el código de validación');
      return;
    }

    if (quantityMoved <= 0) {
      toast.error('La cantidad debe ser mayor a cero');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await StockMoveService.completeTask(
        task.id,
        'current-user-id', // TODO: Get actual user ID
        quantityMoved,
        validationCode.trim().toUpperCase(),
        executionNotes.trim() || undefined
      );

      if (result.success) {
        toast.success(result.message);
        onTaskCompleted();
        onOpenChange(false);
        // Reset form
        setQuantityMoved(task?.quantity_needed || 0);
        setValidationCode('');
        setExecutionNotes('');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Error al completar la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ejecutar Tarea de Stock Move</DialogTitle>
          <DialogDescription>
            Complete los detalles del movimiento y confirme con el código de validación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la tarea */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Detalles de la Tarea
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Producto</Label>
                  <div className="mt-1">
                    <div className="font-medium">{task.products?.name}</div>
                    <div className="text-sm text-gray-500">SKU: {task.products?.sku}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Cantidad Necesaria</Label>
                  <div className="mt-1 text-lg font-bold">{task.quantity_needed}</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Ubicación Origen</Label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-md">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <div className="font-medium">{task.source_location?.code}</div>
                      <div className="text-sm text-gray-500">{task.source_location?.name}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Ubicación Destino</Label>
                  <div className="flex items-center p-3 bg-blue-50 rounded-md">
                    <ArrowRight className="w-4 h-4 mr-2 text-blue-500" />
                    <div>
                      <div className="font-medium">{task.destination_location?.code}</div>
                      <div className="text-sm text-gray-500">{task.destination_location?.name}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de ejecución */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Confirmar Movimiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad Movida</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={task.quantity_needed}
                      value={quantityMoved}
                      onChange={(e) => setQuantityMoved(parseInt(e.target.value) || 0)}
                      required
                    />
                    {quantityMoved < task.quantity_needed && (
                      <p className="text-sm text-orange-600">
                        ⚠️ Movimiento parcial: {quantityMoved} de {task.quantity_needed}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validationCode">
                      <QrCode className="w-4 h-4 inline mr-1" />
                      Código de Validación del Destino
                    </Label>
                    <Input
                      id="validationCode"
                      placeholder="Ej: LOC-ABC123"
                      value={validationCode}
                      onChange={(e) => setValidationCode(e.target.value.toUpperCase())}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Escanee o ingrese el código de la ubicación destino: {task.destination_location?.code}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas de Ejecución (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Cualquier observación sobre el movimiento..."
                    value={executionNotes}
                    onChange={(e) => setExecutionNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Procesando...' : 'Completar Movimiento'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
