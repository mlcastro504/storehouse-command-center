
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PickingService } from '@/services/pickingService';
import { toast } from 'sonner';
import { ProductSelector } from './ProductSelector';
import { LocationSelector } from './LocationSelector';
import { TaskTypeSelector } from './TaskTypeSelector';
import { PrioritySelector } from './PrioritySelector';

interface CreateTaskFormProps {
  onSuccess: () => void;
}

export const CreateTaskForm = ({ onSuccess }: CreateTaskFormProps) => {
  const [formData, setFormData] = useState({
    product_id: '',
    quantity_requested: 1,
    source_location_id: '',
    destination_location_id: '',
    task_type: 'sale' as const,
    priority: 'medium' as const,
    estimated_duration_minutes: 15,
    notes: '',
    is_training_mode: false,
    validation_code_required: true
  });

  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: PickingService.createPickingTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['picking-all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['picking-available-tasks'] });
      onSuccess();
      resetForm();
      toast.success('Tarea de picking creada exitosamente');
    },
    onError: () => {
      toast.error('Error al crear la tarea de picking');
    }
  });

  const resetForm = () => {
    setFormData({
      product_id: '',
      quantity_requested: 1,
      source_location_id: '',
      destination_location_id: '',
      task_type: 'sale',
      priority: 'medium',
      estimated_duration_minutes: 15,
      notes: '',
      is_training_mode: false,
      validation_code_required: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_id || !formData.source_location_id || !formData.destination_location_id) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    createTaskMutation.mutate({
      ...formData,
      notes: formData.notes.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ProductSelector
        value={formData.product_id}
        onChange={(value) => setFormData({...formData, product_id: value})}
      />

      <div className="space-y-2">
        <Label htmlFor="quantity">Cantidad Solicitada *</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={formData.quantity_requested}
          onChange={(e) => setFormData({...formData, quantity_requested: parseInt(e.target.value) || 1})}
          required
        />
      </div>

      <LocationSelector
        label="Ubicación Origen *"
        placeholder="Seleccionar origen"
        value={formData.source_location_id}
        onChange={(value) => setFormData({...formData, source_location_id: value})}
        filterTypes={['rack', 'shelf', 'bin']}
      />

      <LocationSelector
        label="Ubicación Destino *"
        placeholder="Seleccionar destino"
        value={formData.destination_location_id}
        onChange={(value) => setFormData({...formData, destination_location_id: value})}
        filterTypes={['packing', 'shipping', 'bin', 'buffer']}
      />

      <div className="grid grid-cols-2 gap-4">
        <TaskTypeSelector
          value={formData.task_type}
          onChange={(value: any) => setFormData({...formData, task_type: value})}
        />

        <PrioritySelector
          value={formData.priority}
          onChange={(value: any) => setFormData({...formData, priority: value})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duración Estimada (minutos)</Label>
        <Input
          id="duration"
          type="number"
          min="1"
          value={formData.estimated_duration_minutes}
          onChange={(e) => setFormData({...formData, estimated_duration_minutes: parseInt(e.target.value) || 15})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Observaciones adicionales..."
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          id="training"
          checked={formData.is_training_mode}
          onCheckedChange={(checked) => setFormData({...formData, is_training_mode: checked})}
        />
        <Label htmlFor="training">Modo entrenamiento</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          id="validation"
          checked={formData.validation_code_required}
          onCheckedChange={(checked) => setFormData({...formData, validation_code_required: checked})}
        />
        <Label htmlFor="validation">Requiere código de validación</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="submit" 
          disabled={createTaskMutation.isPending}
          className="w-full"
        >
          {createTaskMutation.isPending ? 'Creando...' : 'Crear Tarea'}
        </Button>
      </div>
    </form>
  );
};
