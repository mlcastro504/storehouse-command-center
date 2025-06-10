
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Truck } from 'lucide-react';
import { SuppliersList } from '@/components/suppliers/SuppliersList';
import { CreateSupplierDialog } from '@/components/suppliers/CreateSupplierDialog';
import { DeleteSupplierDialog } from '@/components/suppliers/DeleteSupplierDialog';
import { Supplier } from '@/types/suppliers';

export default function Suppliers() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
  };

  const handleDelete = (supplier: Supplier) => {
    setDeletingSupplier(supplier);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setEditingSupplier(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Proveedores</h1>
            <p className="text-muted-foreground">
              Gestión de proveedores y relaciones comerciales
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </div>

        {/* Main Content */}
        <Card className="warehouse-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Lista de Proveedores
                </CardTitle>
                <CardDescription>
                  Administra y gestiona tu catálogo de proveedores
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SuppliersList 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        {/* Dialogs */}
        <CreateSupplierDialog
          open={createDialogOpen || !!editingSupplier}
          onOpenChange={handleCreateDialogClose}
          supplier={editingSupplier}
        />

        <DeleteSupplierDialog
          open={!!deletingSupplier}
          onOpenChange={(open) => !open && setDeletingSupplier(null)}
          supplier={deletingSupplier}
        />
      </div>
    </MainLayout>
  );
}
