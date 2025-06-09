
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScannerService } from '@/services/scannerService';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export const useScanDevices = () => {
  return useQuery({
    queryKey: ['scan-devices'],
    queryFn: ScannerService.getDevices,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
};

export const useScanSessions = () => {
  return useQuery({
    queryKey: ['scan-sessions'],
    queryFn: ScannerService.getSessions,
    refetchInterval: 10000, // Refrescar cada 10 segundos
  });
};

export const useActiveScanSessions = () => {
  return useQuery({
    queryKey: ['active-scan-sessions'],
    queryFn: ScannerService.getActiveSessions,
    refetchInterval: 5000, // Refrescar cada 5 segundos
  });
};

export const useScannerMetrics = () => {
  return useQuery({
    queryKey: ['scanner-metrics'],
    queryFn: ScannerService.getMetrics,
    refetchInterval: 30000,
  });
};

export const useCreateScanSession = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (sessionData: any) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return ScannerService.createSession({
        ...sessionData,
        user_id: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-scan-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['scanner-metrics'] });
      toast.success('Sesión de escaneo iniciada');
    },
    onError: (error: any) => {
      console.error('Error creating scan session:', error);
      toast.error('Error al iniciar la sesión de escaneo');
    },
  });
};

export const useCreateScanDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ScannerService.createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-devices'] });
      queryClient.invalidateQueries({ queryKey: ['scanner-metrics'] });
      toast.success('Dispositivo registrado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error creating scan device:', error);
      toast.error('Error al registrar el dispositivo');
    },
  });
};

export const useUpdateDeviceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deviceId, status }: { deviceId: string; status: 'connected' | 'disconnected' | 'error' | 'idle' }) =>
      ScannerService.updateDeviceStatus(deviceId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-devices'] });
    },
    onError: (error: any) => {
      console.error('Error updating device status:', error);
      toast.error('Error al actualizar el estado del dispositivo');
    },
  });
};

export const usePauseSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => ScannerService.pauseSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-scan-sessions'] });
      toast.success('Sesión pausada');
    },
    onError: (error: any) => {
      console.error('Error pausing session:', error);
      toast.error('Error al pausar la sesión');
    },
  });
};

export const useResumeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => ScannerService.resumeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-scan-sessions'] });
      toast.success('Sesión reanudada');
    },
    onError: (error: any) => {
      console.error('Error resuming session:', error);
      toast.error('Error al reanudar la sesión');
    },
  });
};

export const useEndSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => ScannerService.endSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-scan-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['scanner-metrics'] });
      toast.success('Sesión finalizada');
    },
    onError: (error: any) => {
      console.error('Error ending session:', error);
      toast.error('Error al finalizar la sesión');
    },
  });
};

export const useProcessScan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (scanData: any) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return ScannerService.processScan({
        ...scanData,
        user_id: user.id
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['scan-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['scanner-metrics'] });
      
      if (result?.validation_status === 'valid') {
        toast.success('Escaneo procesado correctamente');
      } else {
        toast.error(result?.validation_message || 'Error en el escaneo');
      }
    },
    onError: (error: any) => {
      console.error('Error processing scan:', error);
      toast.error('Error al procesar el escaneo');
    },
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
      toast.success('Regla de validación creada');
    },
    onError: (error: any) => {
      console.error('Error creating validation rule:', error);
      toast.error('Error al crear la regla de validación');
    },
  });
};

export const useAssignDevice = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ deviceId, userId, assignmentType }: { 
      deviceId: string; 
      userId: string; 
      assignmentType: 'permanent' | 'temporary' | 'shift_based' 
    }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return ScannerService.assignDevice(deviceId, userId, user.id, assignmentType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-assignments'] });
      toast.success('Dispositivo asignado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error assigning device:', error);
      toast.error('Error al asignar el dispositivo');
    },
  });
};

export const useDeviceAssignments = (userId?: string) => {
  return useQuery({
    queryKey: ['device-assignments', userId],
    queryFn: () => ScannerService.getDeviceAssignments(userId),
    enabled: !!userId,
  });
};

export const useScannerSettings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['scanner-settings', user?.id],
    queryFn: () => user?.id ? ScannerService.getScannerSettings(user.id) : null,
    enabled: !!user?.id,
  });
};

export const useUpdateScannerSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (settings: any) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return ScannerService.updateScannerSettings(user.id, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scanner-settings'] });
      toast.success('Configuración actualizada');
    },
    onError: (error: any) => {
      console.error('Error updating scanner settings:', error);
      toast.error('Error al actualizar la configuración');
    },
  });
};

// Hook específico para el soporte de cámara
export const useCameraSupport = () => {
  return useQuery({
    queryKey: ['camera-support'],
    queryFn: ScannerService.isCameraSupported,
    staleTime: 300000, // 5 minutos
  });
};

export const useCameraDevices = () => {
  return useQuery({
    queryKey: ['camera-devices'],
    queryFn: ScannerService.getCameraDevices,
    staleTime: 60000, // 1 minuto
  });
};
