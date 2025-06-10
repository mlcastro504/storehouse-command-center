
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function WarehouseSettings() {
  const [warehouses, setWarehouses] = useState([
    {
      id: '1',
      name: 'Almacén Principal Madrid',
      address: 'Polígono Industrial Sur, Madrid',
      maxCapacity: 10000,
      responsible: 'Juan Pérez',
      activeModules: ['inventory', 'picking', 'putaway', 'ecommerce'],
      zones: ['A1', 'A2', 'B1', 'B2', 'C1']
    },
    {
      id: '2',
      name: 'Almacén Barcelona',
      address: 'Zona Franca, Barcelona',
      maxCapacity: 7500,
      responsible: 'Maria García',
      activeModules: ['inventory', 'picking', 'loading'],
      zones: ['A1', 'B1', 'C1']
    }
  ]);

  const { toast } = useToast();

  const moduleNames = {
    inventory: 'Inventario',
    picking: 'Picking',
    putaway: 'Put Away',
    loading: 'Carga/Descarga',
    ecommerce: 'E-commerce',
    stockmove: 'Movimientos',
    scanner: 'Escáner'
  };

  const handleAddWarehouse = () => {
    toast({
      title: "Crear nuevo almacén",
      description: "Se abrirá el formulario para crear un nuevo almacén.",
    });
  };

  const toggleModule = (warehouseId: string, module: string) => {
    setWarehouses(warehouses.map(warehouse => {
      if (warehouse.id === warehouseId) {
        const updatedModules = warehouse.activeModules.includes(module)
          ? warehouse.activeModules.filter(m => m !== module)
          : [...warehouse.activeModules, module];
        return { ...warehouse, activeModules: updatedModules };
      }
      return warehouse;
    }));

    toast({
      title: "Módulo actualizado",
      description: `El módulo ${moduleNames[module as keyof typeof moduleNames]} ha sido ${warehouses.find(w => w.id === warehouseId)?.activeModules.includes(module) ? 'desactivado' : 'activado'}.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Gestión de Almacenes
        </CardTitle>
        <CardDescription>
          Configura tus almacenes y los módulos activos en cada uno
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleAddWarehouse} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Almacén
          </Button>
        </div>

        <div className="space-y-6">
          {warehouses.map((warehouse) => (
            <div key={warehouse.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{warehouse.name}</h3>
                  <p className="text-sm text-muted-foreground">{warehouse.address}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Capacidad Máxima</Label>
                  <p className="font-medium">{warehouse.maxCapacity.toLocaleString()} m²</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Responsable</Label>
                  <p className="font-medium">{warehouse.responsible}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Zonas</Label>
                  <div className="flex gap-1 flex-wrap">
                    {warehouse.zones.map(zone => (
                      <Badge key={zone} variant="outline" className="text-xs">{zone}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Módulos Activos</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(moduleNames).map(([key, name]) => (
                    <div key={key} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{name}</span>
                      <Switch
                        checked={warehouse.activeModules.includes(key)}
                        onCheckedChange={() => toggleModule(warehouse.id, key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
