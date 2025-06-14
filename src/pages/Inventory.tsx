import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductsList } from '@/components/inventory/ProductsList';
import { CreateProductDialog } from '@/components/inventory/CreateProductDialog';
import { CategoriesList } from '@/components/inventory/CategoriesList';
import { CreateCategoryDialog } from '@/components/inventory/CreateCategoryDialog';
import { WarehousesList } from '@/components/inventory/WarehousesList';
import { CreateWarehouseDialog } from '@/components/inventory/CreateWarehouseDialog';
import { LocationsList } from '@/components/inventory/LocationsList';
import { CreateLocationDialog } from '@/components/inventory/CreateLocationDialog';
import { StockLevelsList } from '@/components/inventory/StockLevelsList';
import { StockMovementsList } from '@/components/inventory/StockMovementsList';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProducts, useCategories, useWarehouses, useLocations } from '@/hooks/useInventory';
import { Package, Warehouse, MapPin, TrendingDown, Tag } from 'lucide-react';

export default function Inventory() {
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const { data: warehouses } = useWarehouses();
  const { data: locations } = useLocations();

  const totalProducts = products?.length || 0;
  const totalCategories = categories?.length || 0;
  const totalWarehouses = warehouses?.length || 0;
  const totalLocations = locations?.length || 0;
  const lowStockProducts = products?.filter(p => p.min_stock_level <= 10).length || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Inventario</h1>
            <p className="text-gray-600">Gestiona productos, stock y movimientos</p>
          </div>
          <div className="flex gap-2">
            <CreateCategoryDialog />
            <CreateWarehouseDialog />
            <CreateLocationDialog />
            <CreateProductDialog />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Package className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">{totalProducts}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Categorías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Tag className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">{totalCategories}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Almacenes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Warehouse className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">{totalWarehouses}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ubicaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-indigo-500 mr-2" />
                <span className="text-2xl font-bold">{totalLocations}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Stock Bajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-2xl font-bold">{lowStockProducts}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="products" className="space-y-4">
              <TabsList>
                <TabsTrigger value="products">Productos</TabsTrigger>
                <TabsTrigger value="categories">Categorías</TabsTrigger>
                <TabsTrigger value="warehouses">Almacenes</TabsTrigger>
                <TabsTrigger value="locations">Ubicaciones</TabsTrigger>
                <TabsTrigger value="stock">Niveles de Stock</TabsTrigger>
                <TabsTrigger value="movements">Movimientos</TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle>Productos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductsList />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categories">
                <Card>
                  <CardHeader>
                    <CardTitle>Categorías</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoriesList />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="warehouses">
                <Card>
                  <CardHeader>
                    <CardTitle>Almacenes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WarehousesList />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="locations">
                <Card>
                  <CardHeader>
                    <CardTitle>Ubicaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LocationsList />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stock">
                <Card>
                  <CardHeader>
                    <CardTitle>Niveles de Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StockLevelsList />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="movements">
                <Card>
                  <CardHeader>
                    <CardTitle>Movimientos de Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StockMovementsList />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            {/* Quitar ConnectionTest */}
            {/* <ConnectionTest /> */}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
