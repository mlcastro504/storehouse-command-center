
import { BrowserStorage } from '@/lib/browserStorage';
import { Pallet, PutAwayTask, PutAwayRule } from '@/types/putaway';
import { Location } from '@/types/inventory';
import { getPutAwayRules } from './putAwayQueryService';

async function findOptimalLocation(pallet: Pallet): Promise<Location> {
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
    const rules = await getPutAwayRules();
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

export async function claimPallet(palletId: string, operatorId: string): Promise<PutAwayTask> {
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
    const suggestedLocation = await findOptimalLocation(pallet);

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

export async function completeTask(taskId: string, locationId: string, confirmationCode: string): Promise<boolean> {
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

export async function cancelTask(taskId: string, reason: string): Promise<void> {
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

export async function createPutAwayRule(newRuleData: Partial<PutAwayRule>): Promise<PutAwayRule> {
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

export async function updatePutAwayRule(ruleToUpdate: PutAwayRule): Promise<PutAwayRule> {
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

export async function deletePutAwayRule(ruleId: string): Promise<boolean> {
  try {
    await BrowserStorage.deleteOne('putaway_rules', { id: ruleId });
    return true;
  } catch (error) {
    console.error('Error deleting put away rule:', error);
    throw error;
  }
}

export async function createPutAwayTask(taskData: any): Promise<PutAwayTask> {
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
