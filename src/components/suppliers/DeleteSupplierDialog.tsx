
import React from 'react';
import { useDeleteSupplier } from '@/hooks/useInventory';
import { Supplier } from '@/types/inventory';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';

interface DeleteSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
}

export function DeleteSupplierDialog({ open, onOpenChange, supplier }: DeleteSupplierDialogProps) {
  const { hasPermission } = useAuth();
  const deleteMutation = useDeleteSupplier();

  const handleDelete = () => {
    if (!supplier) return;

    if (!hasPermission('delete', 'suppliers')) {
      toast.error('No tienes permisos para eliminar proveedores');
      return;
    }
    
    deleteMutation.mutate(supplier.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  if (!hasPermission('delete', 'suppliers')) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el proveedor{' '}
            <strong>{supplier?.name}</strong> del sistema.
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <strong>Advertencia:</strong> Se verificará que el proveedor no tenga productos asociados antes de la eliminación. Si los tiene, la operación fallará.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
