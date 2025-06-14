import React, { useState } from 'react';
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
import { Separator } from "@/components/ui/separator";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Account } from '@/types/accounting';
import { useAccountingPermissions } from "@/hooks/useAccountingPermissions";

const journalEntrySchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  reference: z.string().optional(),
  date: z.string().min(1, 'La fecha es requerida'),
  lines: z.array(z.object({
    account_id: z.string().min(1, 'La cuenta es requerida'),
    description: z.string().optional(),
    debit: z.number().min(0),
    credit: z.number().min(0)
  })).min(2, 'Se requieren al menos 2 líneas')
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface CreateJournalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateJournalEntryDialog({ open, onOpenChange, onSuccess }: CreateJournalEntryDialogProps) {
  const queryClient = useQueryClient();
  const [lines, setLines] = useState([
    { account_id: '', description: '', debit: 0, credit: 0 },
    { account_id: '', description: '', debit: 0, credit: 0 }
  ]);

  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      description: '',
      reference: '',
      date: new Date().toISOString().split('T')[0],
      lines: lines
    }
  });

  // Obtener cuentas
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const db = await connectToDatabase();
      const accountsData = await db.collection('accounts')
        .find({ is_active: true })
        .sort({ code: 1 })
        .toArray();
      
      // Convert MongoDB documents to Account interfaces
      const accounts = accountsData.map(doc => ({
        id: doc._id.toString(),
        code: doc.code,
        name: doc.name,
        account_type: doc.account_type,
        description: doc.description,
        is_active: doc.is_active,
        parent_id: doc.parent_id,
        level: doc.level,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      })) as Account[];
      
      return accounts;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: JournalEntryFormData) => {
      console.log('Creating journal entry:', data);
      const db = await connectToDatabase();
      
      // Validar que debito = credito
      const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);
      
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('El total de débitos debe ser igual al total de créditos');
      }
      
      // Generar número de asiento
      const lastEntry = await db.collection('journal_entries')
        .find({})
        .sort({ created_at: -1 })
        .limit(1)
        .toArray();
      
      const nextNumber = lastEntry.length > 0 ? 
        parseInt(lastEntry[0].entry_number.split('-')[1]) + 1 : 1;
      
      const entryNumber = `AS-${nextNumber.toString().padStart(6, '0')}`;
      
      // Crear asiento
      const journalEntry = {
        entry_number: entryNumber,
        description: data.description,
        reference: data.reference,
        date: data.date,
        total_amount: totalDebit,
        status: 'posted',
        created_by: 'current-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const entryResult = await db.collection('journal_entries').insertOne(journalEntry);
      
      // Crear líneas
      const lines = data.lines.map((line, index) => ({
        journal_entry_id: entryResult.insertedId.toString(),
        account_id: line.account_id,
        description: line.description || data.description,
        debit_amount: line.debit,
        credit_amount: line.credit,
        line_number: index + 1,
        created_at: new Date().toISOString()
      }));
      
      // Insert lines one by one since insertMany is now properly supported
      for (const line of lines) {
        await db.collection('journal_entry_lines').insertOne(line);
      }
      
      return entryResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast.success('Asiento contable creado correctamente');
      form.reset();
      setLines([
        { account_id: '', description: '', debit: 0, credit: 0 },
        { account_id: '', description: '', debit: 0, credit: 0 }
      ]);
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Error creating journal entry:', error);
      toast.error(error.message || 'Error al crear el asiento contable');
    },
  });

  const addLine = () => {
    const newLines = [...lines, { account_id: '', description: '', debit: 0, credit: 0 }];
    setLines(newLines);
    form.setValue('lines', newLines);
  };

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      const newLines = lines.filter((_, i) => i !== index);
      setLines(newLines);
      form.setValue('lines', newLines);
    }
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
    form.setValue('lines', newLines);
  };

  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const onSubmit = (data: JournalEntryFormData) => {
    createMutation.mutate(data);
  };

  const { canCreateEntry } = useAccountingPermissions();

  // If user does NOT have permission, show access-denied message instead of the form
  if (!canCreateEntry()) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acción no permitida</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            No tienes permisos para crear asientos contables. Contacta al administrador.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Asiento Contable</DialogTitle>
          <DialogDescription>
            Registra un nuevo asiento contable manual
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Datos generales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Input
                id="description"
                placeholder="Descripción del asiento"
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                {...form.register('date')}
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-600">{form.formState.errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referencia</Label>
            <Input
              id="reference"
              placeholder="Número de documento, factura, etc."
              {...form.register('reference')}
            />
          </div>

          <Separator />

          {/* Líneas del asiento */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Líneas del Asiento</h3>
              <Button type="button" onClick={addLine} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Línea
              </Button>
            </div>

            <div className="space-y-3">
              {lines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                  <div className="col-span-4">
                    <Label>Cuenta</Label>
                    <Select onValueChange={(value) => updateLine(index, 'account_id', value)}>
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
                  </div>

                  <div className="col-span-3">
                    <Label>Descripción</Label>
                    <Input
                      placeholder="Detalle opcional"
                      value={line.description}
                      onChange={(e) => updateLine(index, 'description', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Débito</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.debit}
                      onChange={(e) => updateLine(index, 'debit', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Crédito</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.credit}
                      onChange={(e) => updateLine(index, 'credit', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="col-span-1">
                    {lines.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="flex justify-end space-x-4 text-sm">
              <div className={`p-2 rounded ${isBalanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                Total Débito: €{totalDebit.toFixed(2)}
              </div>
              <div className={`p-2 rounded ${isBalanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                Total Crédito: €{totalCredit.toFixed(2)}
              </div>
              <div className={`p-2 rounded font-medium ${isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isBalanced ? '✓ Balanceado' : '✗ Desbalanceado'}
              </div>
            </div>
          </div>

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
