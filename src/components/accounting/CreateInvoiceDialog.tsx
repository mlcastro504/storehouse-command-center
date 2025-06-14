
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInvoicesPermissions } from "@/hooks/useInvoicesPermissions";
import { InvoiceForm } from './InvoiceForm';
import { initialFormData } from '@/hooks/useInvoiceForm';

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateInvoiceDialog({ open, onOpenChange, onSuccess }: CreateInvoiceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ title: string; description: string; variant?: string }|null>(null);
  const queryClient = useQueryClient();

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

  const handleFormSubmit = async (formData: typeof initialFormData) => {
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
      
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      setToastMsg({
        title: "Error",
        description: "No se pudo crear la factura.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
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

        <InvoiceForm 
            onSubmit={handleFormSubmit}
            onCancel={() => onOpenChange(false)}
            loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
