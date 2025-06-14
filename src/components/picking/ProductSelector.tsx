import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from '@/types/inventory';

interface ProductSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Helper function to generate safe IDs
const generateSafeId = (doc: any, index: number): string => {
  // Try multiple ID sources
  const possibleIds = [
    doc._id?.toString?.(),
    doc.id,
    doc.product_id,
    doc.sku ? `sku_${doc.sku}` : null,
  ].filter(id => id && typeof id === 'string' && id.trim().length > 0);

  if (possibleIds.length > 0) {
    return possibleIds[0].trim();
  }

  // Fallback with guaranteed uniqueness
  return `product_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Strict validation for SelectItem values
const isValidSelectValue = (value: any): value is string => {
  return typeof value === 'string' && 
         value.trim().length > 0 && 
         value !== 'undefined' && 
         value !== 'null' &&
         value !== '';
};

export function ProductSelector({ 
  value, 
  onValueChange,
  onChange,
  placeholder = "Seleccionar producto...",
  disabled = false 
}: ProductSelectorProps) {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products-selector'],
    queryFn: async () => {
      const db = await connectToDatabase();
      
      const productsData = await db.collection('products')
        .find()
        .sort({ name: 1 })
        .toArray();

      // Convert MongoDB documents to Product interfaces
      const products: Product[] = productsData.map((doc, index) => {
        const safeId = generateSafeId(doc, index);
        
        return {
          id: safeId,
          sku: doc.sku || `SKU${index}`,
          name: doc.name || `Product ${index}`,
          description: doc.description || '',
          category_id: doc.category_id || '',
          supplier_id: doc.supplier_id || '',
          unit_of_measure: doc.unit_of_measure || 'unit',
          weight: doc.weight || 0,
          dimensions: doc.dimensions || '',
          barcode: doc.barcode || '',
          is_active: doc.is_active !== false,
          minimum_stock: doc.minimum_stock || 0,
          maximum_stock: doc.maximum_stock || 0,
          min_stock_level: doc.min_stock_level || doc.minimum_stock || 0,
          max_stock_level: doc.max_stock_level || doc.maximum_stock || 0,
          reorder_point: doc.reorder_point || 0,
          cost_price: doc.cost_price || 0,
          sale_price: doc.sale_price || 0,
          tax_rate: doc.tax_rate || 0,
          location_id: doc.location_id || '',
          user_id: doc.user_id || 'system',
          created_at: doc.created_at || new Date(),
          updated_at: doc.updated_at || new Date()
        };
      });
      
      // Filter valid products with strict validation
      const validProducts = products.filter((product) => {
        return isValidSelectValue(product.id) && 
               product.name && 
               product.name.trim().length > 0 && 
               product.is_active === true;
      });
      
      return validProducts;
    }
  });

  const handleValueChange = (newValue: string) => {
    if (onValueChange) onValueChange(newValue);
    if (onChange) onChange(newValue);
  };

  // Final safety check before rendering
  const safeProducts = (products || []).filter(product => 
    isValidSelectValue(product.id) && product.name && product.name.trim().length > 0
  );

  return (
    <Select 
      onValueChange={handleValueChange} 
      // Use undefined if value is empty string
      value={value && value !== "" ? value : undefined}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="_loading_">
            Cargando...
          </SelectItem>
        ) : safeProducts.length === 0 ? (
          <SelectItem value="_no_products_">
            No hay productos disponibles
          </SelectItem>
        ) : (
          safeProducts
            .filter(product => !!product.id && product.id !== "")
            .map((product) => (
              <SelectItem key={`product_${product.id}`} value={product.id}>
                {product.name} ({product.sku})
              </SelectItem>
            ))
        )}
      </SelectContent>
    </Select>
  );
}
