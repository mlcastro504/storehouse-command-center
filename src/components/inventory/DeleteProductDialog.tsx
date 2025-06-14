
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteProduct } from "@/hooks/useInventory";
import { toast } from "sonner";

interface DeleteProductDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  product: any;
}

export const DeleteProductDialog = ({
  open,
  setOpen,
  product,
}: DeleteProductDialogProps) => {
  const deleteProduct = useDeleteProduct();

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(product.id);
      setOpen(false);
      toast.success("Producto eliminado correctamente");
    } catch (e) {
      toast.error("Error al eliminar el producto");
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar Producto</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          ¿Estás seguro que deseas eliminar el producto <strong>{product.name}</strong>? Esta acción no se puede deshacer.
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteProduct.isPending}>
            {deleteProduct.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
