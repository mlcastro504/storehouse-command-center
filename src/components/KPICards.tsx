
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, ShoppingCart, TrendingUp } from 'lucide-react'
import { connectToDatabase } from '@/lib/mongodb'
import { useState, useEffect } from 'react'
import { Skeleton } from "@/components/ui/skeleton";

export function KPICards() {
  const [kpiData, setKpiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const db = await connectToDatabase('mongodb://localhost/mockdb', 'mockdb');
        
        const products = await db.collection('products').find({}).toArray();
        const users = await db.collection('users').find({}).toArray();
        const ecommerceOrders = await db.collection('ecommerce_orders').find({}).toArray();
        const stockLevels = await db.collection('stock_levels').find({}).toArray();
        const putawayTasks = await db.collection('putaway_tasks').find({}).toArray();
        const pickingTasks = await db.collection('picking_tasks').find({}).toArray();
        const stockMoveTasks = await db.collection('stock_move_tasks').find({}).toArray();

        // Calculate total stock value
        const totalStockValue = stockLevels.reduce((total: number, stockLevel: any) => {
          const product = products.find((p: any) => p.id === stockLevel.product_id);
          if (product && product.cost_price) {
            return total + (stockLevel.quantity_available * product.cost_price);
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

        setKpiData({
          totalProducts: products.length,
          totalStockValue: totalStockValue,
          activeUsers: users.filter((user: any) => user.isActive).length,
          activeOrders: activeOrders,
          pendingTasks: pendingTasks,
          monthlyRevenue: monthlyRevenue
        });
      } catch (error) {
        console.error("Error loading KPI data:", error);
        setKpiData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-[121px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-1/3 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!kpiData || kpiData.totalProducts === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="warehouse-card col-span-full">
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
