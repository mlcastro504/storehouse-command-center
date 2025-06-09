
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockMoveService } from '@/services/stockMoveService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  open,
  onOpenChange,
  onTaskCreated
}) => {
  const [formData, setFormData] = useState({
    product_id: '',
    quantity_needed: 0,
    source_location_id: '',
    destination_location_id: '',
    task_type: 'replenishment' as 'replenishment' | 'relocation' | 'consolidation',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: ''
  });
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadProducts();
      loadLocations();
    }
  }, [open]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, code, type')
        .eq('is_active', true)
        .order('code');
      
      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_id || !formData.source_location_id || !formData.destination_location_id) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (formData.quantity_needed <= 0) {
      toast.error('La cantidad debe ser mayor a cero');
      return;
    }

    if (formData.source_location_id === formData.destination_location_id) {
      toast.error('La ubicación origen y destino no pueden ser la misma');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const task = await StockMoveService.createManualTask({
        ...formData,
        user_id: 'current-user-id' // TODO: Get actual user ID
      });

      if (task) {
        toast.success('Tarea creada exitosamente');
        onTaskCreated();
        onOpenChange(false);
        // Reset form
        setFormData({
          product_id: '',
          quantity_needed: 0,
          source_location_id: '',
          destination_location_id: '',
          task_type: 'replenishment',
          priority: 'medium',
          notes: ''
        });
      } else {
        toast.error('Error al crear la tarea');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Error al crear la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarea de Stock Move</DialogTitle>
          <DialogDescription>
            Cree una tarea manual de movimiento o reposición de stock
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Movimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Producto</Label>
                  <Select
                    value={formData.product_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity_needed}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      quantity_needed: parseInt(e.target.value) || 0 
                    }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Ubicación Origen</Label>
                  <Select
                    value={formData.source_location_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, source_location_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar origen" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.code} - {location.name} ({location.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Ubicación Destino</Label>
                  <Select
                    value={formData.destination_location_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, destination_location_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.code} - {location.name} ({location.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskType">Tipo de Tarea</Label>
                  <Select
                    value={formData.task_type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, task_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="replenishment">Reposición</SelectItem>
                      <SelectItem value="relocation">Reubicación</SelectItem>
                      <SelectItem value="consolidation">Consolidación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
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
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Instrucciones adicionales para la tarea..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
              {isSubmitting ? 'Creando...' : 'Crear Tarea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
