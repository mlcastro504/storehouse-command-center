import { BrowserStorage } from '@/lib/browserStorage';
import { Pallet, PutAwayTask, PutAwayRule, OperatorPerformance, PutAwayMetrics } from '@/types/putaway';

export async function populateTaskDetails(task: any): Promise<PutAwayTask> {
  const populatedTask = { ...task, id: task._id || task.id };

  if (task.pallet_id) {
      const pallet = await BrowserStorage.findOne('pallets', { id: task.pallet_id });
      if (pallet) {
          populatedTask.pallet = pallet;
          if (pallet.product_id) {
              const product = await BrowserStorage.findOne('products', { id: pallet.product_id });
              if (product) {
                  // @ts-ignore
                  pallet.product = product;
                  populatedTask.product = product;
              }
          }
      }
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

export async function getPendingPallets(): Promise<Pallet[]> {
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

export async function getActiveTasks(operatorId?: string): Promise<PutAwayTask[]> {
  try {
    const filter = operatorId 
      ? { operator_id: operatorId, status: 'in_progress' }
      : { status: 'in_progress' };
    
    const tasks = await BrowserStorage.find('putaway_tasks', filter);
    return Promise.all(tasks.map(task => populateTaskDetails(task)));
  } catch (error) {
    console.error('Error getting active tasks:', error);
    return [];
  }
}

export async function getOperatorPerformance(operatorId: string, dateFrom?: string, dateTo?: string): Promise<OperatorPerformance[]> {
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

export async function getMetrics(): Promise<PutAwayMetrics> {
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

export async function getPutAwayRules(): Promise<PutAwayRule[]> {
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

export async function getTaskHistory(operatorId?: string): Promise<PutAwayTask[]> {
  try {
    const filter = operatorId 
      ? { operator_id: operatorId, status: { $in: ['completed', 'cancelled'] } }
      : { status: { $in: ['completed', 'cancelled'] } };
    
    const tasks = await BrowserStorage.find('putaway_tasks', filter);
    const populatedTasks = await Promise.all(tasks.map(task => populateTaskDetails(task)));
    return populatedTasks.sort((a, b) => new Date(b.completed_at || b.created_date).getTime() - new Date(a.completed_at || a.created_date).getTime());
  } catch (error) {
    console.error('Error getting task history:', error);
    return [];
  }
}

export async function validateLocationCode(locationId: string, code: string): Promise<boolean> {
  try {
    const location = await BrowserStorage.findOne('locations', { id: locationId });
    return location && location.confirmation_code === code;
  } catch (error) {
    console.error('Error validating location code:', error);
    return false;
  }
}

export async function getPutAwayTasks(): Promise<PutAwayTask[]> {
  try {
    const tasks = await BrowserStorage.find('putaway_tasks', {});
    return Promise.all(tasks.map(task => populateTaskDetails(task)));
  } catch (error) {
    console.error('Error getting put away tasks:', error);
    return [];
  }
}

export async function getProducts(): Promise<any[]> {
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

export async function getLocations(): Promise<any[]> {
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
