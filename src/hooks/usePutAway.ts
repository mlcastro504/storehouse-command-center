
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PutAwayService } from '@/services/putAwayService';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { PutAwayRule } from '@/types/putaway';

export const usePendingPallets = () => {
  return useQuery({
    queryKey: ['pending-pallets'],
    queryFn: PutAwayService.getPendingPallets,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
};

export const useActiveTasks = (operatorId?: string) => {
  return useQuery({
    queryKey: ['active-tasks', operatorId],
    queryFn: () => PutAwayService.getActiveTasks(operatorId),
    refetchInterval: 10000, // Refrescar cada 10 segundos
  });
};

export const useClaimPallet = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (palletId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return PutAwayService.claimPallet(palletId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-pallets'] });
      queryClient.invalidateQueries({ queryKey: ['active-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['putaway-metrics'] });
      toast.success('Palet asignado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error claiming pallet:', error);
      toast.error(error.message || 'Error al asignar el palet');
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, locationId, confirmationCode }: {
      taskId: string;
      locationId: string;
      confirmationCode: string;
    }) => PutAwayService.completeTask(taskId, locationId, confirmationCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['pending-pallets'] });
      queryClient.invalidateQueries({ queryKey: ['putaway-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['task-history'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Tarea completada exitosamente');
    },
    onError: (error: any) => {
      console.error('Error completing task:', error);
      toast.error(error.message || 'Error al completar la tarea');
    },
  });
};

export const useCancelTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason: string }) =>
      PutAwayService.cancelTask(taskId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['pending-pallets'] });
      queryClient.invalidateQueries({ queryKey: ['putaway-metrics'] });
      toast.success('Tarea cancelada');
    },
    onError: (error: any) => {
      console.error('Error canceling task:', error);
      toast.error('Error al cancelar la tarea');
    },
  });
};

export const usePutAwayMetrics = () => {
  return useQuery({
    queryKey: ['putaway-metrics'],
    queryFn: PutAwayService.getMetrics,
    refetchInterval: 60000, // Refrescar cada minuto
  });
};

export const useOperatorPerformance = (operatorId?: string) => {
  return useQuery({
    queryKey: ['operator-performance', operatorId],
    queryFn: () => PutAwayService.getOperatorPerformance(operatorId || ''),
    enabled: !!operatorId,
  });
};

export const useTaskHistory = (operatorId?: string) => {
  return useQuery({
    queryKey: ['task-history', operatorId],
    queryFn: () => PutAwayService.getTaskHistory(operatorId),
  });
};

export const usePutAwayRules = () => {
  return useQuery({
    queryKey: ['putaway-rules'],
    queryFn: PutAwayService.getPutAwayRules,
  });
};

export const useCreatePutAwayRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newRule: Partial<PutAwayRule>) => PutAwayService.createPutAwayRule(newRule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['putaway-rules'] });
      toast.success('Rule created successfully.');
    },
    onError: (error: any) => {
      console.error('Error creating rule:', error);
      toast.error(error.message || 'Failed to create rule.');
    },
  });
};

export const useUpdatePutAwayRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleToUpdate: PutAwayRule) => PutAwayService.updatePutAwayRule(ruleToUpdate),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['putaway-rules'] });
      // Optimistically update the specific rule query if it exists
      queryClient.setQueryData(['putaway-rules', variables.id], variables);
      toast.success('Rule updated successfully.');
    },
    onError: (error: any) => {
      console.error('Error updating rule:', error);
      toast.error(error.message || 'Failed to update rule.');
    },
  });
};

export const useDeletePutAwayRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => PutAwayService.deletePutAwayRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['putaway-rules'] });
      toast.success('Rule deleted successfully.');
    },
    onError: (error: any) => {
      console.error('Error deleting rule:', error);
      toast.error(error.message || 'Failed to delete rule.');
    },
  });
};


export const useValidateLocationCode = () => {
  return useMutation({
    mutationFn: ({ locationId, code }: { locationId: string; code: string }) =>
      PutAwayService.validateLocationCode(locationId, code),
  });
};

export const useCreatePutAwayTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: any) => PutAwayService.createPutAwayTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['putaway-tasks'] });
      toast.success('Tarea creada exitosamente');
    },
    onError: (error: any) => {
      console.error('Error creating put away task:', error);
      toast.error('Error al crear la tarea');
    },
  });
};

export const usePutAwayTasks = () => {
  return useQuery({
    queryKey: ['putaway-tasks'],
    queryFn: PutAwayService.getPutAwayTasks,
  });
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: PutAwayService.getProducts,
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: PutAwayService.getLocations,
  });
};
