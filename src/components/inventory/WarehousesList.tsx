
import React from 'react';
import { useWarehouses } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Warehouse, MapPin, Phone, Mail } from 'lucide-react';

export const WarehousesList = () => {
  const { data: warehouses, isLoading, error } = useWarehouses();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Error al cargar los almacenes
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!warehouses || warehouses.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No hay almacenes registrados
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {warehouses.map((warehouse) => (
        <Card key={warehouse.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{warehouse.code}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-gray-500" />
                {warehouse.is_active ? (
                  <Badge variant="default">Activo</Badge>
                ) : (
                  <Badge variant="secondary">Inactivo</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{warehouse.address}, {warehouse.city}, {warehouse.state} {warehouse.postal_code}</span>
              </div>
              {warehouse.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{warehouse.phone}</span>
                </div>
              )}
              {warehouse.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{warehouse.email}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
