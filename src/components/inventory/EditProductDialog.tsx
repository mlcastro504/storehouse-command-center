
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUpdateProduct, useCategories } from "@/hooks/useInventory";
import { toast } from "sonner";

const productSchema = z.object({
  sku: z.string().min(1, "SKU es requerido"),
  name: z.string().min(1, "Nombre es requerido"),
  description: z.string().optional(),
  category_id: z.string().min(1, "Categoría es requerida"),
  brand: z.string().optional(),
  model: z.string().optional(),
  unit_of_measure: z.string().min(1, "Unidad de medida es requerida"),
  weight: z.string().optional(),
  cost_price: z.string().optional(),
  sale_price: z.string().optional(),
  min_stock_level: z.string().min(1, "Stock mínimo es requerido"),
  max_stock_level: z.string().min(1, "Stock máximo es requerido"),
  reorder_point: z.string().min(1, "Punto de reorden es requerido"),
  barcode: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface EditProductDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  product: any;
}

export const EditProductDialog = ({
  open,
  setOpen,
  product,
}: EditProductDialogProps) => {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const updateProduct = useUpdateProduct();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: product?.sku || "",
      name: product?.name || "",
      description: product?.description || "",
      category_id: product?.category_id || "",
      brand: product?.brand || "",
      model: product?.model || "",
      unit_of_measure: product?.unit_of_measure || "",
      weight: product?.weight ? String(product.weight) : "",
      cost_price: product?.cost_price ? String(product.cost_price) : "",
      sale_price: product?.sale_price ? String(product.sale_price) : "",
      min_stock_level: product?.min_stock_level
        ? String(product.min_stock_level)
        : "0",
      max_stock_level: product?.max_stock_level
        ? String(product.max_stock_level)
        : "0",
      reorder_point: product?.reorder_point
        ? String(product.reorder_point)
        : "0",
      barcode: product?.barcode || "",
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        updates: {
          sku: data.sku,
          name: data.name,
          description: data.description || "",
          category_id: data.category_id,
          brand: data.brand || "",
          model: data.model || "",
          unit_of_measure: data.unit_of_measure,
          weight: data.weight ? parseFloat(data.weight) : undefined,
          cost_price: data.cost_price ? parseFloat(data.cost_price) : undefined,
          sale_price: data.sale_price ? parseFloat(data.sale_price) : undefined,
          min_stock_level: parseInt(data.min_stock_level),
          max_stock_level: parseInt(data.max_stock_level),
          reorder_point: parseInt(data.reorder_point),
          barcode: data.barcode || "",
        },
      });
      setOpen(false);
      toast.success("Producto actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar el producto");
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={categoriesLoading ? "Cargando..." : "Seleccionar categoría"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
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
                name="unit_of_measure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de medida</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ej: pcs, kg, l" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
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
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de costo</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de venta</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="min_stock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock mínimo</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_stock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock máximo</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reorder_point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Punto de reorden</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateProduct.isPending}>
                {updateProduct.isPending ? "Actualizando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
