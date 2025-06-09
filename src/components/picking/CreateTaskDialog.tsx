
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PickingService } from '@/services/pickingService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const CreateTaskDialog = () => {
  const [open, setOpen] = useState(false);
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

  // Queries para obtener datos de los selects
  const { data: products } = useQuery({
    queryKey: ['products-for-picking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      // Filter out products with empty, null, or invalid IDs
      return data?.filter(product => 
        product.id && 
        typeof product.id === 'string' && 
        product.id.trim() !== '' &&
        product.name &&
        product.sku
      ) || [];
    }
  });

  const { data: locations } = useQuery({
    queryKey: ['locations-for-picking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, code, name, type')
        .eq('is_active', true)
        .order('code');
      
      if (error) throw error;
      // Filter out locations with empty, null, or invalid IDs
      return data?.filter(location => 
        location.id && 
        typeof location.id === 'string' && 
        location.id.trim() !== '' &&
        location.code &&
        location.name &&
        location.type
      ) || [];
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: PickingService.createPickingTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['picking-all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['picking-available-tasks'] });
      setOpen(false);
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

  // Ensure we have valid arrays with proper filtering
  const sourceLocations = (locations || []).filter(loc => 
    loc.id && 
    typeof loc.id === 'string' && 
    loc.id.trim() !== '' &&
    ['rack', 'shelf', 'bin'].includes(loc.type)
  );

  const destinationLocations = (locations || []).filter(loc => 
    loc.id && 
    typeof loc.id === 'string' && 
    loc.id.trim() !== '' &&
    ['packing', 'shipping', 'bin', 'buffer'].includes(loc.type)
  );

  const validProducts = (products || []).filter(product => 
    product.id && 
    typeof product.id === 'string' && 
    product.id.trim() !== ''
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarea de Picking</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Producto *</Label>
            <Select 
              value={formData.product_id}
              onValueChange={(value) => setFormData({...formData, product_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {validProducts.length > 0 ? (
                  validProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-products" disabled>
                    No hay productos disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="source">Ubicación Origen *</Label>
            <Select 
              value={formData.source_location_id}
              onValueChange={(value) => setFormData({...formData, source_location_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar origen" />
              </SelectTrigger>
              <SelectContent>
                {sourceLocations.length > 0 ? (
                  sourceLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.code} - {location.name} ({location.type})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-source-locations" disabled>
                    No hay ubicaciones de origen disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Ubicación Destino *</Label>
            <Select 
              value={formData.destination_location_id}
              onValueChange={(value) => setFormData({...formData, destination_location_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar destino" />
              </SelectTrigger>
              <SelectContent>
                {destinationLocations.length > 0 ? (
                  destinationLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.code} - {location.name} ({location.type})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-dest-locations" disabled>
                    No hay ubicaciones de destino disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Tarea</Label>
              <Select 
                value={formData.task_type}
                onValueChange={(value: any) => setFormData({...formData, task_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Venta</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="replenishment">Reposición</SelectItem>
                  <SelectItem value="quality_control">Control Calidad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select 
                value={formData.priority}
                onValueChange={(value: any) => setFormData({...formData, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? 'Creando...' : 'Crear Tarea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
