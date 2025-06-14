import React from 'react';
import { useLocations } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Package } from 'lucide-react';
import { Edit, Trash2 } from "lucide-react";
import { EditLocationDialog } from "./EditLocationDialog";
import { DeleteLocationDialog } from "./DeleteLocationDialog";

export const LocationsList = () => {
  const { data: locations, isLoading, error } = useLocations();

  const [editLocation, setEditLocation] = React.useState<any | null>(null);
  const [deleteLocation, setDeleteLocation] = React.useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Error al cargar las ubicaciones
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No hay ubicaciones registradas
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {locations.map((location) => (
        <Card key={location.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{location.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{location.code}</Badge>
                  <Badge variant="secondary">{location.type}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                {location.is_active ? (
                  <Badge variant="default">Activa</Badge>
                ) : (
                  <Badge variant="secondary">Inactiva</Badge>
                )}
                <button
                  className="ml-2 text-blue-600 hover:text-blue-800 p-1"
                  onClick={() => setEditLocation(location)}
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  className="ml-1 text-red-600 hover:text-red-800 p-1"
                  onClick={() => setDeleteLocation(location)}
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {location.capacity && (
                <div>
                  <div className="text-gray-500">Capacidad</div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {location.capacity}
                  </div>
                </div>
              )}
              <div>
                <div className="text-gray-500">Ocupación actual</div>
                <div>{location.current_occupancy}</div>
              </div>
              {location.coordinates && (
                <div className="col-span-2">
                  <div className="text-gray-500">Coordenadas</div>
                  <div>
                    X: {location.coordinates.x}, Y: {location.coordinates.y}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {editLocation && (
        <EditLocationDialog
          open={!!editLocation}
          setOpen={(open) => !open && setEditLocation(null)}
          location={editLocation}
        />
      )}
      {deleteLocation && (
        <DeleteLocationDialog
          open={!!deleteLocation}
          setOpen={(open) => !open && setDeleteLocation(null)}
          location={deleteLocation}
        />
      )}
    </div>
  );
};
