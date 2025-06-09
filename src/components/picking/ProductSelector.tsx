
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
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products-for-picking'],
    queryFn: async () => {
      console.log('ProductSelector: Fetching products...');
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('ProductSelector: Error fetching products:', error);
        throw error;
      }
      
      console.log('ProductSelector: Raw data received:', data);
      
      // Ultra-comprehensive filtering with logging
      const validProducts = (data || []).filter(product => {
        if (!product) {
          console.warn('ProductSelector: Found null/undefined product');
          return false;
        }
        
        if (!product.id) {
          console.warn('ProductSelector: Product missing id:', product);
          return false;
        }
        
        if (typeof product.id !== 'string') {
          console.warn('ProductSelector: Product id is not string:', product.id, typeof product.id);
          return false;
        }
        
        if (product.id.trim().length === 0) {
          console.warn('ProductSelector: Product id is empty string:', product);
          return false;
        }
        
        if (!product.name || product.name.trim().length === 0) {
          console.warn('ProductSelector: Product missing name:', product);
          return false;
        }
        
        if (!product.sku || product.sku.trim().length === 0) {
          console.warn('ProductSelector: Product missing sku:', product);
          return false;
        }
        
        return true;
      });
      
      console.log('ProductSelector: Filtered valid products:', validProducts);
      return validProducts;
    }
  });

  // Additional safety check before rendering
  const safeProducts = React.useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      const isValid = product && 
                     product.id && 
                     typeof product.id === 'string' && 
                     product.id.trim().length > 0;
      
      if (!isValid) {
        console.error('ProductSelector: Invalid product found during render:', product);
      }
      
      return isValid;
    });
  }, [products]);

  if (error) {
    console.error('ProductSelector: Query error:', error);
    return (
      <div className="space-y-2">
        <Label htmlFor="product">Producto *</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Error cargando productos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="error" disabled>
              Error al cargar productos
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="product">Producto *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar producto" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading-products" disabled>
              Cargando productos...
            </SelectItem>
          ) : safeProducts.length > 0 ? (
            safeProducts.map((product) => {
              // Final safety check per item
              if (!product.id || typeof product.id !== 'string' || product.id.trim().length === 0) {
                console.error('ProductSelector: Attempting to render invalid product:', product);
                return null;
              }
              
              return (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </SelectItem>
              );
            })
          ) : (
            <SelectItem value="no-products-available" disabled>
              No hay productos disponibles
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
