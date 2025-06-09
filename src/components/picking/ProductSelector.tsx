
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
import { connectToDatabase } from '@/lib/mongodb';

interface ProductSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProductSelector = ({ value, onChange }: ProductSelectorProps) => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products-for-picking'],
    queryFn: async () => {
      console.log('ProductSelector: Fetching products from MongoDB...');
      const db = await connectToDatabase();
      const collection = db.collection('products');
      
      const data = await collection
        .find({ is_active: true })
        .sort({ name: 1 })
        .toArray();
      
      console.log('ProductSelector: Raw data received:', data);
      
      // Filter valid products with robust validation
      const validProducts = (data || []).filter(product => {
        if (!product) {
          console.warn('ProductSelector: Found null/undefined product');
          return false;
        }
        
        if (!product._id) {
          console.warn('ProductSelector: Product missing _id:', product);
          return false;
        }
        
        const idString = product._id.toString();
        if (!idString || idString.trim().length === 0) {
          console.warn('ProductSelector: Product _id is empty:', product);
          return false;
        }
        
        if (!product.name || typeof product.name !== 'string' || product.name.trim().length === 0) {
          console.warn('ProductSelector: Product missing name:', product);
          return false;
        }
        
        if (!product.sku || typeof product.sku !== 'string' || product.sku.trim().length === 0) {
          console.warn('ProductSelector: Product missing sku:', product);
          return false;
        }
        
        return true;
      });
      
      console.log('ProductSelector: Filtered valid products:', validProducts);
      return validProducts;
    }
  });

  // Additional safety check before rendering with even more robust validation
  const safeProducts = React.useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      if (!product || !product._id) return false;
      
      const idString = product._id?.toString();
      const isValid = idString && 
                     typeof idString === 'string' && 
                     idString.trim().length > 0 &&
                     idString !== 'undefined' &&
                     idString !== 'null' &&
                     idString !== '';
      
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
            <SelectItem value="error-loading-products" disabled>
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
            <SelectItem value="loading-products-state" disabled>
              Cargando productos...
            </SelectItem>
          ) : safeProducts.length > 0 ? (
            safeProducts.map((product) => {
              const idString = product._id.toString();
              
              // Final safety check per item - ensure we never render empty values
              if (!idString || idString.trim().length === 0 || idString === 'undefined' || idString === 'null' || idString === '') {
                console.error('ProductSelector: Attempting to render invalid product:', product);
                return null;
              }
              
              return (
                <SelectItem key={idString} value={idString}>
                  {product.name} ({product.sku})
                </SelectItem>
              );
            }).filter(Boolean) // Remove any null items
          ) : (
            <SelectItem value="no-products-found" disabled>
              No hay productos disponibles
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
