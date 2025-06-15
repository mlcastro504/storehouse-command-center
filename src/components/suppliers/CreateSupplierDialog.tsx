import React from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { CreateSupplierData, Supplier, UpdateSupplierData } from '@/types/inventory';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/useInventory';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// Función "mock": obtiene siguiente código en formato SUP-0001, SUP-0002, etc.
let supplierCounter = 1;
const getNextSupplierCode = (() => {
  let counter = 1;
  return async () => {
    // En una app real, esto vendría de una consulta backend/DB.
    // Aquí simulamos auto-increment.
    const db = await connectToDatabase();
    const all = await db.collection('suppliers').find().toArray();
    const usedCodes = all
      .map((sup: any) => sup.code)
      .filter(Boolean)
      .sort();
    if (usedCodes.length > 0) {
      // SUP-0004
      const nums = usedCodes
        .map((code: string) => {
          const match = code.match(/^SUP-(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => n > 0);
      counter = (nums.length > 0 ? Math.max(...nums) : 0) + 1;
    }
    const code = `SUP-${counter.toString().padStart(4, '0')}`;
    counter++;
    return code;
  };
})();

interface CreateSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
}

export function CreateSupplierDialog({ open, onOpenChange, supplier }: CreateSupplierDialogProps) {
  const isEditing = !!supplier;
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  const form = useForm<CreateSupplierData & { is_active: boolean }>({
    defaultValues: {
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      tax_id: '',
      payment_terms: '',
      lead_time_days: 0,
      notes: '',
      is_active: true,
    },
  });

  const [autoCode, setAutoCode] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      if (isEditing && supplier) {
        form.reset({
          name: supplier.name || '',
          contact_person: supplier.contact_person || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          city: supplier.city || '',
          state: supplier.state || '',
          postal_code: supplier.postal_code || '',
          country: supplier.country || '',
          tax_id: supplier.tax_id || '',
          payment_terms: supplier.payment_terms || '',
          lead_time_days: supplier.lead_time_days || 0,
          notes: supplier.notes || '',
          is_active: supplier.is_active ?? true,
        });
      } else {
        form.reset();
        getNextSupplierCode().then(setAutoCode);
      }
    } else {
      setAutoCode(null);
    }
  }, [open, isEditing, supplier, form]);
  
  const onSubmit = (data: CreateSupplierData & { is_active: boolean }) => {
    form.clearErrors('name');
    const mutationData = {
      ...data,
      lead_time_days: Number(data.lead_time_days) || 0,
    };

    const mutationOptions = {
      onSuccess: () => {
        onOpenChange(false);
      },
      onError: (error: any) => {
        if (error.message && error.message.toLowerCase().includes('nombre')) {
          form.setError('name', { type: 'custom', message: error.message });
        }
      },
    };

    if (isEditing) {
      updateMutation.mutate({ id: supplier!.id, updates: mutationData as Partial<Supplier> }, mutationOptions);
    } else {
      createMutation.mutate({ ...mutationData, code: autoCode || '' } as Partial<Supplier>, mutationOptions);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos del proveedor' : 'Completa la información del nuevo proveedor'}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-2">
          <FormLabel>Código</FormLabel>
          <Input
            value={isEditing ? supplier?.code : (autoCode || '')}
            disabled
            readOnly
            className="font-mono"
            placeholder="Generado automáticamente"
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: 'El nombre es requerido' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del proveedor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persona de Contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del contacto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@proveedor.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 8900" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tax_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Fiscal</FormLabel>
                    <FormControl>
                      <Input placeholder="RFC/NIT/CIF" {...field} />
                    </FormControl>
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
                      <Input placeholder="Dirección completa" {...field} />
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
                      <Input placeholder="Ciudad" {...field} />
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
                    <FormLabel>Estado/Provincia</FormLabel>
                    <FormControl>
                      <Input placeholder="Estado" {...field} />
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
                      <Input placeholder="12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input placeholder="País" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Términos de Pago</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 30 días" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="lead_time_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiempo de Entrega (días)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionales sobre el proveedor..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Estado Activo</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Determina si el proveedor está activo en el sistema
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
