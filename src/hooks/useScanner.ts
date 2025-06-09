
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScannerService } from '@/services/scannerService';
import { toast } from 'sonner';

export const useScanDevices = () => {
  return useQuery({
    queryKey: ['scan-devices'],
    queryFn: ScannerService.getDevices,
  });
};

export const useCreateScanDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ScannerService.createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-devices'] });
      toast.success('Dispositivo de escaneo creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating scan device:', error);
      toast.error('Error al crear el dispositivo de escaneo');
    },
  });
};

export const useScanSessions = () => {
  return useQuery({
    queryKey: ['scan-sessions'],
    queryFn: ScannerService.getSessions,
  });
};

export const useActiveScanSessions = () => {
  return useQuery({
    queryKey: ['active-scan-sessions'],
    queryFn: ScannerService.getActiveSessions,
    refetchInterval: 5000, // Refrescar cada 5 segundos
  });
};

export const useCreateScanSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ScannerService.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-scan-sessions'] });
      toast.success('Sesión de escaneo creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating scan session:', error);
      toast.error('Error al crear la sesión de escaneo');
    },
  });
};

export const useProcessScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ScannerService.processScan,
    onSuccess: (data) => {
      if (data?.validation_status === 'valid') {
        toast.success('Escaneo procesado exitosamente');
      } else {
        toast.warning(`Escaneo con advertencia: ${data?.validation_message}`);
      }
      queryClient.invalidateQueries({ queryKey: ['scan-sessions'] });
    },
    onError: (error) => {
      console.error('Error processing scan:', error);
      toast.error('Error al procesar el escaneo');
    },
  });
};

export const useScannerMetrics = () => {
  return useQuery({
    queryKey: ['scanner-metrics'],
    queryFn: ScannerService.getMetrics,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
};

export const useValidationRules = () => {
  return useQuery({
    queryKey: ['validation-rules'],
    queryFn: ScannerService.getValidationRules,
  });
};

export const useCreateValidationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ScannerService.createValidationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validation-rules'] });
      toast.success('Regla de validación creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating validation rule:', error);
      toast.error('Error al crear la regla de validación');
    },
  });
};

export const useDeviceAssignments = (userId?: string) => {
  return useQuery({
    queryKey: ['device-assignments', userId],
    queryFn: () => ScannerService.getDeviceAssignments(userId),
  });
};

export const useAssignDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deviceId, userId, assignedBy, assignmentType }: {
      deviceId: string;
      userId: string;
      assignedBy: string;
      assignmentType: 'permanent' | 'temporary' | 'shift_based';
    }) => ScannerService.assignDevice(deviceId, userId, assignedBy, assignmentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-assignments'] });
      toast.success('Dispositivo asignado exitosamente');
    },
    onError: (error) => {
      console.error('Error assigning device:', error);
      toast.error('Error al asignar el dispositivo');
    },
  });
};

// Hooks para Stock Move
export const usePendingStockMoveTasks = () => {
  return useQuery({
    queryKey: ['pending-stock-move-tasks'],
    queryFn: ScannerService.getPendingStockMoveTasks,
    refetchInterval: 10000, // Refrescar cada 10 segundos
  });
};

export const useCreateStockMoveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ScannerService.createStockMoveTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-stock-move-tasks'] });
      toast.success('Tarea de movimiento de stock creada');
    },
    onError: (error) => {
      console.error('Error creating stock move task:', error);
      toast.error('Error al crear la tarea de movimiento');
    },
  });
};

export const useExecuteStockMove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ScannerService.executeStockMove,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pending-stock-move-tasks'] });
      if (data?.execution_status === 'completed') {
        toast.success('Movimiento de stock completado exitosamente');
      } else {
        toast.warning('Movimiento de stock parcial o con errores');
      }
    },
    onError: (error) => {
      console.error('Error executing stock move:', error);
      toast.error('Error al ejecutar el movimiento de stock');
    },
  });
};
