import { connectToDatabase } from '@/lib/mongodb';
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
  // Obtener tareas de picking con filtros (MongoDB)
  static async getPickingTasks(filters?: any): Promise<any[]> {
    const db = await connectToDatabase();
    let query: any = {};

    if (filters) {
      if (filters.status?.length) query.status = { $in: filters.status };
      if (filters.priority?.length) query.priority = { $in: filters.priority };
      if (filters.task_type?.length) query.task_type = { $in: filters.task_type };
      if (filters.assigned_to) query.assigned_to = filters.assigned_to;
      if (filters.created_from || filters.created_to) {
        query.created_at = {};
        if (filters.created_from) query.created_at.$gte = filters.created_from;
        if (filters.created_to) query.created_at.$lte = filters.created_to;
      }
      if (filters.channel_origin) query.channel_origin = filters.channel_origin;
    }
    const result = await db.collection('picking_tasks').find(query).sort({ created_at: -1 }).toArray();
    return result;
  }

  // Obtener tareas asignadas a un usuario
  static async getMyTasks(userId: string): Promise<any[]> {
    const db = await connectToDatabase();
    const tasks = await db.collection('picking_tasks')
      .find({ assigned_to: userId, status: { $in: ['assigned', 'in_progress'] } })
      .sort({ priority: -1, assigned_at: 1 })
      .toArray();
    return tasks;
  }

  // Crear nueva tarea de picking (MongoDB only)
  static async createPickingTask(taskData: CreatePickingTaskRequest): Promise<PickingTask> {
    const db = await connectToDatabase();
    const now = new Date();
    // Simulate a user (since no Supabase)
    const userId = "current-user-id";
    const result = await db.collection('picking_tasks').insertOne({
      ...taskData,
      created_by: userId,
      user_id: userId,
      created_at: now,
      assigned_at: null, // always null when created
      status: "pending",
      task_number: Math.floor(Math.random() * 1000000).toString(),
    });
    const inserted = await db.collection('picking_tasks').findOne({ _id: result.insertedId });
    return inserted;
  }

  // Actualizar tarea de picking
  static async updatePickingTask(taskId: string, updates: UpdatePickingTaskRequest): Promise<PickingTask> {
    const db = await connectToDatabase();
    await db.collection('picking_tasks').updateOne(
      { id: taskId },
      { $set: { ...updates, updated_at: new Date().toISOString() } }
    );
    return db.collection('picking_tasks').findOne({ id: taskId });
  }

  // Iniciar tarea
  static async startTask(taskId: string): Promise<boolean> {
    const db = await connectToDatabase();
    const updateResult = await db.collection('picking_tasks').updateOne(
      { id: taskId },
      { $set: { status: 'in_progress', started_at: new Date().toISOString() } }
    );
    return !!updateResult.modifiedCount;
  }

  // Completar tarea
  static async completeTask(
    taskId: string, 
    quantityPicked: number, 
    validationCode?: string,
    notes?: string
  ): Promise<PickingTask> {
    const db = await connectToDatabase();
    const updates: UpdatePickingTaskRequest = {
      status: 'completed',
      quantity_picked: quantityPicked,
      notes
    };
    if (validationCode) {
      updates.validation_code_used = validationCode;
    }
    await db.collection('picking_tasks').updateOne({ id: taskId }, { $set: updates });
    return db.collection('picking_tasks').findOne({ id: taskId });
  }

  // Cancelar tarea
  static async cancelTask(taskId: string, reason?: string): Promise<PickingTask> {
    const db = await connectToDatabase();
    await db.collection('picking_tasks').updateOne(
      { id: taskId },
      { $set: { status: 'cancelled', error_reason: reason } }
    );
    return db.collection('picking_tasks').findOne({ id: taskId });
  }

  // Obtener métricas de picking (simulado para MongoDB)
  static async getPickingMetrics(operatorId?: string, dateFrom?: string, dateTo?: string): Promise<PickingMetrics[]> {
    // TODO: Implement proper MongoDB-based metrics as needed, return mock for now
    return [];
  }

  // Métodos suprimidos relacionados con Supabase:
  static async getAvailableTasks(): Promise<any[]> {
    return []; // Implement as needed, now returns empty list.
  }
  static async assignTask(taskId: string, operatorId: string): Promise<any> { throw new Error("Not implemented - no supabase"); }
  static async takeTask(taskId: string): Promise<any> { throw new Error("Not implemented - no supabase"); }
  static async getTaskHistory(taskId: string): Promise<any[]> { return []; }
  static async validateLocationCode(locationId: string, code: string): Promise<boolean> { return false; }
  static async getUserPickingZones(userId: string): Promise<any[]> { return []; }
  static async setUserPickingZone(userId: string, locationId: string, permissions: any): Promise<any> { throw new Error("Not implemented - no supabase"); }
  static async createTaskFromEcommerceOrder(orderId: string): Promise<any[]> { return []; }
}
