
import { BrowserStorage } from '@/lib/browserStorage';
import { Pallet, PutAwayTask, PutAwayRule } from '@/types/putaway';
import { Location } from '@/types/inventory';
import { getPutAwayRules } from './putAwayQueryService';

async function cleanUpExpiredReservations() {
  const now = new Date().toISOString();
  const reservedLocations = await BrowserStorage.find('locations', { occupancy_status: 'reserved' });
  
  for (const location of reservedLocations) {
    if (location.reserved_until && location.reserved_until < now) {
      await BrowserStorage.updateOne('locations', { id: location.id }, {
        $set: {
          occupancy_status: 'available',
          reserved_for_task_id: null,
          reserved_until: null,
        }
      });
      console.log(`Reservation for location ${location.code} expired and has been released.`);
    }
  }
}

async function findOptimalLocation(pallet: Pallet): Promise<Location> {
  try {
    await cleanUpExpiredReservations();

    const availableLocations = await BrowserStorage.find('locations', {
      occupancy_status: 'available',
      is_active: true
    });

    if (availableLocations.length === 0) {
      throw new Error('No hay ubicaciones disponibles');
    }

    const rules = await getPutAwayRules();

    const scoredLocations = availableLocations.map(location => {
      let score = 0;

      // Rule-based scoring
      for (const rule of rules) {
        if (!rule.is_active) continue;

        const conditionsMet = rule.conditions.every(condition => {
          switch (condition.field) {
            case 'weight':
              if (pallet.weight) {
                if (condition.operator === 'greater_than') return pallet.weight > condition.value;
                if (condition.operator === 'less_than') return pallet.weight < condition.value;
              }
              return false;
            case 'special_requirement':
              if (pallet.special_requirements) {
                if (condition.operator === 'equals') return pallet.special_requirements.includes(condition.value);
                if (condition.operator === 'contains') return pallet.special_requirements.includes(condition.value);
              }
              return false;
            case 'product_category':
              if (pallet.product_category) {
                if (condition.operator === 'equals') return pallet.product_category === condition.value;
              }
              return false;
            default:
              return false;
          }
        });

        if (conditionsMet) {
          if (location.type === rule.location_preference) {
            score += rule.priority * 10;
          }
        }
      }

      // Constraint-based scoring (penalties for violations)
      if (location.restrictions) {
        if (location.restrictions.max_weight && pallet.weight && pallet.weight > location.restrictions.max_weight) {
          return { location, score: -Infinity }; // Invalid location
        }
        if (location.restrictions.temperature_controlled && !pallet.special_requirements?.includes('cold_storage')) {
          score -= 20;
        }
      }
      
      // Heuristic-based scoring
      if (pallet.weight && pallet.weight > 500 && location.type === 'ground_level') {
          score += 50;
      }
      if (pallet.special_requirements?.includes('cold_storage') && location.type === 'cold_zone') {
          score += 100;
      }

      // Prefer non-specialized locations for general products
      if (!pallet.special_requirements?.length && (location.type === 'cold_zone' || location.type === 'dry_zone' || location.type === 'ground_level')) {
          score -= 10;
      } else if (location.type === 'shelf') {
          score += 5;
      }

      return { location, score };
    });

    const sortedLocations = scoredLocations
      .filter(item => item.score > -Infinity)
      .sort((a, b) => b.score - a.score);
    
    if (sortedLocations.length === 0) {
      const fallbackLocation = availableLocations[0];
       if (!fallbackLocation) {
        throw new Error('No hay ubicaciones disponibles.');
      }
      return { ...fallbackLocation, id: fallbackLocation._id || fallbackLocation.id };
    }
    
    const selectedLocation = sortedLocations[0].location;

    return {
      ...selectedLocation,
      id: selectedLocation._id || selectedLocation.id,
    };
  } catch (error) {
    console.error('Error finding optimal location:', error);
    const availableLocations = await BrowserStorage.find('locations', { occupancy_status: 'available', is_active: true });
    if (availableLocations && availableLocations.length > 0) {
        const fallbackLocation = availableLocations[0];
        return { ...fallbackLocation, id: fallbackLocation._id || fallbackLocation.id };
    }
    throw new Error('No available locations found.');
  }
}

export async function claimPallet(palletId: string, operatorId: string): Promise<PutAwayTask> {
  try {
    const pallet = await BrowserStorage.findOne('pallets', { id: palletId, status: 'waiting_putaway' });
    if (!pallet) {
      throw new Error('Palet no disponible o ya asignado');
    }

    const suggestedLocation = await findOptimalLocation(pallet);

    const taskId = `task_${Date.now()}`;

    const task: PutAwayTask = {
      id: taskId,
      _id: taskId,
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
    
    const reservationTime = 10 * 60 * 1000; // 10 minutes
    const reservedUntil = new Date(Date.now() + reservationTime).toISOString();
    
    await BrowserStorage.updateOne('locations', { id: suggestedLocation.id }, {
      $set: {
        occupancy_status: 'reserved',
        reserved_for_task_id: task.id,
        reserved_until: reservedUntil,
      }
    });

    await BrowserStorage.updateOne('pallets', { id: palletId }, {
      $set: {
        status: 'in_process',
        assigned_to: operatorId,
        assigned_at: new Date().toISOString()
      }
    });

    await BrowserStorage.insertOne('putaway_tasks', task);
    return task;
  } catch (error) {
    console.error('Error claiming pallet:', error);
    throw error;
  }
}

export async function completeTask(taskId: string, locationId: string, confirmationCode: string): Promise<boolean> {
  try {
    const location = await BrowserStorage.findOne('locations', { id: locationId });
    if (!location || location.confirmation_code !== confirmationCode) {
      throw new Error('Código de confirmación incorrecto');
    }

    const task = await BrowserStorage.findOne('putaway_tasks', { id: taskId });
    if (!task) throw new Error('Tarea no encontrada');

    const completedAt = new Date().toISOString();
    const startedAt = new Date(task.started_at);
    const duration = Math.round((new Date(completedAt).getTime() - startedAt.getTime()) / 60000);

    await BrowserStorage.updateOne('putaway_tasks', { id: taskId }, {
      $set: {
        status: 'completed',
        actual_location_id: locationId,
        completed_at: completedAt,
        confirmation_code_entered: confirmationCode,
        duration_minutes: duration
      }
    });

    if (task.pallet_id) {
      await BrowserStorage.updateOne('pallets', { id: task.pallet_id }, {
        $set: {
          status: 'stored',
          location_id: locationId,
          completed_at: completedAt
        }
      });
    }

    await BrowserStorage.updateOne('locations', { id: locationId }, {
      $set: {
        occupancy_status: 'occupied',
        current_occupancy: (location.current_occupancy || 0) + 1,
        last_verified_at: new Date().toISOString(),
        reserved_for_task_id: null,
        reserved_until: null,
      }
    });

    // If the suggested location was different, release its reservation
    if (task.suggested_location_id && task.suggested_location_id !== locationId) {
        await BrowserStorage.updateOne('locations', { id: task.suggested_location_id, reserved_for_task_id: taskId }, {
            $set: {
                occupancy_status: 'available',
                reserved_for_task_id: null,
                reserved_until: null,
            }
        });
    }

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
        timestamp: new Date().toISOString(),
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
    if (!task) throw new Error('Tarea no encontrada');

    await BrowserStorage.updateOne('putaway_tasks', { id: taskId }, {
      $set: {
        status: 'cancelled',
        notes: reason,
        completed_at: new Date().toISOString()
      }
    });

    await BrowserStorage.updateOne('pallets', { id: task.pallet_id }, {
      $set: {
        status: 'waiting_putaway',
        assigned_to: null,
        assigned_at: null
      }
    });

    if (task.suggested_location_id) {
        const location = await BrowserStorage.findOne('locations', { id: task.suggested_location_id });
        if (location && location.reserved_for_task_id === taskId) {
            await BrowserStorage.updateOne('locations', { id: task.suggested_location_id }, {
                $set: {
                    occupancy_status: 'available',
                    reserved_for_task_id: null,
                    reserved_until: null,
                }
            });
        }
    }
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
