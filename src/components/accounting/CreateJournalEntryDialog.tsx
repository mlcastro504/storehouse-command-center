import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Account } from '@/types/accounting';

const journalEntrySchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  entry_date: z.string().min(1, 'La fecha es requerida'),
  reference: z.string().optional(),
  reference_type: z.enum(['invoice', 'payment', 'adjustment', 'manual']).optional(),
  entry_lines: z.array(z.object({
    account_id: z.string().min(1, 'La cuenta es requerida'),
    debit_amount: z.number().min(0, 'El debe debe ser mayor o igual a 0'),
    credit_amount: z.number().min(0, 'El haber debe ser mayor o igual a 0'),
    description: z.string().optional()
  })).min(2, 'Se requieren al menos 2 líneas de asiento')
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface CreateJournalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateJournalEntryDialog({ open, onOpenChange, onSuccess }: CreateJournalEntryDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      description: '',
      entry_date: new Date().toISOString().split('T')[0],
      reference: '',
      reference_type: 'manual',
      entry_lines: [
        { account_id: '', debit_amount: 0, credit_amount: 0, description: '' },
        { account_id: '', debit_amount: 0, credit_amount: 0, description: '' }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'entry_lines'
  });

  // Obtener cuentas contables
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const db = await connectToDatabase();
      const accountsData = await db.collection('accounts')
        .find({ is_active: true })
        .sort()
        .toArray();
      return accountsData as Account[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: JournalEntryFormData) => {
      console.log('Creating journal entry:', data);
      const db = await connectToDatabase();
      
      // Generar número de asiento
      const lastEntry = await db.collection('journal_entries')
        .find()
        .sort({ created_at: -1 })
        .toArray();
      
      const nextNumber = lastEntry.length > 0 ? 
        parseInt(lastEntry[0].entry_number.replace(/\D/g, '')) + 1 : 1;
      
      const entryNumber = `AST-${nextNumber.toString().padStart(6, '0')}`;
      
      // Calcular total
      const totalAmount = data.entry_lines.reduce((sum, line) => 
        sum + Math.max(line.debit_amount, line.credit_amount), 0
      );
      
      // Crear asiento principal
      const journalEntry = {
        entry_number: entryNumber,
        description: data.description,
        entry_date: data.entry_date,
        reference: data.reference,
        reference_type: data.reference_type,
        total_amount: totalAmount,
        status: 'draft',
        period_id: new Date().getFullYear() + '-' + (new Date().getMonth() + 1).toString().padStart(2, '0'),
        created_by: 'current-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const entryResult = await db.collection('journal_entries').insertOne(journalEntry);
      
      // Crear líneas de asiento una por una
      for (const line of data.entry_lines) {
        const entryLine = {
          journal_entry_id: entryResult.insertedId,
          account_id: line.account_id,
          debit_amount: line.debit_amount,
          credit_amount: line.credit_amount,
          description: line.description,
          created_at: new Date().toISOString()
        };
        
        await db.collection('journal_entry_lines').insertOne(entryLine);
      }
      
      return entryResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast.success('Asiento contable creado correctamente');
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating journal entry:', error);
      toast.error('Error al crear el asiento contable');
    },
  });

  const onSubmit = (data: JournalEntryFormData) => {
    // Validar que el asiento esté balanceado
    const totalDebits = data.entry_lines.reduce((sum, line) => sum + line.debit_amount, 0);
    const totalCredits = data.entry_lines.reduce((sum, line) => sum + line.credit_amount, 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      toast.error('El asiento no está balanceado. El debe debe ser igual al haber.');
      return;
    }
    
    // Validar que cada línea tenga debe O haber, pero no ambos
    const invalidLines = data.entry_lines.some(line => 
      (line.debit_amount > 0 && line.credit_amount > 0) ||
      (line.debit_amount === 0 && line.credit_amount === 0)
    );
    
    if (invalidLines) {
      toast.error('Cada línea debe tener un monto en debe O haber, pero no en ambos.');
      return;
    }
    
    createMutation.mutate(data);
  };

  const addLine = () => {
    append({ account_id: '', debit_amount: 0, credit_amount: 0, description: '' });
  };

  const removeLine = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const watchedLines = form.watch('entry_lines');
  const totalDebits = watchedLines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
  const totalCredits = watchedLines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Asiento Contable</DialogTitle>
          <DialogDescription>
            Crea un nuevo asiento contable. Recuerda que el debe debe ser igual al haber.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información del asiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Descripción del asiento contable"
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entry_date">Fecha *</Label>
                <Input
                  id="entry_date"
                  type="date"
                  {...form.register('entry_date')}
                />
                {form.formState.errors.entry_date && (
                  <p className="text-sm text-red-600">{form.formState.errors.entry_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Referencia</Label>
                <Input
                  id="reference"
                  placeholder="Número de factura, orden, etc."
                  {...form.register('reference')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference_type">Tipo de Referencia</Label>
                <Select onValueChange={(value) => form.setValue('reference_type', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="invoice">Factura</SelectItem>
                    <SelectItem value="payment">Pago</SelectItem>
                    <SelectItem value="adjustment">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Líneas del asiento */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Líneas del Asiento</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Línea
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cuenta</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Debe</TableHead>
                    <TableHead>Haber</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Select onValueChange={(value) => form.setValue(`entry_lines.${index}.account_id`, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar cuenta" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts?.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.code} - {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.entry_lines?.[index]?.account_id && (
                          <p className="text-xs text-red-600 mt-1">
                            {form.formState.errors.entry_lines[index]?.account_id?.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Descripción de la línea"
                          {...form.register(`entry_lines.${index}.description`)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...form.register(`entry_lines.${index}.debit_amount`, { valueAsNumber: true })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...form.register(`entry_lines.${index}.credit_amount`, { valueAsNumber: true })}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(index)}
                          disabled={fields.length <= 2}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totales */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Debe: </span>
                    <span className="font-bold">{formatCurrency(totalDebits)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Total Haber: </span>
                    <span className="font-bold">{formatCurrency(totalCredits)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isBalanced ? (
                      <span className="text-green-600 font-medium">✓ Balanceado</span>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Desbalanceado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || !isBalanced}
            >
              {createMutation.isPending ? 'Creando...' : 'Crear Asiento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
