
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Truck } from 'lucide-react';

export default function Suppliers() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Proveedores</h1>
            <p className="text-muted-foreground">
              Gestión de proveedores y relaciones comerciales
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </div>

        {/* Main Content */}
        <Card className="warehouse-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Lista de Proveedores
                </CardTitle>
                <CardDescription>
                  Administra y gestiona tu catálogo de proveedores
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Truck className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Módulo de Proveedores
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Este módulo está listo para ser implementado. Aquí podrás gestionar:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Catálogo de Proveedores</h4>
                  <p className="text-sm text-muted-foreground">
                    Lista completa de todos tus proveedores
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Información de Contacto</h4>
                  <p className="text-sm text-muted-foreground">
                    Datos de contacto y detalles comerciales
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Productos del Proveedor</h4>
                  <p className="text-sm text-muted-foreground">
                    Catálogo de productos por proveedor
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
