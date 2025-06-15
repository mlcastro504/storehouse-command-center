import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryService } from '@/services/inventoryService';
import { toast } from 'sonner';
import { Supplier } from '@/types/inventory';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: InventoryService.getProducts,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: InventoryService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      InventoryService.updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: InventoryService.getCategories,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: InventoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast.error('Error al crear la categoría');
    },
  });
};

export const useWarehouses = () => {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: InventoryService.getWarehouses,
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: InventoryService.createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Almacén creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating warehouse:', error);
      toast.error('Error al crear el almacén');
    },
  });
};

export const useLocations = (warehouseId?: string) => {
  return useQuery({
    queryKey: ['locations', warehouseId],
    queryFn: () => InventoryService.getLocations(warehouseId),
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: InventoryService.createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Ubicación creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating location:', error);
      toast.error('Error al crear la ubicación');
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      InventoryService.updateLocation(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Ubicación actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating location:', error);
      toast.error('Error al actualizar la ubicación');
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InventoryService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Ubicación eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting location:', error);
      toast.error('Error al eliminar la ubicación');
    },
  });
};

export const useStockLevels = (productId?: string, locationId?: string) => {
  return useQuery({
    queryKey: ['stock-levels', productId, locationId],
    queryFn: () => InventoryService.getStockLevels(productId, locationId),
  });
};

export const useUpdateStockLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, locationId, updates }: { 
      productId: string; 
      locationId: string; 
      updates: any 
    }) => InventoryService.updateStockLevel(productId, locationId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-levels'] });
      toast.success('Nivel de stock actualizado');
    },
    onError: (error) => {
      console.error('Error updating stock level:', error);
      toast.error('Error al actualizar el nivel de stock');
    },
  });
};

export const useStockMovements = (productId?: string) => {
  return useQuery({
    queryKey: ['stock-movements', productId],
    queryFn: () => InventoryService.getStockMovements(productId),
  });
};

export const useCreateStockMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: InventoryService.createStockMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-levels'] });
      toast.success('Movimiento de stock registrado');
    },
    onError: (error) => {
      console.error('Error creating stock movement:', error);
      toast.error('Error al registrar el movimiento de stock');
    },
  });
};

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: InventoryService.getSuppliers,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: InventoryService.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Proveedor creado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error creating supplier:', error);
      toast.error(error.message || 'Error al crear el proveedor');
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Supplier> }) =>
      InventoryService.updateSupplier(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Proveedor actualizado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error updating supplier:', error);
      toast.error(error.message || 'Error al actualizar el proveedor');
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InventoryService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Proveedor eliminado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error deleting supplier:', error);
      toast.error(error.message || 'Error al eliminar el proveedor');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InventoryService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    },
  });
};
