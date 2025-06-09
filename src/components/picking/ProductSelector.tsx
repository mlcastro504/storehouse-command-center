
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProductSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProductSelector = ({ value, onChange }: ProductSelectorProps) => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products-for-picking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      // Comprehensive filtering to ensure only valid products with non-empty IDs
      return data?.filter(product => {
        return product && 
               product.id && 
               typeof product.id === 'string' && 
               product.id.trim().length > 0 &&
               product.name && 
               product.name.trim().length > 0 &&
               product.sku && 
               product.sku.trim().length > 0;
      }) || [];
    }
  });

  const validProducts = products || [];

  return (
    <div className="space-y-2">
      <Label htmlFor="product">Producto *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar producto" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Cargando productos...
            </SelectItem>
          ) : validProducts.length > 0 ? (
            validProducts.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-products" disabled>
              No hay productos disponibles
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
