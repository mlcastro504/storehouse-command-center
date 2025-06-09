
import { supabase } from '@/integrations/supabase/client';

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
}

export class StockMoveService {
  // Obtener tareas pendientes
  static async getPendingTasks(): Promise<StockMoveTask[]> {
    try {
      const { data, error } = await supabase
        .from('stock_move_tasks')
        .select(`
          *,
          products:product_id(name, sku),
          source_location:source_location_id(name, code, type),
          destination_location:destination_location_id(name, code, type, confirmation_code)
        `)
        .in('status', ['pending', 'assigned'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
      return [];
    }
  }

  // Obtener tareas asignadas a un usuario
  static async getMyTasks(userId: string): Promise<StockMoveTask[]> {
    try {
      const { data, error } = await supabase
        .from('stock_move_tasks')
        .select(`
          *,
          products:product_id(name, sku),
          source_location:source_location_id(name, code, type),
          destination_location:destination_location_id(name, code, type, confirmation_code)
        `)
        .eq('assigned_to', userId)
        .in('status', ['assigned', 'in_progress'])
        .order('priority', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      return [];
    }
  }

  // Tomar una tarea
  static async takeTask(taskId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stock_move_tasks')
        .update({
          assigned_to: userId,
          assigned_at: new Date().toISOString(),
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('status', 'pending');

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error taking task:', error);
      return false;
    }
  }

  // Iniciar una tarea
  static async startTask(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stock_move_tasks')
        .update({
          started_at: new Date().toISOString(),
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('status', 'assigned');

      if (error) throw error;
      return true;
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
      // Verificar que el código de validación es correcto
      const { data: task, error: taskError } = await supabase
        .from('stock_move_tasks')
        .select(`
          *,
          destination_location:destination_location_id(confirmation_code)
        `)
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;

      if (!task.destination_location?.confirmation_code) {
        return { success: false, message: 'No se pudo verificar el código de validación de la ubicación destino' };
      }

      if (task.destination_location.confirmation_code !== validationCode) {
        return { success: false, message: 'Código de validación incorrecto. Verifique la ubicación destino.' };
      }

      // Crear registro de ejecución
      const { error: executionError } = await supabase
        .from('stock_move_executions')
        .insert({
          task_id: taskId,
          executed_by: userId,
          quantity_moved: quantityMoved,
          validation_code_used: validationCode,
          execution_status: quantityMoved >= task.quantity_needed ? 'completed' : 'partial',
          execution_notes: executionNotes,
          scan_records: []
        });

      if (executionError) throw executionError;

      // Actualizar estado de la tarea
      const newStatus = quantityMoved >= task.quantity_needed ? 'completed' : 'in_progress';
      const { error: updateError } = await supabase
        .from('stock_move_tasks')
        .update({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

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
      const { error: sourceError } = await supabase
        .from('stock_levels')
        .update({
          quantity_available: supabase.sql`quantity_available - ${quantityMoved}`,
          last_updated: new Date().toISOString()
        })
        .eq('product_id', task.product_id)
        .eq('location_id', task.source_location_id);

      if (sourceError) throw sourceError;

      // Aumentar stock en ubicación destino
      const { data: existingStock } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('product_id', task.product_id)
        .eq('location_id', task.destination_location_id)
        .single();

      if (existingStock) {
        // Actualizar stock existente
        const { error: destError } = await supabase
          .from('stock_levels')
          .update({
            quantity_available: supabase.sql`quantity_available + ${quantityMoved}`,
            last_updated: new Date().toISOString()
          })
          .eq('product_id', task.product_id)
          .eq('location_id', task.destination_location_id);

        if (destError) throw destError;
      } else {
        // Crear nuevo registro de stock
        const { error: insertError } = await supabase
          .from('stock_levels')
          .insert({
            product_id: task.product_id,
            location_id: task.destination_location_id,
            quantity_available: quantityMoved,
            quantity_on_order: 0,
            quantity_reserved: 0,
            user_id: task.user_id
          });

        if (insertError) throw insertError;
      }

      // Registrar movimiento de stock
      await supabase
        .from('stock_movements')
        .insert({
          product_id: task.product_id,
          from_location_id: task.source_location_id,
          to_location_id: task.destination_location_id,
          quantity: quantityMoved,
          movement_type: 'transfer',
          reason: `Stock Move Task: ${task.task_type}`,
          performed_by: task.assigned_to,
          reference_type: 'stock_move_task',
          reference_id: task.id,
          user_id: task.user_id
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
      const { data, error } = await supabase
        .from('stock_move_tasks')
        .insert({
          ...taskData,
          status: 'pending',
          validation_code_required: true,
          created_by: taskData.user_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating manual task:', error);
      return null;
    }
  }

  // Obtener historial de ejecuciones
  static async getExecutionHistory(taskId?: string): Promise<StockMoveExecution[]> {
    try {
      let query = supabase
        .from('stock_move_executions')
        .select(`
          *,
          task:task_id(
            product_id,
            products:product_id(name, sku)
          )
        `)
        .order('completed_at', { ascending: false });

      if (taskId) {
        query = query.eq('task_id', taskId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
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

      const { data: tasks, error } = await supabase
        .from('stock_move_tasks')
        .select('status, priority, created_at, completed_at');

      if (error) throw error;

      const metrics = {
        totalPendingTasks: tasks?.filter(t => t.status === 'pending').length || 0,
        totalInProgress: tasks?.filter(t => ['assigned', 'in_progress'].includes(t.status)).length || 0,
        totalCompletedToday: tasks?.filter(t => 
          t.status === 'completed' && 
          t.completed_at?.startsWith(today)
        ).length || 0,
        averageCompletionTime: 0,
        urgentTasks: tasks?.filter(t => 
          ['pending', 'assigned'].includes(t.status) && 
          t.priority === 'urgent'
        ).length || 0,
      };

      // Calcular tiempo promedio de completado
      const completedTasks = tasks?.filter(t => 
        t.status === 'completed' && 
        t.created_at && 
        t.completed_at
      ) || [];

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
}
