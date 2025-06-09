
import React from 'react';
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
          <DialogTitle>Completar Tarea Put Away</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              <strong>Ubicación:</strong> {task.suggested_location?.name}
              <br />
              <strong>Palet:</strong> {task.pallet?.pallet_number}
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
                      Código de Confirmación
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ingresa el código de la ubicación"
                        className="text-center font-mono text-lg"
                      />
                    </FormControl>
                    <FormDescription>
                      Escanea o ingresa el código único de la ubicación donde colocaste el palet
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
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={completeTask.isPending}
                >
                  {completeTask.isPending ? 'Completando...' : 'Completar Tarea'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
