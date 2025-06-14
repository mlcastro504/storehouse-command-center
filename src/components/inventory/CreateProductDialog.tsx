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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateProduct, useCategories } from '@/hooks/useInventory';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const productSchema = z.object({
  sku: z.string().min(1, 'SKU es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Categoría es requerida'),
  brand: z.string().optional(),
  model: z.string().optional(),
  unit_of_measure: z.string().min(1, 'Unidad de medida es requerida'),
  weight: z.string().optional(),
  cost_price: z.string().optional(),
  sale_price: z.string().optional(),
  min_stock_level: z.string().min(1, 'Stock mínimo es requerido'),
  max_stock_level: z.string().min(1, 'Stock máximo es requerido'),
  reorder_point: z.string().min(1, 'Punto de reorden es requerido'),
  barcode: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface CreateProductDialogProps {
  children?: React.ReactNode;
}

export const CreateProductDialog = ({ children }: CreateProductDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createProduct = useCreateProduct();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      category_id: '',
      brand: '',
      model: '',
      unit_of_measure: '',
      weight: '',
      cost_price: '',
      sale_price: '',
      min_stock_level: '0',
      max_stock_level: '0',
      reorder_point: '0',
      barcode: '',
    },
  });

  // Hacer que el modal siempre abra, y mostrar error adentro si no hay categorías, nunca impedir que se abra
  const onSubmit = async (data: ProductFormData) => {
    try {
      console.log('Creating product with data:', data);

      // Si no hay categorías, mostrar toast pero NO salirse ni bloquear el modal
      if (!categories || categories.length === 0) {
        toast.error('No hay categorías disponibles. Crea una categoría primero.');
        return;
      }

      await createProduct.mutateAsync({
        sku: data.sku,
        name: data.name,
        description: data.description || '',
        category_id: data.category_id,
        brand: data.brand || '',
        model: data.model || '',
        unit_of_measure: data.unit_of_measure,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        cost_price: data.cost_price ? parseFloat(data.cost_price) : undefined,
        sale_price: data.sale_price ? parseFloat(data.sale_price) : undefined,
        min_stock_level: parseInt(data.min_stock_level),
        max_stock_level: parseInt(data.max_stock_level),
        reorder_point: parseInt(data.reorder_point),
        barcode: data.barcode || '',
        is_active: true,
      });

      setOpen(false);
      form.reset();
      console.log('Product created successfully');
    } catch (error) {
      // Mostrar el modal aunque ocurra un error al crear producto
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto');
    }
  };

  // Si no hay categorías, mostrar advertencia dentro del formulario
  const showCategoriesWarning =
    !categoriesLoading &&
    (!categories || categories.length === 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Producto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Producto</DialogTitle>
        </DialogHeader>
        {showCategoriesWarning && (
          <div className="mb-3 p-3 rounded bg-yellow-100 text-yellow-800 border border-yellow-300 text-center">
            No hay categorías disponibles. Por favor crea una categoría primero desde el módulo de categorías.
          </div>
        )}
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
                        {(!categories || categories.length === 0) && !categoriesLoading && (
                          <SelectItem value="" disabled>
                            No hay categorías disponibles
                          </SelectItem>
                        )}
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createProduct.isPending || showCategoriesWarning}>
                {createProduct.isPending ? 'Creando...' : 'Crear Producto'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
