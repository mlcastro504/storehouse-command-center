import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Contact } from '@/types/accounting';
import { usePaymentsPermissions } from "@/hooks/usePaymentsPermissions";

const paymentSchema = z.object({
  contact_id: z.string().min(1, 'El contacto es requerido'),
  payment_date: z.string().min(1, 'La fecha es requerida'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  currency: z.string().min(1, 'La moneda es requerida'),
  payment_method: z.enum(['cash', 'transfer', 'card', 'check', 'other']),
  reference: z.string().optional(),
  notes: z.string().optional()
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface CreatePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentType: 'received' | 'made';
  onSuccess?: () => void;
}

export function CreatePaymentDialog({ open, onOpenChange, paymentType, onSuccess }: CreatePaymentDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      contact_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      amount: 0,
      currency: 'EUR',
      payment_method: 'transfer',
      reference: '',
      notes: ''
    }
  });

  // Obtener contactos
  const { data: contacts } = useQuery({
    queryKey: ['contacts', paymentType],
    queryFn: async () => {
      const db = await connectToDatabase();
      const contactType = paymentType === 'received' ? 'customer' : 'supplier';
      const contactsData = await db.collection('contacts')
        .find({ 
          $or: [
            { contact_type: contactType },
            { contact_type: 'both' }
          ],
          is_active: true 
        })
        .sort({ name: 1 })
        .toArray();
      
      // Convert MongoDB documents to Contact interfaces
      const contacts = contactsData.map(doc => ({
        id: doc._id.toString(),
        contact_number: doc.contact_number,
        name: doc.name,
        contact_type: doc.contact_type,
        email: doc.email,
        phone: doc.phone,
        address: doc.address,
        tax_id: doc.tax_id,
        is_active: doc.is_active,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      })) as Contact[];
      
      return contacts;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      console.log('Creating payment:', data);
      const db = await connectToDatabase();
      
      // Generar número de pago
      const prefix = paymentType === 'received' ? 'COB' : 'PAG';
      const lastPayment = await db.collection('payments')
        .find({ payment_type: paymentType })
        .sort({ created_at: -1 })
        .limit(1)
        .toArray();
      
      const nextNumber = lastPayment.length > 0 ? 
        parseInt(lastPayment[0].payment_number.split('-')[1]) + 1 : 1;
      
      const paymentNumber = `${prefix}-${nextNumber.toString().padStart(6, '0')}`;
      
      // Crear pago
      const payment = {
        payment_number: paymentNumber,
        payment_type: paymentType,
        contact_id: data.contact_id,
        payment_date: data.payment_date,
        amount: data.amount,
        currency: data.currency,
        exchange_rate: 1, // Por ahora siempre 1
        payment_method: data.payment_method,
        reference: data.reference,
        notes: data.notes,
        status: 'completed',
        created_by: 'current-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const result = await db.collection('payments').insertOne(payment);
      
      // TODO: Crear asiento contable automático
      // TODO: Aplicar a facturas pendientes si es necesario
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      const action = paymentType === 'received' ? 'cobro' : 'pago';
      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} registrado correctamente`);
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating payment:', error);
      const action = paymentType === 'received' ? 'cobro' : 'pago';
      toast.error(`Error al registrar el ${action}`);
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    createMutation.mutate(data);
  };

  const title = paymentType === 'received' ? 'Registrar Cobro' : 'Registrar Pago';
  const description = paymentType === 'received' 
    ? 'Registra un cobro recibido de un cliente'
    : 'Registra un pago realizado a un proveedor';
  const contactLabel = paymentType === 'received' ? 'Cliente' : 'Proveedor';

  const { canCreatePayment } = usePaymentsPermissions();

  if (!canCreatePayment()) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acción no permitida</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            No tienes permisos para registrar este pago/cobro. Contacta al administrador.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact_id">{contactLabel} *</Label>
            <Select onValueChange={(value) => form.setValue('contact_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder={`Seleccionar ${contactLabel.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {contacts?.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.contact_id && (
              <p className="text-sm text-red-600">{form.formState.errors.contact_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_date">Fecha *</Label>
              <Input
                id="payment_date"
                type="date"
                {...form.register('payment_date')}
              />
              {form.formState.errors.payment_date && (
                <p className="text-sm text-red-600">{form.formState.errors.payment_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda *</Label>
              <Select onValueChange={(value) => form.setValue('currency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="EUR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - Dólar</SelectItem>
                  <SelectItem value="GBP">GBP - Libra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...form.register('amount', { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Método de Pago *</Label>
            <Select onValueChange={(value) => form.setValue('payment_method', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="check">Cheque</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.payment_method && (
              <p className="text-sm text-red-600">{form.formState.errors.payment_method.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referencia</Label>
            <Input
              id="reference"
              placeholder="Número de transferencia, cheque, etc."
              {...form.register('reference')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Información adicional sobre el pago"
              {...form.register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Registrando...' : `Registrar ${paymentType === 'received' ? 'Cobro' : 'Pago'}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
