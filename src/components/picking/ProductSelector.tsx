
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
      
      // Filter valid products
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
      const idString = product._id?.toString();
      const isValid = product && 
                     product._id && 
                     idString && 
                     idString.trim().length > 0;
      
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
              const idString = product._id.toString();
              
              // Final safety check per item
              if (!idString || idString.trim().length === 0) {
                console.error('ProductSelector: Attempting to render invalid product:', product);
                return null;
              }
              
              return (
                <SelectItem key={idString} value={idString}>
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
