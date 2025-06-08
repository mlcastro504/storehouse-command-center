
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PutAwayService } from '@/services/putAwayService';
import { toast } from 'sonner';
import { useProducts as useInventoryProducts, useLocations as useInventoryLocations } from '@/hooks/useInventory';

// Re-export inventory hooks for convenience
export const useProducts = useInventoryProducts;
export const useLocations = useInventoryLocations;

export const usePutAwayTasks = () => {
  return useQuery({
    queryKey: ['putaway-tasks'],
    queryFn: PutAwayService.getTasks,
  });
};

export const useCreatePutAwayTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: PutAwayService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['putaway-tasks'] });
      toast.success('Tarea de put away creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating put away task:', error);
      toast.error('Error al crear la tarea de put away');
    },
  });
};

export const useUpdatePutAwayTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      PutAwayService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['putaway-tasks'] });
      toast.success('Tarea actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating put away task:', error);
      toast.error('Error al actualizar la tarea');
    },
  });
};

export const usePutAwayRules = () => {
  return useQuery({
    queryKey: ['putaway-rules'],
    queryFn: PutAwayService.getRules,
  });
};

export const useCreatePutAwayRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: PutAwayService.createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['putaway-rules'] });
      toast.success('Regla de put away creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating put away rule:', error);
      toast.error('Error al crear la regla de put away');
    },
  });
};

export const usePutAwayPerformance = () => {
  return useQuery({
    queryKey: ['putaway-performance'],
    queryFn: PutAwayService.getPerformance,
  });
};
