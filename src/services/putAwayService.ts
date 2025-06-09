
import { browserStorage } from '@/lib/browserStorage';
import { Pallet, PutAwayTask, PutAwayRule, OperatorPerformance, PutAwayMetrics, LocationConfirmation } from '@/types/putaway';
import { Location } from '@/types/inventory';

export class PutAwayService {
  static async getPendingPallets(): Promise<Pallet[]> {
    try {
      const pallets = await browserStorage.find('pallets', { status: 'waiting_putaway' });
      return pallets.map(pallet => ({
        ...pallet,
        id: pallet._id || pallet.id,
      }));
    } catch (error) {
      console.error('Error getting pending pallets:', error);
      return [];
    }
  }

  static async getActiveTasks(operatorId?: string): Promise<PutAwayTask[]> {
    try {
      const filter = operatorId 
        ? { operator_id: operatorId, status: 'in_progress' }
        : { status: 'in_progress' };
      
      const tasks = await browserStorage.find('putaway_tasks', filter);
      return tasks.map(task => ({
        ...task,
        id: task._id || task.id,
      }));
    } catch (error) {
      console.error('Error getting active tasks:', error);
      return [];
    }
  }

  static async claimPallet(palletId: string, operatorId: string): Promise<PutAwayTask> {
    try {
      // Verificar que el palet esté disponible
      const pallet = await browserStorage.findOne('pallets', { id: palletId, status: 'waiting_putaway' });
      if (!pallet) {
        throw new Error('Palet no disponible o ya asignado');
      }

      // Actualizar estado del palet
      await browserStorage.updateOne('pallets', { id: palletId }, {
        status: 'in_process',
        assigned_to: operatorId,
        assigned_at: new Date().toISOString()
      });

      // Buscar ubicación sugerida
      const suggestedLocation = await this.findOptimalLocation(pallet);

      // Crear tarea de Put Away
      const task: PutAwayTask = {
        id: `task_${Date.now()}`,
        task_number: `PA-${Date.now()}`,
        pallet_id: palletId,
        operator_id: operatorId,
        suggested_location_id: suggestedLocation.id!,
        status: 'in_progress',
        priority: 'medium',
        started_at: new Date().toISOString(),
      };

      await browserStorage.insertOne('putaway_tasks', task);
      return task;
    } catch (error) {
      console.error('Error claiming pallet:', error);
      throw error;
    }
  }

  static async completeTask(taskId: string, locationId: string, confirmationCode: string): Promise<boolean> {
    try {
      // Verificar código de confirmación
      const location = await browserStorage.findOne('locations', { id: locationId });
      if (!location || location.confirmation_code !== confirmationCode) {
        throw new Error('Código de confirmación incorrecto');
      }

      // Obtener tarea
      const task = await browserStorage.findOne('putaway_tasks', { id: taskId });
      if (!task) {
        throw new Error('Tarea no encontrada');
      }

      // Completar tarea
      const completedAt = new Date().toISOString();
      const startedAt = new Date(task.started_at);
      const duration = Math.round((new Date(completedAt).getTime() - startedAt.getTime()) / 60000);

      await browserStorage.updateOne('putaway_tasks', { id: taskId }, {
        status: 'completed',
        actual_location_id: locationId,
        completed_at: completedAt,
        confirmation_code_entered: confirmationCode,
        duration_minutes: duration
      });

      // Actualizar palet
      await browserStorage.updateOne('pallets', { id: task.pallet_id }, {
        status: 'stored',
        location_id: locationId,
        completed_at: completedAt
      });

      // Actualizar ubicación
      await browserStorage.updateOne('locations', { id: locationId }, {
        occupancy_status: 'occupied',
        current_occupancy: (location.current_occupancy || 0) + 1,
        last_verified_at: new Date()
      });

      // Crear movimiento de stock
      const pallet = await browserStorage.findOne('pallets', { id: task.pallet_id });
      if (pallet) {
        const stockMovement = {
          id: `mov_${Date.now()}`,
          product_id: pallet.product_id,
          to_location_id: locationId,
          quantity: pallet.quantity,
          movement_type: 'putaway',
          reference_type: 'putaway_task',
          reference_id: taskId,
          reason: 'Put Away completado',
          performed_by: task.operator_id,
          timestamp: new Date(),
          status: 'completed',
          user_id: 'system',
          pallet_id: task.pallet_id
        };
        await browserStorage.insertOne('stock_movements', stockMovement);
      }

      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  static async cancelTask(taskId: string, reason: string): Promise<void> {
    try {
      const task = await browserStorage.findOne('putaway_tasks', { id: taskId });
      if (!task) {
        throw new Error('Tarea no encontrada');
      }

      // Cancelar tarea
      await browserStorage.updateOne('putaway_tasks', { id: taskId }, {
        status: 'cancelled',
        notes: reason,
        completed_at: new Date().toISOString()
      });

      // Liberar palet
      await browserStorage.updateOne('pallets', { id: task.pallet_id }, {
        status: 'waiting_putaway',
        assigned_to: null,
        assigned_at: null
      });
    } catch (error) {
      console.error('Error canceling task:', error);
      throw error;
    }
  }

  static async getOperatorPerformance(operatorId: string, dateFrom?: string, dateTo?: string): Promise<OperatorPerformance[]> {
    try {
      const performance = await browserStorage.find('operator_performance', { operator_id: operatorId });
      return performance.map(perf => ({
        ...perf,
        id: perf._id || perf.id,
      }));
    } catch (error) {
      console.error('Error getting operator performance:', error);
      return [];
    }
  }

  static async getMetrics(): Promise<PutAwayMetrics> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const todayTasks = await browserStorage.find('putaway_tasks', {});
      const pendingPallets = await browserStorage.find('pallets', { status: 'waiting_putaway' });
      const activeTasks = await browserStorage.find('putaway_tasks', { status: 'in_progress' });

      const completedToday = todayTasks.filter(task => 
        task.completed_at && task.completed_at.startsWith(today) && task.status === 'completed'
      );

      const averageTime = completedToday.length > 0 
        ? completedToday.reduce((sum, task) => sum + (task.duration_minutes || 0), 0) / completedToday.length
        : 0;

      return {
        today_tasks: completedToday.length,
        pending_pallets: pendingPallets.length,
        active_operators: new Set(activeTasks.map(task => task.operator_id)).size,
        average_completion_time: Math.round(averageTime),
        error_rate: 0, // TODO: Calculate based on errors
        efficiency_percentage: 85 // TODO: Calculate based on performance
      };
    } catch (error) {
      console.error('Error getting metrics:', error);
      return {
        today_tasks: 0,
        pending_pallets: 0,
        active_operators: 0,
        average_completion_time: 0,
        error_rate: 0,
        efficiency_percentage: 0
      };
    }
  }

  static async getPutAwayRules(): Promise<PutAwayRule[]> {
    try {
      const rules = await browserStorage.find('putaway_rules', { is_active: true });
      return rules.map(rule => ({
        ...rule,
        id: rule._id || rule.id,
      }));
    } catch (error) {
      console.error('Error getting put away rules:', error);
      return [];
    }
  }

  private static async findOptimalLocation(pallet: Pallet): Promise<Location> {
    try {
      // Buscar ubicaciones disponibles
      const availableLocations = await browserStorage.find('locations', {
        occupancy_status: 'available',
        is_active: true
      });

      if (availableLocations.length === 0) {
        throw new Error('No hay ubicaciones disponibles');
      }

      // Aplicar reglas de Put Away
      const rules = await this.getPutAwayRules();
      let preferredLocations = availableLocations;

      // Aplicar filtros básicos (peso, temperatura, etc.)
      if (pallet.weight && pallet.weight > 500) {
        preferredLocations = preferredLocations.filter(loc => 
          loc.type === 'bin' && (!loc.restrictions?.max_weight || loc.restrictions.max_weight >= pallet.weight!)
        );
      }

      // Si no hay ubicaciones después de filtros, usar cualquier disponible
      if (preferredLocations.length === 0) {
        preferredLocations = availableLocations;
      }

      // Seleccionar la primera ubicación disponible (lógica simple)
      const selectedLocation = preferredLocations[0];
      return {
        ...selectedLocation,
        id: selectedLocation._id || selectedLocation.id,
      };
    } catch (error) {
      console.error('Error finding optimal location:', error);
      throw error;
    }
  }

  static async getTaskHistory(operatorId?: string): Promise<PutAwayTask[]> {
    try {
      const filter = operatorId 
        ? { operator_id: operatorId, status: { $in: ['completed', 'cancelled'] } }
        : { status: { $in: ['completed', 'cancelled'] } };
      
      const tasks = await browserStorage.find('putaway_tasks', filter);
      return tasks.map(task => ({
        ...task,
        id: task._id || task.id,
      })).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    } catch (error) {
      console.error('Error getting task history:', error);
      return [];
    }
  }

  static async validateLocationCode(locationId: string, code: string): Promise<boolean> {
    try {
      const location = await browserStorage.findOne('locations', { id: locationId });
      return location && location.confirmation_code === code;
    } catch (error) {
      console.error('Error validating location code:', error);
      return false;
    }
  }
}
