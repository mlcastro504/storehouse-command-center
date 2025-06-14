
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCompleteTask } from '@/hooks/usePutAway';
import { PutAwayTask } from '@/types/putaway';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Key } from 'lucide-react';

const completeTaskSchema = z.object({
  confirmationCode: z.string().min(1, 'Código de confirmación requerido'),
});

type CompleteTaskFormData = z.infer<typeof completeTaskSchema>;

interface CompleteTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: PutAwayTask;
}

export const CompleteTaskDialog = ({ open, onOpenChange, task }: CompleteTaskDialogProps) => {
  const { t } = useTranslation('putaway');
  const completeTask = useCompleteTask();

  const form = useForm<CompleteTaskFormData>({
    resolver: zodResolver(completeTaskSchema),
    defaultValues: {
      confirmationCode: '',
    },
  });

  const onSubmit = async (data: CompleteTaskFormData) => {
    try {
      await completeTask.mutateAsync({
        taskId: task.id,
        locationId: task.suggested_location_id,
        confirmationCode: data.confirmationCode,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // El error se maneja en el hook
      console.error('Error completing task:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('completeDialog.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              <strong>{t('completeDialog.location')}:</strong> {task.suggested_location?.name}
              <br />
              <strong>{t('completeDialog.pallet')}:</strong> {task.pallet?.pallet_number}
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="confirmationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      {t('completeDialog.code_label')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('completeDialog.code_placeholder')}
                        className="text-center font-mono text-lg"
                      />
                    </FormControl>
                    <FormDescription>
                      {t('completeDialog.code_desc')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t('completeDialog.cancel_button')}
                </Button>
                <Button
                  type="submit"
                  disabled={completeTask.isPending}
                >
                  {completeTask.isPending ? t('completeDialog.confirming_button') : t('completeDialog.confirm_button')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
