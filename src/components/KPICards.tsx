
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, ShoppingCart, TrendingUp } from 'lucide-react'
import { BrowserStorage } from '@/lib/browserStorage'
import { useMemo } from 'react'

export function KPICards() {
  const kpiData = useMemo(() => {
    // Get data from mock storage
    const products = BrowserStorage.get('products') || [];
    const users = BrowserStorage.get('users') || [];
    const ecommerceOrders = BrowserStorage.get('ecommerce_orders') || [];
    const stockLevels = BrowserStorage.get('stock_levels') || [];
    const putawayTasks = BrowserStorage.get('putaway_tasks') || [];
    const pickingTasks = BrowserStorage.get('picking_tasks') || [];
    const stockMoveTasks = BrowserStorage.get('stock_move_tasks') || [];

    // Calculate total stock value
    const totalStockValue = stockLevels.reduce((total: number, stockLevel: any) => {
      const product = products.find((p: any) => p.id === stockLevel.product_id);
      if (product) {
        return total + (stockLevel.quantity_on_hand * product.cost_price);
      }
      return total;
    }, 0);

    // Calculate active orders (pending + processing)
    const activeOrders = ecommerceOrders.filter((order: any) => 
      order.warehouse_status === 'pending' || order.warehouse_status === 'processing'
    ).length;

    // Calculate pending tasks
    const pendingTasks = [
      ...putawayTasks.filter((task: any) => task.status === 'pending'),
      ...pickingTasks.filter((task: any) => task.status === 'pending'),
      ...stockMoveTasks.filter((task: any) => task.status === 'pending')
    ].length;

    // Calculate monthly revenue from completed orders
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthlyRevenue = ecommerceOrders
      .filter((order: any) => {
        const orderDate = new Date(order.order_date);
        return orderDate >= monthStart && order.financial_status === 'paid';
      })
      .reduce((total: number, order: any) => total + order.total_amount, 0);

    return {
      totalProducts: products.length,
      totalStockValue: totalStockValue,
      activeUsers: users.filter((user: any) => user.isActive).length,
      activeOrders: activeOrders,
      pendingTasks: pendingTasks,
      monthlyRevenue: monthlyRevenue
    };
  }, []);

  if (kpiData.totalProducts === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="warehouse-card">
          <CardContent className="p-6 text-center">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay datos disponibles. Genera datos mock desde Configuración.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="warehouse-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Productos Activos
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpiData.totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            Valor total: €{kpiData.totalStockValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <Card className="warehouse-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Usuarios Activos
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpiData.activeUsers}</div>
          <p className="text-xs text-muted-foreground">
            Usuarios conectados al sistema
          </p>
        </CardContent>
      </Card>

      <Card className="warehouse-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pedidos Activos
          </CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpiData.activeOrders}</div>
          <p className="text-xs text-muted-foreground">
            Tareas pendientes: {kpiData.pendingTasks}
          </p>
        </CardContent>
      </Card>

      <Card className="warehouse-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ingresos del Mes
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            €{kpiData.monthlyRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            Desde el inicio del mes
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
