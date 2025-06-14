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
import { useCreateWarehouse } from '@/hooks/useInventory';
import { Plus } from 'lucide-react';

const warehouseSchema = z.object({
  code: z.string().min(1, 'Código es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  address: z.string().min(1, 'Dirección es requerida'),
  city: z.string().min(1, 'Ciudad es requerida'),
  state: z.string().min(1, 'Estado es requerido'),
  postal_code: z.string().min(1, 'Código postal es requerido'),
  country: z.string().min(1, 'País es requerido'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

export const CreateWarehouseDialog = () => {
  const [open, setOpen] = React.useState(false);
  const createWarehouse = useCreateWarehouse();
  const [autoCode, setAutoCode] = React.useState<string>('');
  const [nameError, setNameError] = React.useState<string | null>(null);

  // Obtener todos los almacenes para validador único
  const [allWarehouses, setAllWarehouses] = React.useState<any[]>([]);
  React.useEffect(() => {
    if (open) {
      // Generar nuevo código
      (async () => {
        // Simulación: Usaremos un prefijo (WH-000001) y buscamos el mayor
        const warehouses = await (await fetch('/api/warehouses')).json();
        setAllWarehouses(warehouses);

        let maxNumber = 0;
        warehouses.forEach((w: any) => {
          const number = parseInt((w.code || '').replace(/^\D+/g, '')) || 0;
          if (number > maxNumber) maxNumber = number;
        });
        setAutoCode(`WH-${String(maxNumber + 1).padStart(6, '0')}`);
      })();
      setNameError(null);
    } else {
      setAutoCode('');
      setNameError(null);
      setAllWarehouses([]);
    }
  }, [open]);

  const form = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      code: '',
      name: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'México',
      phone: '',
      email: '',
    },
  });

  const onSubmit = async (data: WarehouseFormData) => {
    setNameError(null);
    // Validar único nombre (ignorando mayúsculas/minúsculas y espacios)
    const nameExists = allWarehouses.some(
      (w) => w.name.trim().toLowerCase() === data.name.trim().toLowerCase()
    );
    if (nameExists) {
      setNameError('El nombre ya existe, elija uno diferente.');
      return;
    }
    try {
      await createWarehouse.mutateAsync({
        code: autoCode,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country,
        phone: data.phone || '',
        email: data.email || '',
        is_active: true,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating warehouse:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Almacén
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Almacén</DialogTitle>
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Postal</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
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
              <Button type="submit" disabled={createWarehouse.isPending}>
                {createWarehouse.isPending ? 'Creando...' : 'Crear Almacén'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
