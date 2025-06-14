
import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreatePutAwayTask, useProducts, useLocations } from '@/hooks/usePutAway';
import { Plus } from 'lucide-react';

const putAwayTaskSchema = z.object({
  product_id: z.string().min(1, 'Producto es requerido'),
  from_location_id: z.string().min(1, 'Ubicación origen es requerida'),
  to_location_id: z.string().min(1, 'Ubicación destino es requerida'),
  quantity_to_putaway: z.string().min(1, 'Cantidad es requerida'),
  priority: z.string().min(1, 'Prioridad es requerida'),
  assigned_to: z.string().optional(),
  notes: z.string().optional(),
});

type PutAwayTaskFormData = z.infer<typeof putAwayTaskSchema>;

export const CreatePutAwayTaskDialog = () => {
  const { t } = useTranslation('putaway');
  const [open, setOpen] = React.useState(false);
  const { data: products } = useProducts();
  const { data: locations } = useLocations();
  const createTask = useCreatePutAwayTask();

  const form = useForm<PutAwayTaskFormData>({
    resolver: zodResolver(putAwayTaskSchema),
    defaultValues: {
      product_id: '',
      from_location_id: '',
      to_location_id: '',
      quantity_to_putaway: '',
      priority: 'medium',
      assigned_to: '',
      notes: '',
    },
  });

  const onSubmit = async (data: PutAwayTaskFormData) => {
    try {
      await createTask.mutateAsync({
        task_number: `PA-${Date.now()}`,
        product_id: data.product_id,
        from_location_id: data.from_location_id,
        to_location_id: data.to_location_id,
        quantity_to_putaway: parseInt(data.quantity_to_putaway),
        priority: data.priority as any,
        status: 'pending',
        assigned_to: data.assigned_to || undefined,
        notes: data.notes || undefined,
        created_by: 'user_123', // TODO: Get from auth context
        created_date: new Date().toISOString(),
        quality_check_required: false,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating put away task:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('allTasks.create_button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('createDialog.title')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('createDialog.product')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('createDialog.select_product')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
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
                name="quantity_to_putaway"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('createDialog.quantity')}</FormLabel>
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
                name="from_location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('createDialog.from_location')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('createDialog.select_origin')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations?.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
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
                name="to_location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('createDialog.to_location')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('createDialog.select_destination')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations?.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('createDialog.priority')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('createDialog.select_priority')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">{t('createDialog.priority_low')}</SelectItem>
                        <SelectItem value="medium">{t('createDialog.priority_medium')}</SelectItem>
                        <SelectItem value="high">{t('createDialog.priority_high')}</SelectItem>
                        <SelectItem value="urgent">{t('createDialog.priority_urgent')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('createDialog.assign_to')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('createDialog.operator_name')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createDialog.notes')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t('createDialog.notes_placeholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('createDialog.cancel_button')}
              </Button>
              <Button type="submit" disabled={createTask.isPending}>
                {createTask.isPending ? t('createDialog.creating_button') : t('createDialog.create_button')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
