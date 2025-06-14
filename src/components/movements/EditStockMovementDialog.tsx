
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface EditStockMovementDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  movement: any;
}

export const EditStockMovementDialog = ({
  open,
  setOpen,
  movement,
}: EditStockMovementDialogProps) => {
  const [form, setForm] = useState({ quantity: '', notes: '' });

  useEffect(() => {
    if (movement) {
      setForm({
        quantity: movement.quantity ?? '',
        notes: movement.notes ?? ''
      });
    }
  }, [movement]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: conectar con tu lógica real (servicio/hook)
      setTimeout(() => {
        setOpen(false);
        toast.success("Movimiento editado correctamente");
      }, 500);
    } catch (e) {
      toast.error("Error al editar el movimiento");
    }
  };

  if (!movement) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Movimiento de Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Cantidad</label>
            <Input
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              type="number"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Notas</label>
            <Input
              name="notes"
              value={form.notes}
              onChange={handleChange}
              type="text"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
