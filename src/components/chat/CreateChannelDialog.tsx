
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChatService } from '@/services/chatService';

export const CreateChannelDialog = () => {
  const form = useForm();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const onSubmit = async (data: any) => {
    try {
      await ChatService.createChannel(data);
      toast({
        title: "Canal creado",
        description: `El canal #${data.name} ha sido creado con éxito.`,
      });
      setOpen(false);
      form.reset();
       // Note: In a real app, we'd refresh the channel list here.
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el canal.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Canal</DialogTitle>
          <DialogDescription>
            Crea un nuevo canal de comunicación para tu equipo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "El nombre es requerido" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Canal</FormLabel>
                  <FormControl>
                    <Input placeholder="ej: #proyecto-alpha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              rules={{ required: "El tipo es requerido" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Canal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe el propósito de este canal..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creando..." : "Crear Canal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
