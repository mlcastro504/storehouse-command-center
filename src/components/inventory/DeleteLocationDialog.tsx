
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteLocation } from "@/hooks/useInventory";
import { toast } from "sonner";

interface DeleteLocationDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  location: any;
}

export const DeleteLocationDialog = ({
  open,
  setOpen,
  location,
}: DeleteLocationDialogProps) => {
  const deleteLocation = useDeleteLocation();

  const handleDelete = async () => {
    try {
      await deleteLocation.mutateAsync(location.id);
      setOpen(false);
      toast.success("Ubicación eliminada correctamente");
    } catch (e) {
      toast.error("Error al eliminar la ubicación");
    }
  };

  if (!location) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar Ubicación</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          ¿Estás seguro que deseas eliminar la ubicación{" "}
          <strong>{location.name}</strong>? Esta acción no se puede deshacer.
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteLocation.isPending}
          >
            {deleteLocation.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

