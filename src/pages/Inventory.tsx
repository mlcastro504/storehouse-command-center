
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductsList } from '@/components/inventory/ProductsList';
import { CreateProductDialog } from '@/components/inventory/CreateProductDialog';
import { CategoriesList } from '@/components/inventory/CategoriesList';
import { CreateCategoryDialog } from '@/components/inventory/CreateCategoryDialog';
import { ConnectionTest } from '@/components/inventory/ConnectionTest';
import { useProducts, useCategories } from '@/hooks/useInventory';
import { Package, Warehouse, MapPin, TrendingDown, Tag } from 'lucide-react';

export default function Inventory() {
  const { data: products } = useProducts();
  const { data: categories } = useCategories();

  const totalProducts = products?.length || 0;
  const totalCategories = categories?.length || 0;
  const lowStockProducts = products?.filter(p => p.min_stock_level <= 10).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-gray-600">Gestiona productos, stock y movimientos</p>
        </div>
        <div className="flex gap-2">
          <CreateCategoryDialog />
          <CreateProductDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              Ubicaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-2xl font-bold">0</span>
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
                  <div className="text-center text-gray-500 py-8">
                    Funcionalidad de almacenes en desarrollo
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations">
              <Card>
                <CardHeader>
                  <CardTitle>Ubicaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-8">
                    Funcionalidad de ubicaciones en desarrollo
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stock">
              <Card>
                <CardHeader>
                  <CardTitle>Niveles de Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-8">
                    Funcionalidad de niveles de stock en desarrollo
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="movements">
              <Card>
                <CardHeader>
                  <CardTitle>Movimientos de Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-8">
                    Funcionalidad de movimientos en desarrollo
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <ConnectionTest />
        </div>
      </div>
    </div>
  );
}
