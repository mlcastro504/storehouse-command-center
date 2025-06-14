
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCancelTask } from '@/hooks/usePutAway';
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
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const cancelTaskSchema = z.object({
  reason: z.string().min(10, 'Motivo debe tener al menos 10 caracteres'),
});

type CancelTaskFormData = z.infer<typeof cancelTaskSchema>;

interface CancelTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: PutAwayTask;
}

export const CancelTaskDialog = ({ open, onOpenChange, task }: CancelTaskDialogProps) => {
  const { t } = useTranslation('putaway');
  const cancelTask = useCancelTask();

  const form = useForm<CancelTaskFormData>({
    resolver: zodResolver(cancelTaskSchema),
    defaultValues: {
      reason: '',
    },
  });

  const onSubmit = async (data: CancelTaskFormData) => {
    try {
      await cancelTask.mutateAsync({
        taskId: task.id,
        reason: data.reason,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error canceling task:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('cancelDialog.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('cancelDialog.alert')}
            </AlertDescription>
          </Alert>

          <div className="text-sm">
            <p><strong>{t('cancelDialog.task')}:</strong> {task.task_number}</p>
            <p><strong>{t('cancelDialog.pallet')}:</strong> {task.pallet?.pallet_number}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('cancelDialog.reason_label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t('cancelDialog.reason_placeholder')}
                        rows={3}
                      />
                    </FormControl>
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
                  {t('cancelDialog.close_button')}
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={cancelTask.isPending}
                >
                  {cancelTask.isPending ? t('cancelDialog.confirming_button') : t('cancelDialog.confirm_button')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
