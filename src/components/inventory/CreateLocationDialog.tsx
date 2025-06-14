import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateLocation, useWarehouses } from '@/hooks/useInventory';
import { Plus } from 'lucide-react';

const locationSchema = z.object({
  code: z.string().min(1, 'Código es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  type: z.string().min(1, 'Tipo es requerido'),
  warehouse_id: z.string().min(1, 'Almacén es requerido'),
  capacity: z.string().optional(),
  barcode: z.string().optional(),
  x: z.string().optional(),
  y: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

export const CreateLocationDialog = () => {
  const [open, setOpen] = React.useState(false);
  const { data: warehouses } = useWarehouses();
  const createLocation = useCreateLocation();

  const [autoCode, setAutoCode] = React.useState<string>('');
  const [allLocations, setAllLocations] = React.useState<any[]>([]);
  const [nameError, setNameError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      (async () => {
        const locations = await (await fetch('/api/locations')).json();
        setAllLocations(locations);

        let maxNumber = 0;
        locations.forEach((loc: any) => {
          const number = parseInt((loc.code || '').replace(/^\D+/g, '')) || 0;
          if (number > maxNumber) maxNumber = number;
        });
        setAutoCode(`LOC-${String(maxNumber + 1).padStart(6, '0')}`);
      })();
      setNameError(null);
    } else {
      setAutoCode('');
      setNameError(null);
      setAllLocations([]);
    }
  }, [open]);

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      code: '',
      name: '',
      type: '',
      warehouse_id: '',
      capacity: '',
      barcode: '',
      x: '',
      y: '',
    },
  });

  const onSubmit = async (data: LocationFormData) => {
    setNameError(null);
    // Validar único nombre
    const nameExists = allLocations.some(
      (loc) => loc.name.trim().toLowerCase() === data.name.trim().toLowerCase()
    );
    if (nameExists) {
      setNameError('El nombre ya existe, elija uno diferente.');
      return;
    }
    try {
      await createLocation.mutateAsync({
        code: autoCode,
        name: data.name,
        type: data.type as any,
        warehouse_id: data.warehouse_id,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        current_occupancy: 0,
        is_active: true,
        barcode: data.barcode || undefined,
        coordinates: (data.x && data.y) ? {
          x: parseFloat(data.x),
          y: parseFloat(data.y)
        } : undefined,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating location:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Ubicación
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nueva Ubicación</DialogTitle>
        </DialogHeader>
        {/* Código autogenerado solo lectura */}
        <div className="mb-2">
          <FormLabel>Código</FormLabel>
          <Input value={autoCode} readOnly disabled className="font-mono" placeholder="Código automático" />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Eliminamos el input edit para 'code' */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    {nameError && <FormMessage>{nameError}</FormMessage>}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="warehouse">Almacén</SelectItem>
                        <SelectItem value="zone">Zona</SelectItem>
                        <SelectItem value="aisle">Pasillo</SelectItem>
                        <SelectItem value="rack">Rack</SelectItem>
                        <SelectItem value="shelf">Estante</SelectItem>
                        <SelectItem value="bin">Compartimento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Almacén</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar almacén" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses?.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidad</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de barras</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="x"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coordenada X</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="y"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coordenada Y</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createLocation.isPending}>
                {createLocation.isPending ? 'Creando...' : 'Crear Ubicación'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
