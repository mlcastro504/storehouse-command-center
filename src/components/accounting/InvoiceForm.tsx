
import React from 'react';
import { useInvoiceForm, initialFormData } from '@/hooks/useInvoiceForm';
import { useInvoiceContacts } from '@/hooks/useInvoiceContacts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface InvoiceFormProps {
    onSubmit: (data: typeof initialFormData) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
}

export function InvoiceForm({ onSubmit, onCancel, loading }: InvoiceFormProps) {
    const { formData, setFormData, generateInvoiceNumber, resetForm } = useInvoiceForm();
    const { validContacts } = useInvoiceContacts();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
            resetForm();
        } catch (error) {
            console.error("Failed to submit invoice:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Número de Factura</Label>
              <div className="flex gap-2">
                <Input
                  id="invoice_number"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  placeholder="Ej: V-202401-001"
                  required
                />
                <Button type="button" variant="outline" onClick={generateInvoiceNumber}>
                  Generar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_type">Tipo de Factura</Label>
              <Select
                value={formData.invoice_type}
                onValueChange={(value: 'sale' | 'purchase') => 
                  setFormData({ ...formData, invoice_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Venta</SelectItem>
                  <SelectItem value="purchase">Compra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_id">Cliente/Proveedor</Label>
            <Select
              value={formData.contact_id}
              onValueChange={(value) => setFormData({ ...formData, contact_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar contacto" />
              </SelectTrigger>
              <SelectContent>
                {validContacts.map(contact => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
                {validContacts.length === 0 && (
                  <div className="px-2 py-1 text-sm text-gray-500">No hay contactos disponibles</div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_date">Fecha de Factura</Label>
              <Input
                id="invoice_date"
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Fecha de Vencimiento</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subtotal">Subtotal</Label>
              <Input
                id="subtotal"
                type="number"
                step="0.01"
                value={formData.subtotal}
                onChange={(e) => {
                  const subtotal = parseFloat(e.target.value) || 0;
                  setFormData({ ...formData, subtotal });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_amount">Impuestos</Label>
              <Input
                id="tax_amount"
                type="number"
                step="0.01"
                value={formData.tax_amount}
                onChange={(e) => {
                  const tax_amount = parseFloat(e.target.value) || 0;
                  setFormData({ ...formData, tax_amount });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">Total</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                value={formData.total_amount}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Factura'}
            </Button>
          </div>
        </form>
    );
}
