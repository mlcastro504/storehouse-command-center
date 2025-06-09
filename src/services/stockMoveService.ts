import { BrowserStorage } from '@/lib/browserStorage';

export interface StockMoveTask {
  id: string;
  product_id: string;
  quantity_needed: number;
  source_location_id: string;
  destination_location_id: string;
  task_type: 'replenishment' | 'relocation' | 'consolidation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  assigned_at?: string;
  started_at?: string;
  completed_at?: string;
  validation_code_required: boolean;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  products?: any;
  source_location?: any;
  destination_location?: any;
}

export interface StockMoveExecution {
  id: string;
  task_id: string;
  executed_by: string;
  quantity_moved: number;
  validation_code_used: string;
  scan_records: string[];
  execution_status: 'completed' | 'partial' | 'failed';
  execution_notes?: string;
  started_at: string;
  completed_at: string;
  task?: any;
}

export class StockMoveService {
  // Obtener tareas pendientes
  static async getPendingTasks(): Promise<StockMoveTask[]> {
    try {
      const tasks = await BrowserStorage.find('stock_move_tasks', { 
        status: { $in: ['pending', 'assigned'] }
      });

      // Enriquecer con datos relacionados
      const enrichedTasks = await Promise.all(tasks.map(async (task) => {
        const product = await BrowserStorage.findOne('products', { id: task.product_id });
        const sourceLocation = await BrowserStorage.findOne('locations', { id: task.source_location_id });
        const destinationLocation = await BrowserStorage.findOne('locations', { id: task.destination_location_id });

        return {
          ...task,
          id: task._id || task.id,
          products: product,
          source_location: sourceLocation,
          destination_location: destinationLocation
        };
      }));

      return enrichedTasks.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
      return [];
    }
  }

  // Obtener tareas asignadas a un usuario
  static async getMyTasks(userId: string): Promise<StockMoveTask[]> {
    try {
      const tasks = await BrowserStorage.find('stock_move_tasks', { 
        assigned_to: userId,
        status: { $in: ['assigned', 'in_progress'] }
      });

      // Enriquecer con datos relacionados
      const enrichedTasks = await Promise.all(tasks.map(async (task) => {
        const product = await BrowserStorage.findOne('products', { id: task.product_id });
        const sourceLocation = await BrowserStorage.findOne('locations', { id: task.source_location_id });
        const destinationLocation = await BrowserStorage.findOne('locations', { id: task.destination_location_id });

        return {
          ...task,
          id: task._id || task.id,
          products: product,
          source_location: sourceLocation,
          destination_location: destinationLocation
        };
      }));

      return enrichedTasks.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      return [];
    }
  }

  // Crear tarea manual
  static async createTask(taskData: any) {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };

    await BrowserStorage.insertOne('stock_move_tasks', newTask);
    return newTask;
  }

  // Tomar una tarea
  static async takeTask(taskId: string, userId: string): Promise<boolean> {
    try {
      const result = await BrowserStorage.updateOne('stock_move_tasks', 
        { id: taskId, status: 'pending' },
        {
          assigned_to: userId,
          assigned_at: new Date().toISOString(),
          status: 'assigned',
          updated_at: new Date().toISOString()
        }
      );

      return result;
    } catch (error) {
      console.error('Error taking task:', error);
      return false;
    }
  }

  // Iniciar una tarea
  static async startTask(taskId: string): Promise<boolean> {
    try {
      const result = await BrowserStorage.updateOne('stock_move_tasks',
        { id: taskId, status: 'assigned' },
        {
          started_at: new Date().toISOString(),
          status: 'in_progress',
          updated_at: new Date().toISOString()
        }
      );

      return result;
    } catch (error) {
      console.error('Error starting task:', error);
      return false;
    }
  }

  // Completar una tarea con validación
  static async completeTask(
    taskId: string,
    userId: string,
    quantityMoved: number,
    validationCode: string,
    executionNotes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Obtener información de la tarea
      const task = await BrowserStorage.findOne('stock_move_tasks', { id: taskId });
      if (!task) {
        return { success: false, message: 'Tarea no encontrada' };
      }

      // Obtener ubicación destino
      const destinationLocation = await BrowserStorage.findOne('locations', { id: task.destination_location_id });
      
      // Verificar código de validación
      if (!destinationLocation?.confirmation_code) {
        return { success: false, message: 'No se pudo verificar el código de validación de la ubicación destino' };
      }

      if (destinationLocation.confirmation_code !== validationCode) {
        return { success: false, message: 'Código de validación incorrecto. Verifique la ubicación destino.' };
      }

      // Crear registro de ejecución
      const execution: StockMoveExecution = {
        id: `exec_${Date.now()}`,
        task_id: taskId,
        executed_by: userId,
        quantity_moved: quantityMoved,
        validation_code_used: validationCode,
        execution_status: quantityMoved >= task.quantity_needed ? 'completed' : 'partial',
        execution_notes: executionNotes,
        scan_records: [],
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      };

      await BrowserStorage.insertOne('stock_move_executions', execution);

      // Actualizar estado de la tarea
      const newStatus = quantityMoved >= task.quantity_needed ? 'completed' : 'in_progress';
      await BrowserStorage.updateOne('stock_move_tasks', { id: taskId }, {
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      });

      // Actualizar niveles de stock
      await this.updateStockLevels(task, quantityMoved);

      return { 
        success: true, 
        message: quantityMoved >= task.quantity_needed 
          ? 'Tarea completada exitosamente' 
          : 'Movimiento parcial registrado correctamente'
      };
    } catch (error) {
      console.error('Error completing task:', error);
      return { success: false, message: 'Error al completar la tarea' };
    }
  }

  // Actualizar niveles de stock después de un movimiento
  private static async updateStockLevels(task: any, quantityMoved: number): Promise<void> {
    try {
      // Reducir stock en ubicación origen
      const sourceStock = await BrowserStorage.findOne('stock_levels', {
        product_id: task.product_id,
        location_id: task.source_location_id
      });

      if (sourceStock) {
        await BrowserStorage.updateOne('stock_levels', 
          { product_id: task.product_id, location_id: task.source_location_id },
          {
            quantity_available: Math.max(0, sourceStock.quantity_available - quantityMoved),
            last_updated: new Date().toISOString()
          }
        );
      }

      // Aumentar stock en ubicación destino
      const existingStock = await BrowserStorage.findOne('stock_levels', {
        product_id: task.product_id,
        location_id: task.destination_location_id
      });

      if (existingStock) {
        // Actualizar stock existente
        await BrowserStorage.updateOne('stock_levels',
          { product_id: task.product_id, location_id: task.destination_location_id },
          {
            quantity_available: existingStock.quantity_available + quantityMoved,
            last_updated: new Date().toISOString()
          }
        );
      } else {
        // Crear nuevo registro de stock
        await BrowserStorage.insertOne('stock_levels', {
          id: `stock_${Date.now()}`,
          product_id: task.product_id,
          location_id: task.destination_location_id,
          quantity_available: quantityMoved,
          quantity_on_order: 0,
          quantity_reserved: 0,
          user_id: task.user_id,
          last_updated: new Date().toISOString()
        });
      }

      // Registrar movimiento de stock
      await BrowserStorage.insertOne('stock_movements', {
        id: `mov_${Date.now()}`,
        product_id: task.product_id,
        from_location_id: task.source_location_id,
        to_location_id: task.destination_location_id,
        quantity: quantityMoved,
        movement_type: 'transfer',
        reason: `Stock Move Task: ${task.task_type}`,
        performed_by: task.assigned_to,
        reference_type: 'stock_move_task',
        reference_id: task.id,
        user_id: task.user_id,
        timestamp: new Date(),
        status: 'completed'
      });

    } catch (error) {
      console.error('Error updating stock levels:', error);
      throw error;
    }
  }

  // Crear tarea manual
  static async createManualTask(taskData: {
    product_id: string;
    quantity_needed: number;
    source_location_id: string;
    destination_location_id: string;
    task_type: 'replenishment' | 'relocation' | 'consolidation';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
    user_id: string;
  }): Promise<StockMoveTask | null> {
    try {
      const task: StockMoveTask = {
        id: `task_${Date.now()}`,
        ...taskData,
        status: 'pending',
        validation_code_required: true,
        created_by: taskData.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await BrowserStorage.insertOne('stock_move_tasks', task);
      return task;
    } catch (error) {
      console.error('Error creating manual task:', error);
      return null;
    }
  }

  // Obtener historial de ejecuciones
  static async getExecutionHistory(userId?: string): Promise<StockMoveExecution[]> {
    try {
      const filter = userId ? { assigned_to: userId } : {};
      const executions = await BrowserStorage.find('stock_move_executions', filter);

      // Enriquecer con datos de tarea y producto
      const enrichedExecutions = await Promise.all(executions.map(async (execution) => {
        const task = await BrowserStorage.findOne('stock_move_tasks', { id: execution.task_id });
        let product = null;
        
        if (task) {
          product = await BrowserStorage.findOne('products', { id: task.product_id });
        }

        return {
          ...execution,
          id: execution._id || execution.id,
          scan_records: Array.isArray(execution.scan_records) ? execution.scan_records : [],
          task: task ? {
            ...task,
            products: product
          } : null
        };
      }));

      return enrichedExecutions.sort((a, b) => 
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching execution history:', error);
      return [];
    }
  }

  // Obtener métricas del módulo
  static async getMetrics(): Promise<{
    totalPendingTasks: number;
    totalInProgress: number;
    totalCompletedToday: number;
    averageCompletionTime: number;
    urgentTasks: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tasks = await BrowserStorage.find('stock_move_tasks', {});

      const metrics = {
        totalPendingTasks: tasks.filter(t => t.status === 'pending').length,
        totalInProgress: tasks.filter(t => ['assigned', 'in_progress'].includes(t.status)).length,
        totalCompletedToday: tasks.filter(t => 
          t.status === 'completed' && 
          t.completed_at?.startsWith(today)
        ).length,
        averageCompletionTime: 0,
        urgentTasks: tasks.filter(t => 
          ['pending', 'assigned'].includes(t.status) && 
          t.priority === 'urgent'
        ).length,
      };

      // Calcular tiempo promedio de completado
      const completedTasks = tasks.filter(t => 
        t.status === 'completed' && 
        t.created_at && 
        t.completed_at
      );

      if (completedTasks.length > 0) {
        const totalTime = completedTasks.reduce((sum, task) => {
          const start = new Date(task.created_at!);
          const end = new Date(task.completed_at!);
          return sum + (end.getTime() - start.getTime());
        }, 0);
        
        metrics.averageCompletionTime = Math.round(totalTime / completedTasks.length / (1000 * 60)); // en minutos
      }

      return metrics;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return {
        totalPendingTasks: 0,
        totalInProgress: 0,
        totalCompletedToday: 0,
        averageCompletionTime: 0,
        urgentTasks: 0,
      };
    }
  }

  // Obtener productos
  static async getProducts(): Promise<any[]> {
    try {
      const products = await BrowserStorage.find('products', { is_active: true });
      return products.map(product => ({
        ...product,
        id: product._id || product.id
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Obtener ubicaciones
  static async getLocations(): Promise<any[]> {
    try {
      const locations = await BrowserStorage.find('locations', { is_active: true });
      return locations.map(location => ({
        ...location,
        id: location._id || location.id
      }));
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  // Obtener tareas por ubicación
  static async getTasksByLocation(locationId: string): Promise<StockMoveTask[]> {
    const tasks = await BrowserStorage.find('stock_move_tasks');
    return tasks.filter(task => 
      task.source_location_id === locationId || 
      task.destination_location_id === locationId
    );
  }

  // Obtener tareas por producto
  static async getTasksByProduct(productId: string): Promise<StockMoveTask[]> {
    return await BrowserStorage.find('stock_move_tasks', { product_id: productId });
  }

  // Actualizar prioridad de tarea
  static async updateTaskPriority(taskId: string, priority: 'low' | 'medium' | 'high' | 'urgent') {
    const result = await BrowserStorage.updateOne('stock_move_tasks',
      { id: taskId },
      { $set: { priority, updated_at: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  // Asignar múltiples tareas a un usuario
  static async bulkAssignTasks(taskIds: string[], userId: string) {
    let successCount = 0;
    
    for (const taskId of taskIds) {
      const result = await BrowserStorage.updateOne('stock_move_tasks',
        { id: taskId },
        { $set: { assigned_to: userId, status: 'assigned', updated_at: new Date() } }
      );
      if (result.modifiedCount > 0) {
        successCount++;
      }
    }
    
    return successCount;
  }

  // Obtener estadísticas de tareas
  static async getTaskStatistics() {
    const tasks = await BrowserStorage.find('stock_move_tasks');
    
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityCounts = tasks.reduce((acc, task) => {
      const priority = task.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_tasks: tasks.length,
      status_distribution: statusCounts,
      priority_distribution: priorityCounts,
      average_completion_time: this.calculateAverageCompletionTime(tasks)
    };
  }

  // Calcular tiempo promedio de completado
  private static calculateAverageCompletionTime(tasks: any[]): number {
    const completedTasks = tasks.filter(task => 
      task.status === 'completed' && task.started_at && task.completed_at
    );

    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      const startTime = new Date(task.started_at).getTime();
      const endTime = new Date(task.completed_at).getTime();
      return sum + (endTime - startTime);
    }, 0);

    return Math.round(totalTime / completedTasks.length / 1000 / 60); // Return in minutes
  }

  // Obtener métricas del dashboard
  static async getDashboardMetrics() {
    const allTasks = await BrowserStorage.find('stock_move_tasks');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingTasks = allTasks.filter(task => task.status === 'pending');
    const inProgressTasks = allTasks.filter(task => task.status === 'in_progress');
    const completedToday = allTasks.filter(task => 
      task.status === 'completed' && 
      new Date(task.completed_at) >= today
    );

    const products = await BrowserStorage.find('products');
    const locations = await BrowserStorage.find('locations');
    const stockLevels = await BrowserStorage.find('stock_levels');

    return {
      pending_tasks: pendingTasks.length,
      in_progress_tasks: inProgressTasks.length,
      completed_today: completedToday.length,
      total_products: products.length,
      total_locations: locations.length,
      low_stock_items: stockLevels.filter(level => level.quantity < 10).length
    };
  }

  // Ejecutar tarea
  static async executeTask(taskId: string, executionData: any) {
    // Get the task first
    const task = await BrowserStorage.findOne('stock_move_tasks', { id: taskId });
    if (!task) {
      throw new Error('Task not found');
    }

    // Validate required data
    const sourceLocation = await BrowserStorage.findOne('locations', { id: task.source_location_id });
    const targetLocation = await BrowserStorage.findOne('locations', { id: task.target_location_id });
    const product = await BrowserStorage.findOne('products', { id: task.product_id });

    if (!sourceLocation || !targetLocation || !product) {
      throw new Error('Invalid task data - missing locations or product');
    }

    // Update stock levels
    await BrowserStorage.updateOne('stock_levels',
      { 
        product_id: task.product_id, 
        location_id: task.source_location_id 
      },
      { $inc: { quantity: -task.quantity } }
    );

    await BrowserStorage.updateOne('stock_levels',
      { 
        product_id: task.product_id, 
        location_id: task.target_location_id 
      },
      { $inc: { quantity: task.quantity } }
    );

    // Mark task as completed
    const result = await BrowserStorage.updateOne('stock_move_tasks',
      { id: taskId },
      { $set: { 
        status: 'completed', 
        completed_at: new Date(), 
        updated_at: new Date(),
        execution_data: executionData
      }}
    );

    return result.modifiedCount > 0;
  }
}
