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
import { useCreateCategory } from '@/hooks/useInventory';
import { Plus } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().optional(),
  code: z.string().min(1, 'Código es requerido'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export const CreateCategoryDialog = () => {
  const [open, setOpen] = React.useState(false);
  const createCategory = useCreateCategory();
  const [autoCode, setAutoCode] = React.useState<string>("");
  const [allCategories, setAllCategories] = React.useState<any[]>([]);
  const [nameError, setNameError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      (async () => {
        const categories = await (await fetch('/api/categories')).json();
        setAllCategories(categories);

        let maxNumber = 0;
        categories.forEach((c: any) => {
          const number = parseInt((c.code || '').replace(/^\D+/g, '')) || 0;
          if (number > maxNumber) maxNumber = number;
        });
        setAutoCode(`CAT-${String(maxNumber + 1).padStart(4, '0')}`);
      })();
      setNameError(null);
    } else {
      setAutoCode('');
      setNameError(null);
      setAllCategories([]);
    }
  }, [open]);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      code: '',
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    setNameError(null);
    // Validación único nombre
    const nameExists = allCategories.some(
      (c) => c.name.trim().toLowerCase() === data.name.trim().toLowerCase()
    );
    if (nameExists) {
      setNameError("El nombre ya existe, elija uno diferente.");
      return;
    }
    try {
      await createCategory.mutateAsync({
        name: data.name,
        description: data.description,
        code: autoCode,
        is_active: true,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Categoría
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nueva Categoría</DialogTitle>
        </DialogHeader>
        {/* Código autogenerado solo lectura */}
        <div className="mb-2">
          <FormLabel>Código</FormLabel>
          <Input value={autoCode} readOnly disabled className="font-mono" placeholder="Código automático" />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            {/* Eliminamos field de code editable */}
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createCategory.isPending}>
                {createCategory.isPending ? 'Creando...' : 'Crear Categoría'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
