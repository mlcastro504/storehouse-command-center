
import { browserStorage } from '@/lib/browserStorage';
import { PutAwayTask, PutAwayRule, PutAwayPerformance } from '@/types/putaway';

export const PutAwayService = {
  // Tasks CRUD
  async getTasks() {
    try {
      const tasks = await browserStorage.find('putaway_tasks');
      
      // Enrich with product and location data
      const enrichedTasks = await Promise.all(
        tasks.map(async (task: any) => {
          const product = await browserStorage.findOne('products', { id: task.product_id });
          const fromLocation = await browserStorage.findOne('locations', { id: task.from_location_id });
          const toLocation = await browserStorage.findOne('locations', { id: task.to_location_id });
          
          return {
            ...task,
            product,
            from_location: fromLocation,
            to_location: toLocation,
          };
        })
      );
      
      return enrichedTasks;
    } catch (error) {
      console.error('Error fetching put away tasks:', error);
      throw error;
    }
  },

  async createTask(task: Omit<PutAwayTask, 'id'>) {
    try {
      return await browserStorage.insertOne('putaway_tasks', {
        ...task,
        user_id: 'user_123', // TODO: Get from auth context
      });
    } catch (error) {
      console.error('Error creating put away task:', error);
      throw error;
    }
  },

  async updateTask(id: string, updates: Partial<PutAwayTask>) {
    try {
      const result = await browserStorage.updateOne('putaway_tasks', { id }, updates);
      return result !== null;
    } catch (error) {
      console.error('Error updating put away task:', error);
      throw error;
    }
  },

  async deleteTask(id: string) {
    try {
      return await browserStorage.deleteOne('putaway_tasks', { id });
    } catch (error) {
      console.error('Error deleting put away task:', error);
      throw error;
    }
  },

  // Rules CRUD
  async getRules() {
    try {
      return await browserStorage.find('putaway_rules');
    } catch (error) {
      console.error('Error fetching put away rules:', error);
      throw error;
    }
  },

  async createRule(rule: Omit<PutAwayRule, 'id'>) {
    try {
      return await browserStorage.insertOne('putaway_rules', {
        ...rule,
        user_id: 'user_123', // TODO: Get from auth context
      });
    } catch (error) {
      console.error('Error creating put away rule:', error);
      throw error;
    }
  },

  async updateRule(id: string, updates: Partial<PutAwayRule>) {
    try {
      const result = await browserStorage.updateOne('putaway_rules', { id }, updates);
      return result !== null;
    } catch (error) {
      console.error('Error updating put away rule:', error);
      throw error;
    }
  },

  async deleteRule(id: string) {
    try {
      return await browserStorage.deleteOne('putaway_rules', { id });
    } catch (error) {
      console.error('Error deleting put away rule:', error);
      throw error;
    }
  },

  // Performance analytics
  async getPerformance() {
    try {
      return await browserStorage.find('putaway_performance');
    } catch (error) {
      console.error('Error fetching put away performance:', error);
      throw error;
    }
  },

  // Initialize sample data
  async initializeSampleData() {
    const tasksCount = await browserStorage.count('putaway_tasks');
    
    if (tasksCount === 0) {
      console.log('Inicializando datos de ejemplo para Put Away...');
      
      // Get some existing products and locations
      const products = await browserStorage.find('products');
      const locations = await browserStorage.find('locations');
      
      if (products.length > 0 && locations.length > 0) {
        // Sample put away tasks
        const sampleTasks = [
          {
            task_number: 'PA-001',
            product_id: products[0].id,
            from_location_id: locations[0]?.id,
            to_location_id: locations[0]?.id,
            quantity_to_putaway: 50,
            quantity_completed: 0,
            status: 'pending',
            priority: 'medium',
            assigned_to: 'Juan Pérez',
            created_by: 'user_123',
            created_date: new Date().toISOString(),
            quality_check_required: false,
            user_id: 'user_123'
          },
          {
            task_number: 'PA-002',
            product_id: products[0].id,
            from_location_id: locations[0]?.id,
            to_location_id: locations[0]?.id,
            quantity_to_putaway: 25,
            quantity_completed: 15,
            status: 'in_progress',
            priority: 'high',
            assigned_to: 'María García',
            created_by: 'user_123',
            created_date: new Date().toISOString(),
            started_date: new Date().toISOString(),
            quality_check_required: true,
            user_id: 'user_123'
          }
        ];

        for (const task of sampleTasks) {
          await browserStorage.insertOne('putaway_tasks', task);
        }

        console.log('Datos de ejemplo de Put Away inicializados correctamente');
      }
    }
  }
};
