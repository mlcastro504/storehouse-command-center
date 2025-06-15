
import React from 'react';
import { useSuppliers } from '@/hooks/useInventory';
import { Supplier } from '@/types/inventory';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Phone, Mail } from "lucide-react";

interface SuppliersListProps {
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SuppliersList({ onEdit, onDelete }: SuppliersListProps) {
  const { data: suppliers, isLoading, error } = useSuppliers();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-muted-foreground">Cargando proveedores...</div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading suppliers:", error);
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-destructive">Error al cargar proveedores. Revisa la consola para más detalles.</div>
      </div>
    );
  }

  if (!suppliers?.length) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">No hay proveedores registrados</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Ciudad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.code}</TableCell>
              <TableCell>{supplier.name}</TableCell>
              <TableCell>{supplier.contact_person || '-'}</TableCell>
              <TableCell>
                {supplier.email ? (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {supplier.email}
                  </div>
                ) : '-'}
              </TableCell>
              <TableCell>
                {supplier.phone ? (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {supplier.phone}
                  </div>
                ) : '-'}
              </TableCell>
              <TableCell>{supplier.city || '-'}</TableCell>
              <TableCell>
                <Badge variant={supplier.is_active ? "default" : "secondary"}>
                  {supplier.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(supplier)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(supplier)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
