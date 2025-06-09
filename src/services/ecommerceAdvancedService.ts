
import { BrowserStorage } from '@/lib/browserStorage';
import { 
  EcommerceChannel, 
  EcommerceOrderAdvanced, 
  EcommerceReturn, 
  EcommerceSyncLogAdvanced,
  EcommerceProductMapping,
  EcommerceMetrics 
} from '@/types/ecommerce-advanced';

export class EcommerceAdvancedService {
  // Gestión de Canales
  static async getChannels(): Promise<EcommerceChannel[]> {
    try {
      const channels = await BrowserStorage.find('ecommerce_channels', { is_active: true });
      return channels.map(channel => ({
        ...channel,
        id: channel._id || channel.id
      }));
    } catch (error) {
      console.error('Error fetching channels:', error);
      return [];
    }
  }

  static async createChannel(channelData: Partial<EcommerceChannel>): Promise<EcommerceChannel | null> {
    try {
      const newChannel = {
        id: `channel_${Date.now()}`,
        ...channelData,
        sync_status: 'disconnected',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await BrowserStorage.insertOne('ecommerce_channels', newChannel);
      return newChannel as EcommerceChannel;
    } catch (error) {
      console.error('Error creating channel:', error);
      return null;
    }
  }

  static async updateChannel(channelId: string, updates: Partial<EcommerceChannel>): Promise<boolean> {
    try {
      const result = await BrowserStorage.updateOne('ecommerce_channels',
        { id: channelId },
        { 
          ...updates, 
          updated_at: new Date().toISOString() 
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating channel:', error);
      return false;
    }
  }

  static async testChannelConnection(channelId: string): Promise<{ success: boolean; message: string }> {
    try {
      const channel = await BrowserStorage.findOne('ecommerce_channels', { id: channelId });
      if (!channel) {
        return { success: false, message: 'Canal no encontrado' };
      }

      // Simular prueba de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isConnected = Math.random() > 0.3; // 70% probabilidad de éxito
      
      await this.updateChannel(channelId, {
        sync_status: isConnected ? 'connected' : 'error',
        last_sync_at: new Date().toISOString()
      });

      return {
        success: isConnected,
        message: isConnected ? 'Conexión exitosa' : 'Error de conexión - verificar credenciales'
      };
    } catch (error) {
      console.error('Error testing connection:', error);
      return { success: false, message: 'Error al probar la conexión' };
    }
  }

  // Sincronización
  static async syncChannel(channelId: string, syncType: 'products' | 'orders' | 'inventory' | 'full'): Promise<EcommerceSyncLogAdvanced> {
    const syncLog = {
      id: `sync_${Date.now()}`,
      channel_id: channelId,
      sync_type: syncType,
      status: 'started' as const,
      records_processed: 0,
      records_success: 0,
      records_failed: 0,
      started_at: new Date().toISOString(),
      user_id: 'current_user_id'
    };

    await BrowserStorage.insertOne('ecommerce_sync_logs', syncLog);

    try {
      // Simular sincronización
      await new Promise(resolve => setTimeout(resolve, 3000));

      const totalRecords = Math.floor(Math.random() * 100) + 10;
      const successRecords = Math.floor(totalRecords * (0.8 + Math.random() * 0.2));
      const failedRecords = totalRecords - successRecords;

      const completedLog = {
        ...syncLog,
        status: failedRecords > 0 ? 'partial' as const : 'completed' as const,
        records_processed: totalRecords,
        records_success: successRecords,
        records_failed: failedRecords,
        completed_at: new Date().toISOString(),
        duration_seconds: 3
      };

      await BrowserStorage.updateOne('ecommerce_sync_logs',
        { id: syncLog.id },
        completedLog
      );

      if (syncType === 'orders' || syncType === 'full') {
        await this.createSampleOrders(channelId, successRecords);
      }

      return completedLog;
    } catch (error) {
      console.error('Error during sync:', error);
      const errorLog = {
        ...syncLog,
        status: 'failed' as const,
        error_message: 'Error durante la sincronización',
        completed_at: new Date().toISOString()
      };

      await BrowserStorage.updateOne('ecommerce_sync_logs',
        { id: syncLog.id },
        errorLog
      );

      return errorLog;
    }
  }

  private static async createSampleOrders(channelId: string, count: number): Promise<void> {
    const channel = await BrowserStorage.findOne('ecommerce_channels', { id: channelId });
    if (!channel) return;

    for (let i = 0; i < Math.min(count, 5); i++) {
      const order = {
        id: `order_${Date.now()}_${i}`,
        channel_id: channelId,
        external_order_id: `EXT_${Math.random().toString(36).substr(2, 9)}`,
        order_number: `ORD-${Date.now()}-${i}`,
        order_status: 'pending',
        financial_status: 'paid',
        total_amount: Math.floor(Math.random() * 500) + 50,
        currency: 'USD',
        sync_status: 'synced',
        warehouse_status: 'pending',
        order_date: new Date().toISOString(),
        user_id: 'current_user_id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await BrowserStorage.insertOne('ecommerce_orders', order);
    }
  }

  // Gestión de Órdenes
  static async getOrders(filters?: { 
    channel_id?: string; 
    status?: string; 
    date_from?: string; 
    date_to?: string 
  }): Promise<EcommerceOrderAdvanced[]> {
    try {
      let query: any = {};
      
      if (filters?.channel_id) query.channel_id = filters.channel_id;
      if (filters?.status) query.warehouse_status = filters.status;

      const orders = await BrowserStorage.find('ecommerce_orders', query);

      // Enriquecer con datos relacionados
      const enrichedOrders = await Promise.all(orders.map(async (order) => {
        const channel = await BrowserStorage.findOne('ecommerce_channels', { id: order.channel_id });
        const orderLines = await BrowserStorage.find('ecommerce_order_lines', { ecommerce_order_id: order.id });

        return {
          ...order,
          id: order._id || order.id,
          channel,
          order_lines: orderLines
        };
      }));

      return enrichedOrders.sort((a, b) => 
        new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
      );
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  static async updateOrderStatus(orderId: string, warehouseStatus: string, trackingNumber?: string): Promise<boolean> {
    try {
      const updates: any = {
        warehouse_status: warehouseStatus,
        updated_at: new Date().toISOString()
      };

      if (trackingNumber) {
        updates.tracking_number = trackingNumber;
      }

      if (warehouseStatus === 'shipped') {
        updates.shipped_at = new Date().toISOString();
      }

      const result = await BrowserStorage.updateOne('ecommerce_orders',
        { id: orderId },
        updates
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  // Gestión de Devoluciones
  static async getReturns(): Promise<EcommerceReturn[]> {
    try {
      const returns = await BrowserStorage.find('ecommerce_returns', {});

      const enrichedReturns = await Promise.all(returns.map(async (returnItem) => {
        const order = await BrowserStorage.findOne('ecommerce_orders', { id: returnItem.ecommerce_order_id });
        const returnLines = await BrowserStorage.find('ecommerce_return_lines', { ecommerce_return_id: returnItem.id });

        return {
          ...returnItem,
          id: returnItem._id || returnItem.id,
          order,
          return_lines: returnLines
        };
      }));

      return enrichedReturns.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching returns:', error);
      return [];
    }
  }

  static async createReturn(returnData: Partial<EcommerceReturn>): Promise<EcommerceReturn | null> {
    try {
      const newReturn = {
        id: `return_${Date.now()}`,
        return_number: `RET-${Date.now()}`,
        ...returnData,
        status: 'pending',
        quality_check_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await BrowserStorage.insertOne('ecommerce_returns', newReturn);
      return newReturn as EcommerceReturn;
    } catch (error) {
      console.error('Error creating return:', error);
      return null;
    }
  }

  static async processReturn(returnId: string, approved: boolean, notes?: string): Promise<boolean> {
    try {
      const updates = {
        status: approved ? 'approved' : 'rejected',
        quality_check_status: approved ? 'passed' : 'failed',
        quality_check_notes: notes,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await BrowserStorage.updateOne('ecommerce_returns',
        { id: returnId },
        updates
      );

      if (approved) {
        // Aquí se podría actualizar el inventario automáticamente
        await this.processReturnInventory(returnId);
      }

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error processing return:', error);
      return false;
    }
  }

  private static async processReturnInventory(returnId: string): Promise<void> {
    // Lógica para actualizar inventario cuando se aprueba una devolución
    console.log(`Processing inventory for return ${returnId}`);
  }

  // Métricas y Analytics
  static async getMetrics(): Promise<EcommerceMetrics> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const channels = await this.getChannels();
      const orders = await BrowserStorage.find('ecommerce_orders', {});
      const returns = await BrowserStorage.find('ecommerce_returns', {});
      const syncLogs = await BrowserStorage.find('ecommerce_sync_logs', {});

      const todayOrders = orders.filter(order => 
        order.order_date.startsWith(today)
      );

      const totalRevenueToday = todayOrders.reduce((sum, order) => 
        sum + (order.total_amount || 0), 0
      );

      const pendingReturns = returns.filter(ret => ret.status === 'pending').length;
      const syncErrors = syncLogs.filter(log => log.status === 'failed').length;

      return {
        total_channels: channels.length,
        active_channels: channels.filter(c => c.sync_status === 'connected').length,
        total_orders_today: todayOrders.length,
        pending_orders: orders.filter(o => o.warehouse_status === 'pending').length,
        processing_orders: orders.filter(o => o.warehouse_status === 'picking').length,
        total_revenue_today: totalRevenueToday,
        pending_returns: pendingReturns,
        sync_errors: syncErrors,
        popular_products: [],
        channel_performance: channels.map(channel => ({
          channel_name: channel.name,
          orders_count: orders.filter(o => o.channel_id === channel.id).length,
          revenue: orders
            .filter(o => o.channel_id === channel.id)
            .reduce((sum, o) => sum + (o.total_amount || 0), 0),
          sync_status: channel.sync_status
        }))
      };
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return {
        total_channels: 0,
        active_channels: 0,
        total_orders_today: 0,
        pending_orders: 0,
        processing_orders: 0,
        total_revenue_today: 0,
        pending_returns: 0,
        sync_errors: 0,
        popular_products: [],
        channel_performance: []
      };
    }
  }

  // Logs de Sincronización
  static async getSyncLogs(channelId?: string): Promise<EcommerceSyncLogAdvanced[]> {
    try {
      const query = channelId ? { channel_id: channelId } : {};
      const logs = await BrowserStorage.find('ecommerce_sync_logs', query);

      const enrichedLogs = await Promise.all(logs.map(async (log) => {
        const channel = await BrowserStorage.findOne('ecommerce_channels', { id: log.channel_id });
        return {
          ...log,
          id: log._id || log.id,
          channel
        };
      }));

      return enrichedLogs.sort((a, b) => 
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      return [];
    }
  }

  // Mapeo de Productos
  static async getProductMappings(channelId?: string): Promise<EcommerceProductMapping[]> {
    try {
      const query = channelId ? { channel_id: channelId } : {};
      const mappings = await BrowserStorage.find('ecommerce_product_mappings', query);

      const enrichedMappings = await Promise.all(mappings.map(async (mapping) => {
        const product = await BrowserStorage.findOne('products', { id: mapping.product_id });
        const channel = await BrowserStorage.findOne('ecommerce_channels', { id: mapping.channel_id });

        return {
          ...mapping,
          id: mapping._id || mapping.id,
          product,
          channel
        };
      }));

      return enrichedMappings;
    } catch (error) {
      console.error('Error fetching product mappings:', error);
      return [];
    }
  }

  static async createProductMapping(mappingData: Partial<EcommerceProductMapping>): Promise<boolean> {
    try {
      const mapping = {
        id: `mapping_${Date.now()}`,
        ...mappingData,
        is_active: true,
        sync_enabled: true,
        sync_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await BrowserStorage.insertOne('ecommerce_product_mappings', mapping);
      return true;
    } catch (error) {
      console.error('Error creating product mapping:', error);
      return false;
    }
  }

  // Automatización de Picking
  static async createPickingTasksFromOrders(): Promise<number> {
    try {
      const pendingOrders = await BrowserStorage.find('ecommerce_orders', { 
        warehouse_status: 'pending' 
      });

      let tasksCreated = 0;

      for (const order of pendingOrders) {
        const orderLines = await BrowserStorage.find('ecommerce_order_lines', { 
          ecommerce_order_id: order.id 
        });

        for (const line of orderLines) {
          if (line.product_id) {
            // Verificar stock disponible
            const stockLevel = await BrowserStorage.findOne('stock_levels', {
              product_id: line.product_id
            });

            if (stockLevel && stockLevel.quantity_available >= line.quantity) {
              // Crear tarea de picking
              const pickingTask = {
                id: `pick_${Date.now()}_${tasksCreated}`,
                ecommerce_order_id: order.id,
                product_id: line.product_id,
                quantity_to_pick: line.quantity,
                status: 'pending',
                priority: 'medium',
                created_at: new Date().toISOString(),
                user_id: order.user_id
              };

              await BrowserStorage.insertOne('picking_tasks', pickingTask);
              tasksCreated++;
            }
          }
        }

        if (tasksCreated > 0) {
          await this.updateOrderStatus(order.id, 'picking');
        }
      }

      return tasksCreated;
    } catch (error) {
      console.error('Error creating picking tasks:', error);
      return 0;
    }
  }
}
