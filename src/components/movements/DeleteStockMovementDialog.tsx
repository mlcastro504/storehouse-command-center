
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// Aquí deberías crear el hook useDeleteStockMovement si tienes backend real.
// Por ahora simula el éxito.

interface DeleteStockMovementDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  movement: any;
}

export const DeleteStockMovementDialog = ({
  open,
  setOpen,
  movement,
}: DeleteStockMovementDialogProps) => {
  const handleDelete = async () => {
    try {
      // TODO: conectar con tu lógica real (servicio/hook)
      setTimeout(() => {
        setOpen(false);
        toast.success("Movimiento eliminado correctamente");
      }, 500);
    } catch (e) {
      toast.error("Error al eliminar el movimiento");
    }
  };

  if (!movement) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar Movimiento de Stock</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          ¿Estás seguro que deseas eliminar el movimiento del producto <strong>{movement.product}</strong>? Esta acción no se puede deshacer.
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
