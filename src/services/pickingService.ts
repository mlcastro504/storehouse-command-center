
import { supabase } from '@/integrations/supabase/client';
import type { 
  PickingTask, 
  CreatePickingTaskRequest, 
  UpdatePickingTaskRequest,
  PickingTaskFilter,
  PickingMetrics,
  PickingHistory,
  UserPickingZone
} from '@/types/picking';

export class PickingService {
  // Obtener tareas de picking con filtros
  static async getPickingTasks(filters?: PickingTaskFilter): Promise<PickingTask[]> {
    let query = supabase
      .from('picking_tasks')
      .select(`
        *,
        product:products(id, name, sku, barcode),
        source_location:locations!picking_tasks_source_location_id_fkey(id, code, name, confirmation_code),
        destination_location:locations!picking_tasks_destination_location_id_fkey(id, code, name, confirmation_code),
        assigned_user:user_profiles!picking_tasks_assigned_to_fkey(id, first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.priority?.length) {
        query = query.in('priority', filters.priority);
      }
      if (filters.task_type?.length) {
        query = query.in('task_type', filters.task_type);
      }
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters.created_from) {
        query = query.gte('created_at', filters.created_from);
      }
      if (filters.created_to) {
        query = query.lte('created_at', filters.created_to);
      }
      if (filters.channel_origin) {
        query = query.eq('channel_origin', filters.channel_origin);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as PickingTask[];
  }

  // Obtener tareas disponibles para asignar
  static async getAvailableTasks(): Promise<PickingTask[]> {
    const { data, error } = await supabase
      .from('picking_tasks')
      .select(`
        *,
        product:products(id, name, sku, barcode),
        source_location:locations!picking_tasks_source_location_id_fkey(id, code, name, confirmation_code),
        destination_location:locations!picking_tasks_destination_location_id_fkey(id, code, name, confirmation_code)
      `)
      .eq('status', 'pending')
      .is('assigned_to', null)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as PickingTask[];
  }

  // Obtener tareas asignadas a un usuario
  static async getMyTasks(userId: string): Promise<PickingTask[]> {
    const { data, error } = await supabase
      .from('picking_tasks')
      .select(`
        *,
        product:products(id, name, sku, barcode),
        source_location:locations!picking_tasks_source_location_id_fkey(id, code, name, confirmation_code),
        destination_location:locations!picking_tasks_destination_location_id_fkey(id, code, name, confirmation_code)
      `)
      .eq('assigned_to', userId)
      .in('status', ['assigned', 'in_progress'])
      .order('priority', { ascending: false })
      .order('assigned_at', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as PickingTask[];
  }

  // Crear nueva tarea de picking
  static async createPickingTask(taskData: CreatePickingTaskRequest): Promise<PickingTask> {
    // Obtener user_id del usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('picking_tasks')
      .insert({
        ...taskData,
        created_by: user.id,
        user_id: user.id,
        task_number: '' // Se generará automáticamente por el trigger
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as PickingTask;
  }

  // Actualizar tarea de picking
  static async updatePickingTask(taskId: string, updates: UpdatePickingTaskRequest): Promise<PickingTask> {
    // Calcular duración si se está completando la tarea
    if (updates.status === 'completed' || updates.status === 'in_progress') {
      const { data: task } = await supabase
        .from('picking_tasks')
        .select('started_at, assigned_at')
        .eq('id', taskId)
        .single();

      if (task && updates.status === 'completed') {
        const startTime = task.started_at || task.assigned_at;
        if (startTime) {
          const duration = Math.round((new Date().getTime() - new Date(startTime).getTime()) / (1000 * 60));
          updates.actual_duration_minutes = duration;
        }
      }

      if (updates.status === 'in_progress' && !task?.started_at) {
        (updates as any).started_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('picking_tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select('*')
      .single();

    if (error) throw error;
    return data as PickingTask;
  }

  // Asignar tarea a un operario
  static async assignTask(taskId: string, operatorId: string): Promise<PickingTask> {
    return this.updatePickingTask(taskId, {
      assigned_to: operatorId,
      status: 'assigned'
    });
  }

  // Tomar una tarea (auto-asignación)
  static async takeTask(taskId: string): Promise<PickingTask> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    return this.assignTask(taskId, user.id);
  }

  // Iniciar tarea
  static async startTask(taskId: string): Promise<PickingTask> {
    return this.updatePickingTask(taskId, {
      status: 'in_progress'
    });
  }

  // Completar tarea
  static async completeTask(
    taskId: string, 
    quantityPicked: number, 
    validationCode?: string,
    notes?: string
  ): Promise<PickingTask> {
    const updates: UpdatePickingTaskRequest = {
      status: 'completed',
      quantity_picked: quantityPicked,
      notes
    };

    if (validationCode) {
      updates.validation_code_used = validationCode;
    }

    return this.updatePickingTask(taskId, updates);
  }

  // Cancelar tarea
  static async cancelTask(taskId: string, reason?: string): Promise<PickingTask> {
    return this.updatePickingTask(taskId, {
      status: 'cancelled',
      error_reason: reason
    });
  }

  // Obtener métricas de picking
  static async getPickingMetrics(operatorId?: string, dateFrom?: string, dateTo?: string): Promise<PickingMetrics[]> {
    let query = supabase
      .from('picking_metrics')
      .select('*')
      .order('date', { ascending: false });

    if (operatorId) {
      query = query.eq('operator_id', operatorId);
    }
    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('date', dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as PickingMetrics[];
  }

  // Obtener historial de una tarea
  static async getTaskHistory(taskId: string): Promise<PickingHistory[]> {
    const { data, error } = await supabase
      .from('picking_history')
      .select('*')
      .eq('picking_task_id', taskId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as PickingHistory[];
  }

  // Validar código de ubicación
  static async validateLocationCode(locationId: string, code: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('locations')
      .select('confirmation_code')
      .eq('id', locationId)
      .single();

    if (error) throw error;
    return data?.confirmation_code === code;
  }

  // Obtener zonas de picking de un usuario
  static async getUserPickingZones(userId: string): Promise<UserPickingZone[]> {
    const { data, error } = await supabase
      .from('user_picking_zones')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []) as UserPickingZone[];
  }

  // Configurar zona de picking para usuario
  static async setUserPickingZone(userId: string, locationId: string, permissions: Partial<UserPickingZone>): Promise<UserPickingZone> {
    const { data, error } = await supabase
      .from('user_picking_zones')
      .upsert({
        user_id: userId,
        location_id: locationId,
        ...permissions
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as UserPickingZone;
  }

  // Generar tarea de picking desde orden de e-commerce
  static async createTaskFromEcommerceOrder(orderId: string): Promise<PickingTask[]> {
    // Obtener la orden y sus productos
    const { data: order, error: orderError } = await supabase
      .from('ecommerce_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    const lineItems = order.line_items as any[];
    const tasks: PickingTask[] = [];

    for (const item of lineItems) {
      // Buscar el producto por SKU
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('sku', item.sku)
        .single();

      if (product) {
        // Buscar ubicación de picking con stock disponible
        const { data: stockLocation } = await supabase
          .from('stock_levels')
          .select('location_id, locations(id, code, name, type)')
          .eq('product_id', product.id)
          .gte('quantity_available', item.quantity)
          .eq('locations.type', 'bin')
          .order('quantity_available', { ascending: false })
          .limit(1)
          .single();

        if (stockLocation) {
          // Buscar ubicación de destino (empaquetado)
          const { data: destLocation } = await supabase
            .from('locations')
            .select('id')
            .eq('type', 'packing')
            .limit(1)
            .single();

          if (destLocation) {
            const task = await this.createPickingTask({
              order_id: orderId,
              product_id: product.id,
              quantity_requested: item.quantity,
              source_location_id: stockLocation.location_id,
              destination_location_id: destLocation.id,
              task_type: 'sale',
              priority: 'medium',
              channel_origin: order.connection_id
            });

            tasks.push(task);
          }
        }
      }
    }

    // Actualizar estado de la orden
    if (tasks.length > 0) {
      await supabase
        .from('ecommerce_orders')
        .update({ picking_status: 'pending' })
        .eq('id', orderId);
    }

    return tasks;
  }
}
