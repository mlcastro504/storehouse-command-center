
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { Supplier } from '@/types/suppliers';
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
  const { data: suppliers, isLoading, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      console.log('SuppliersList: Connecting to MongoDB...');
      const db = await connectToDatabase();
      
      const suppliersData = await db.collection('suppliers')
        .find()
        .sort({ name: 1 })
        .toArray();

      console.log('SuppliersList: Fetched suppliers from MongoDB:', suppliersData.length);
      
      // Convert MongoDB documents to Supplier interfaces
      const suppliers = suppliersData.map(doc => ({
        id: doc._id.toString(),
        code: doc.code,
        name: doc.name,
        contact_person: doc.contact_person,
        email: doc.email,
        phone: doc.phone,
        address: doc.address,
        city: doc.city,
        state: doc.state,
        postal_code: doc.postal_code,
        country: doc.country,
        tax_id: doc.tax_id,
        payment_terms: doc.payment_terms,
        lead_time_days: doc.lead_time_days,
        notes: doc.notes,
        is_active: doc.is_active,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      })) as Supplier[];
      
      return suppliers;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-muted-foreground">Cargando proveedores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-destructive">Error al cargar proveedores</div>
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
