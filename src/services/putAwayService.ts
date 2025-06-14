import { BrowserStorage } from '@/lib/browserStorage';
import { Pallet, PutAwayTask, PutAwayRule, OperatorPerformance, PutAwayMetrics, LocationConfirmation } from '@/types/putaway';
import { Location } from '@/types/inventory';

export class PutAwayService {
  private static async populateTaskDetails(task: any): Promise<PutAwayTask> {
    const populatedTask = { ...task, id: task._id || task.id };

    if (task.pallet_id) {
        const pallet = await BrowserStorage.findOne('pallets', { id: task.pallet_id });
        if (pallet && pallet.product_id) {
            const product = await BrowserStorage.findOne('products', { id: pallet.product_id });
            pallet.product = product;
        }
        populatedTask.pallet = pallet;
    }
    
    if (task.product_id && !populatedTask.product) {
        const product = await BrowserStorage.findOne('products', { id: task.product_id });
        if (product) {
          populatedTask.product = product;
        }
    }
    if (task.from_location_id) {
        populatedTask.from_location = await BrowserStorage.findOne('locations', { id: task.from_location_id });
    }
    if (task.to_location_id) {
        populatedTask.to_location = await BrowserStorage.findOne('locations', { id: task.to_location_id });
    }
    if (task.suggested_location_id) {
        populatedTask.suggested_location = await BrowserStorage.findOne('locations', { id: task.suggested_location_id });
    }
    if (task.actual_location_id) {
        populatedTask.actual_location = await BrowserStorage.findOne('locations', { id: task.actual_location_id });
    }

    return populatedTask as PutAwayTask;
  }

  static async getPendingPallets(): Promise<Pallet[]> {
    try {
      const pallets = await BrowserStorage.find('pallets', { status: 'waiting_putaway' });
      return Promise.all(pallets.map(async (pallet) => {
        const populatedPallet = { ...pallet, id: pallet._id || pallet.id };
        if (pallet.product_id) {
            populatedPallet.product = await BrowserStorage.findOne('products', { id: pallet.product_id });
        }
        return populatedPallet;
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
      
      const tasks = await BrowserStorage.find('putaway_tasks', filter);
      return Promise.all(tasks.map(this.populateTaskDetails));
    } catch (error) {
      console.error('Error getting active tasks:', error);
      return [];
    }
  }

  static async claimPallet(palletId: string, operatorId: string): Promise<PutAwayTask> {
    try {
      // Verificar que el palet esté disponible
      const pallet = await BrowserStorage.findOne('pallets', { id: palletId, status: 'waiting_putaway' });
      if (!pallet) {
        throw new Error('Palet no disponible o ya asignado');
      }

      // Actualizar estado del palet
      await BrowserStorage.updateOne('pallets', { id: palletId }, {
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
        quantity_to_putaway: pallet.quantity || 1,
        created_date: new Date().toISOString(),
      };

      await BrowserStorage.insertOne('putaway_tasks', task);
      return task;
    } catch (error) {
      console.error('Error claiming pallet:', error);
      throw error;
    }
  }

  static async completeTask(taskId: string, locationId: string, confirmationCode: string): Promise<boolean> {
    try {
      // Verificar código de confirmación
      const location = await BrowserStorage.findOne('locations', { id: locationId });
      if (!location || location.confirmation_code !== confirmationCode) {
        throw new Error('Código de confirmación incorrecto');
      }

      // Obtener tarea
      const task = await BrowserStorage.findOne('putaway_tasks', { id: taskId });
      if (!task) {
        throw new Error('Tarea no encontrada');
      }

      // Completar tarea
      const completedAt = new Date().toISOString();
      const startedAt = new Date(task.started_at);
      const duration = Math.round((new Date(completedAt).getTime() - startedAt.getTime()) / 60000);

      await BrowserStorage.updateOne('putaway_tasks', { id: taskId }, {
        status: 'completed',
        actual_location_id: locationId,
        completed_at: completedAt,
        confirmation_code_entered: confirmationCode,
        duration_minutes: duration
      });

      // Actualizar palet
      if (task.pallet_id) {
        await BrowserStorage.updateOne('pallets', { id: task.pallet_id }, {
          status: 'stored',
          location_id: locationId,
          completed_at: completedAt
        });
      }

      // Actualizar ubicación
      await BrowserStorage.updateOne('locations', { id: locationId }, {
        occupancy_status: 'occupied',
        current_occupancy: (location.current_occupancy || 0) + 1,
        last_verified_at: new Date()
      });

      // Crear movimiento de stock
      const pallet = await BrowserStorage.findOne('pallets', { id: task.pallet_id });
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
        await BrowserStorage.insertOne('stock_movements', stockMovement);
      }

      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  static async cancelTask(taskId: string, reason: string): Promise<void> {
    try {
      const task = await BrowserStorage.findOne('putaway_tasks', { id: taskId });
      if (!task) {
        throw new Error('Tarea no encontrada');
      }

      // Cancelar tarea
      await BrowserStorage.updateOne('putaway_tasks', { id: taskId }, {
        status: 'cancelled',
        notes: reason,
        completed_at: new Date().toISOString()
      });

      // Liberar palet
      await BrowserStorage.updateOne('pallets', { id: task.pallet_id }, {
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
      const performance = await BrowserStorage.find('operator_performance', { operator_id: operatorId });
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
      
      const todayTasks = await BrowserStorage.find('putaway_tasks', {});
      const pendingPallets = await BrowserStorage.find('pallets', { status: 'waiting_putaway' });
      const activeTasks = await BrowserStorage.find('putaway_tasks', { status: 'in_progress' });

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
      const rules = await BrowserStorage.find('putaway_rules', {});
      return rules.map(rule => ({
        ...rule,
        id: rule._id || rule.id,
      }));
    } catch (error) {
      console.error('Error getting put away rules:', error);
      return [];
    }
  }

  static async createPutAwayRule(newRuleData: Partial<PutAwayRule>): Promise<PutAwayRule> {
    try {
      const fullRule: PutAwayRule = {
        id: `rule_${Date.now()}`,
        rule_name: newRuleData.rule_name || 'Untitled Rule',
        description: newRuleData.description,
        conditions: newRuleData.conditions || [],
        location_preference: newRuleData.location_preference || 'any',
        priority: newRuleData.priority || 99,
        is_active: newRuleData.is_active !== undefined ? newRuleData.is_active : true,
        created_by: 'system', // TODO: Replace with actual user ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const ruleToInsert = { ...fullRule, _id: fullRule.id };
      await BrowserStorage.insertOne('putaway_rules', ruleToInsert);
      return fullRule;
    } catch (error) {
      console.error('Error creating put away rule:', error);
      throw error;
    }
  }

  static async updatePutAwayRule(ruleToUpdate: PutAwayRule): Promise<PutAwayRule> {
    try {
      const { id, ...dataToUpdate } = ruleToUpdate;
      const updatePayload = { ...dataToUpdate, updated_at: new Date().toISOString() };
      await BrowserStorage.updateOne('putaway_rules', { id: id }, updatePayload);
      return ruleToUpdate;
    } catch (error) {
      console.error('Error updating put away rule:', error);
      throw error;
    }
  }

  static async deletePutAwayRule(ruleId: string): Promise<boolean> {
    try {
      await BrowserStorage.deleteOne('putaway_rules', { id: ruleId });
      return true;
    } catch (error) {
      console.error('Error deleting put away rule:', error);
      throw error;
    }
  }

  private static async findOptimalLocation(pallet: Pallet): Promise<Location> {
    try {
      // Buscar ubicaciones disponibles
      const availableLocations = await BrowserStorage.find('locations', {
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
      
      const tasks = await BrowserStorage.find('putaway_tasks', filter);
      const populatedTasks = await Promise.all(tasks.map(this.populateTaskDetails));
      return populatedTasks.sort((a, b) => new Date(b.completed_at || b.created_date).getTime() - new Date(a.completed_at || a.created_date).getTime());
    } catch (error) {
      console.error('Error getting task history:', error);
      return [];
    }
  }

  static async validateLocationCode(locationId: string, code: string): Promise<boolean> {
    try {
      const location = await BrowserStorage.findOne('locations', { id: locationId });
      return location && location.confirmation_code === code;
    } catch (error) {
      console.error('Error validating location code:', error);
      return false;
    }
  }

  static async createPutAwayTask(taskData: any): Promise<PutAwayTask> {
    try {
      const task = {
        ...taskData,
        id: `task_${Date.now()}`,
        _id: `task_${Date.now()}`,
      };
      await BrowserStorage.insertOne('putaway_tasks', task);
      return task;
    } catch (error) {
      console.error('Error creating put away task:', error);
      throw error;
    }
  }

  static async getPutAwayTasks(): Promise<PutAwayTask[]> {
    try {
      const tasks = await BrowserStorage.find('putaway_tasks', {});
      return Promise.all(tasks.map(this.populateTaskDetails));
    } catch (error) {
      console.error('Error getting put away tasks:', error);
      return [];
    }
  }

  static async getProducts(): Promise<any[]> {
    try {
      const products = await BrowserStorage.find('products', {});
      return products.map(product => ({
        ...product,
        id: product._id || product.id,
      }));
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  static async getLocations(): Promise<any[]> {
    try {
      const locations = await BrowserStorage.find('locations', {});
      return locations.map(location => ({
        ...location,
        id: location._id || location.id,
      }));
    } catch (error) {
      console.error('Error getting locations:', error);
      return [];
    }
  }
}
