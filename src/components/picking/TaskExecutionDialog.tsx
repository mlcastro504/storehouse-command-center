
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Package, 
  MapPin, 
  Scan,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { PickingService } from '@/services/pickingService';
import { toast } from 'sonner';

interface TaskExecutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  onSuccess: () => void;
}

export const TaskExecutionDialog: React.FC<TaskExecutionDialogProps> = ({
  open,
  onOpenChange,
  task,
  onSuccess
}) => {
  const [step, setStep] = useState<'scanning' | 'validation' | 'completion'>('scanning');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [quantityPicked, setQuantityPicked] = useState(task?.quantity_requested || 0);
  const [validationCode, setValidationCode] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const completeTaskMutation = useMutation({
    mutationFn: (data: { taskId: string; quantity: number; code?: string; notes?: string }) =>
      PickingService.completeTask(data.taskId, data.quantity, data.code, data.notes),
    onSuccess: () => {
      toast.success('Tarea completada exitosamente');
      onSuccess();
      resetForm();
    },
    onError: () => {
      toast.error('Error al completar la tarea');
    }
  });

  const validateCodeMutation = useMutation({
    mutationFn: (data: { locationId: string; code: string }) =>
      PickingService.validateLocationCode(data.locationId, data.code),
    onSuccess: (isValid) => {
      if (isValid) {
        setStep('completion');
        setErrors([]);
      } else {
        setErrors(['Código de validación incorrecto']);
      }
    },
    onError: () => {
      setErrors(['Error al validar el código']);
    }
  });

  const resetForm = () => {
    setStep('scanning');
    setScannedBarcode('');
    setQuantityPicked(task?.quantity_requested || 0);
    setValidationCode('');
    setNotes('');
    setErrors([]);
  };

  const handleProductScan = () => {
    // Validar que el código escaneado coincida con el producto
    if (scannedBarcode === task.product?.barcode || scannedBarcode === task.product?.sku) {
      setStep('validation');
      setErrors([]);
    } else {
      setErrors(['El código escaneado no coincide con el producto esperado']);
    }
  };

  const handleLocationValidation = () => {
    if (!validationCode.trim()) {
      setErrors(['Por favor ingresa el código de validación']);
      return;
    }

    validateCodeMutation.mutate({
      locationId: task.destination_location.id,
      code: validationCode.trim()
    });
  };

  const handleCompleteTask = () => {
    if (quantityPicked <= 0) {
      setErrors(['La cantidad debe ser mayor a 0']);
      return;
    }

    if (quantityPicked > task.quantity_requested) {
      setErrors(['La cantidad no puede ser mayor a la solicitada']);
      return;
    }

    completeTaskMutation.mutate({
      taskId: task.id,
      quantity: quantityPicked,
      code: validationCode,
      notes: notes.trim() || undefined
    });
  };

  const handleSkipToCompletion = () => {
    // Para modo de entrenamiento o cuando no se requiere validación estricta
    setStep('completion');
    setErrors([]);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ejecutar Tarea de Picking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la tarea */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary">{task.task_number}</Badge>
              {task.is_training_mode && (
                <Badge variant="destructive">ENTRENAMIENTO</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4" />
              <span>{task.product?.name} ({task.product?.sku})</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Cantidad solicitada:</span>
              <span>{task.quantity_requested}</span>
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Desde: {task.source_location?.code}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                <span>Hacia: {task.destination_location?.code}</span>
              </div>
            </div>
          </div>

          {/* Errores */}
          {errors.length > 0 && (
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Paso 1: Escaneo del producto */}
          {step === 'scanning' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="barcode">Escanear Producto</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="barcode"
                    value={scannedBarcode}
                    onChange={(e) => setScannedBarcode(e.target.value)}
                    placeholder="Código de barras o SKU"
                    autoFocus
                  />
                  <Button onClick={handleProductScan} disabled={!scannedBarcode.trim()}>
                    <Scan className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Código esperado: {task.product?.barcode || task.product?.sku}
                </p>
              </div>

              {task.is_training_mode && (
                <Button 
                  variant="outline" 
                  onClick={handleSkipToCompletion}
                  className="w-full"
                >
                  Saltar verificación (Modo entrenamiento)
                </Button>
              )}
            </div>
          )}

          {/* Paso 2: Validación de ubicación destino */}
          {step === 'validation' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Producto verificado correctamente</span>
              </div>

              <div>
                <Label htmlFor="validation-code">Código de Ubicación Destino</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="validation-code"
                    value={validationCode}
                    onChange={(e) => setValidationCode(e.target.value)}
                    placeholder="Código de confirmación"
                    autoFocus
                  />
                  <Button 
                    onClick={handleLocationValidation} 
                    disabled={!validationCode.trim() || validateCodeMutation.isPending}
                  >
                    {validateCodeMutation.isPending ? 'Validando...' : 'Validar'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ubicación destino: {task.destination_location?.code}
                </p>
              </div>
            </div>
          )}

          {/* Paso 3: Finalización */}
          {step === 'completion' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Validaciones completadas</span>
              </div>

              <div>
                <Label htmlFor="quantity">Cantidad Recolectada</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantityPicked}
                  onChange={(e) => setQuantityPicked(parseInt(e.target.value) || 0)}
                  min="0"
                  max={task.quantity_requested}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones o comentarios..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleCompleteTask}
                disabled={completeTaskMutation.isPending || quantityPicked <= 0}
                className="w-full"
              >
                {completeTaskMutation.isPending ? 'Completando...' : 'Completar Tarea'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
