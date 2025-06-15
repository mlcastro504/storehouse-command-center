
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
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
import { Button } from "@/components/ui/button";
import { useUpdateLocation, useWarehouses, useLocations } from "@/hooks/useInventory";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { generateLocationConfirmationCode } from "@/lib/inventoryUtils";

const locationSchema = z.object({
  code: z.string().min(1, "Código es requerido"),
  name: z.string().min(1, "Nombre es requerido"),
  type: z.enum([
    "warehouse",
    "zone",
    "aisle",
    "rack",
    "shelf",
    "bin"
  ]),
  warehouse_id: z.string().min(1, "Almacén es requerido"),
  capacity: z.string().optional(),
  current_occupancy: z.string().min(1, "Ocupación actual es requerida"),
  is_active: z.boolean(),
  confirmation_code: z.string()
    .length(3, "El código de confirmación debe tener 3 caracteres.")
    .regex(/^[0-9][A-Z][0-9]$/, "El formato debe ser Número-Letra-Número (ej. 3R8)."),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface EditLocationDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  location: any;
}

export const EditLocationDialog = ({
  open,
  setOpen,
  location,
}: EditLocationDialogProps) => {
  const updateLocation = useUpdateLocation();
  const { data: warehouses } = useWarehouses();
  const { data: allLocations } = useLocations();

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      code: location?.code || "",
      name: location?.name || "",
      type: location?.type || "bin",
      warehouse_id: location?.warehouse_id || "",
      capacity: location?.capacity ? String(location.capacity) : "",
      current_occupancy: location?.current_occupancy
        ? String(location.current_occupancy)
        : "0",
      is_active: location?.is_active ?? true,
      confirmation_code: location?.confirmation_code || "",
    },
  });

  React.useEffect(() => {
    if (location) {
        form.reset({
            code: location?.code || "",
            name: location?.name || "",
            type: location?.type || "bin",
            warehouse_id: location?.warehouse_id || "",
            capacity: location?.capacity ? String(location.capacity) : "",
            current_occupancy: location?.current_occupancy ? String(location.current_occupancy) : "0",
            is_active: location?.is_active ?? true,
            confirmation_code: location?.confirmation_code || "",
        });
    }
  }, [location, form]);

  const generateNewConfirmationCode = () => {
    const existingCodes = allLocations?.map(l => l.confirmation_code).filter(Boolean) || [];
    const newCode = generateLocationConfirmationCode(existingCodes);
    form.setValue("confirmation_code", newCode, { shouldValidate: true });
  };

  const onSubmit = async (data: LocationFormData) => {
    const otherLocations = allLocations?.filter(l => l.id !== location.id);
    if (otherLocations?.some(l => l.confirmation_code === data.confirmation_code)) {
        form.setError("confirmation_code", { type: "manual", message: "Este código de confirmación ya está en uso." });
        return;
    }

    try {
      await updateLocation.mutateAsync({
        id: location.id,
        updates: {
          code: data.code,
          name: data.name,
          type: data.type,
          warehouse_id: data.warehouse_id,
          capacity: data.capacity ? parseInt(data.capacity) : undefined,
          current_occupancy: parseInt(data.current_occupancy),
          is_active: data.is_active,
          confirmation_code: data.confirmation_code,
        },
      });
      setOpen(false);
      toast.success("Ubicación actualizada correctamente");
    } catch (error) {
      toast.error("Error al actualizar la ubicación");
    }
  };

  if (!location) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Ubicación</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
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
              name="confirmation_code"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Código de Confirmación</FormLabel>
                  <div className="flex items-center gap-2">
                      <FormControl>
                      <Input {...field} className="font-mono" />
                      </FormControl>
                      <Button type="button" variant="outline" size="icon" onClick={generateNewConfirmationCode} title="Generar nuevo código">
                          <RefreshCw className="h-4 w-4" />
                      </Button>
                  </div>
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
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="warehouse">Almacén</option>
                    <option value="zone">Zona</option>
                    <option value="aisle">Pasillo</option>
                    <option value="rack">Rack</option>
                    <option value="shelf">Estante</option>
                    <option value="bin">Contenedor</option>
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="warehouse_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Almacén</FormLabel>
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Seleccionar almacén</option>
                    {warehouses?.map((wh: any) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name}
                      </option>
                    ))}
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="current_occupancy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ocupación actual</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                      id="is_active"
                      className="mr-2"
                    />
                    <FormLabel htmlFor="is_active">
                      {field.value ? "Activa" : "Inactiva"}
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateLocation.isPending}>
                {updateLocation.isPending ? "Actualizando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
