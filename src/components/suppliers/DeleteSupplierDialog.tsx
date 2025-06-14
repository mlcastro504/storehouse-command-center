
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { Supplier } from '@/types/suppliers';
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
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!supplier) return;
      
      // Verificación de permisos de seguridad
      if (!hasPermission('delete', 'suppliers')) {
        throw new Error('No tienes permisos para eliminar proveedores');
      }
      
      console.log('Deleting supplier:', supplier.id);
      const db = await connectToDatabase();
      
      // Verificar si el proveedor tiene productos asociados antes de eliminar
      const productsCount = await db.collection('products')
        .find({ supplier_id: supplier.id })
        .toArray();
        
      if (productsCount.length > 0) {
        throw new Error(`No se puede eliminar el proveedor porque tiene ${productsCount.length} productos asociados`);
      }
      
      // Proceder con la eliminación
      const result = await db.collection('suppliers').deleteOne({ 
        _id: { toString: () => supplier.id } 
      });
      
      if (result.deletedCount === 0) {
        throw new Error('No se pudo eliminar el proveedor');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Proveedor eliminado correctamente');
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Error deleting supplier:', error);
      toast.error(error.message || 'Error al eliminar el proveedor');
    },
  });

  // Verificar permisos antes de mostrar el diálogo
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
            {supplier && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <strong>Advertencia:</strong> Se verificará si el proveedor tiene productos asociados antes de la eliminación.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate()}
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
