import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInvoicesPermissions } from "@/hooks/useInvoicesPermissions";

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateInvoiceDialog({ open, onOpenChange, onSuccess }: CreateInvoiceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: '',
    contact_id: '',
    invoice_type: 'sale' as 'sale' | 'purchase',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0,
    notes: ''
  });
  const [toastMsg, setToastMsg] = useState<{ title: string; description: string; variant?: string }|null>(null);

  const { data: contacts = [], refetch } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const db = await connectToDatabase();
      const results = await db.collection('contacts').find({ is_active: true }).sort({ name: 1 }).toArray();
      return results;
    }
  });

  const { canCreateInvoice } = useInvoicesPermissions();

  if (!canCreateInvoice()) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acción no permitida</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            No tienes permisos para crear facturas. Contacta al administrador.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setToastMsg(null);
    try {
      const db = await connectToDatabase();
      await db.collection('invoices').insertOne({
        ...formData,
        created_at: new Date(),
        updated_at: new Date()
      });

      setToastMsg({
        title: "Factura creada",
        description: "La factura ha sido creada exitosamente.",
      });

      onSuccess();
      refetch?.();
      // Limpiar formulario (opcional)
      setFormData(prev => ({
        ...prev,
        invoice_number: '',
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        notes: ''
      }));
    } catch (error) {
      setToastMsg({
        title: "Error",
        description: "No se pudo crear la factura.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = () => {
    const type = formData.invoice_type === 'sale' ? 'V' : 'C';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData({
      ...formData,
      invoice_number: `${type}-${year}${month}-${random}`
    });
  };

  const calculateTotal = () => {
    const total = Number(formData.subtotal) + Number(formData.tax_amount);
    setFormData({
      ...formData,
      total_amount: total
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nueva Factura</DialogTitle>
          <DialogDescription>
            Crear una nueva factura de venta o compra
          </DialogDescription>
        </DialogHeader>
        {toastMsg && (
          <div
            className={`rounded px-3 py-2 mb-2 text-sm ${toastMsg.variant === "destructive" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
          >
            <strong>{toastMsg.title}</strong>
            <div>{toastMsg.description}</div>
          </div>
        )}

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
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar contacto" />
              </SelectTrigger>
              <SelectContent>
                {
                  contacts &&
                  contacts
                    // Filter to ensure valid IDs only
                    .filter(contact => {
                      if (!contact) return false;
                      let id = contact.id ?? contact._id;
                      if (!id) return false;
                      id = String(id).trim();
                      if (!id || id === "") return false;
                      // Defensive: Ensure string
                      return typeof id === "string" && id.length > 0;
                    })
                    .map(contact => {
                      let idRaw = contact.id ?? contact._id;
                      let id = String(idRaw).trim();
                      // Only render if still valid (paranoia check)
                      if (!id || id === "") {
                        // eslint-disable-next-line no-console
                        console.warn("Skipped contact during map due to missing id:", contact);
                        return null;
                      }
                      return (
                        <SelectItem key={id} value={id}>
                          {contact.name ?? id}
                        </SelectItem>
                      );
                    })
                }
                {/* If, after filtering, there are zero contacts, show a placeholder */}
                {(!contacts ||
                  contacts.filter(contact => {
                    if (!contact) return false;
                    let id = contact.id ?? contact._id;
                    if (!id) return false;
                    id = String(id).trim();
                    return !!id && id !== "";
                  }).length === 0) && (
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
                onBlur={calculateTotal}
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
                onBlur={calculateTotal}
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Factura'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// SUGERENCIA: Este archivo es largo, conviene refactorizarlo pronto dividiéndolo en componentes más pequeños.
