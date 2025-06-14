
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

// Helper function to validate and generate safe IDs
const generateSafeId = (doc: any): string => {
  // Try multiple ID sources
  const possibleIds = [
    doc._id?.toString?.(),
    doc.id,
    doc.product_id,
    doc.sku ? `sku_${doc.sku}` : null
  ].filter(id => id && typeof id === 'string' && id.trim().length > 0);

  if (possibleIds.length > 0) {
    return possibleIds[0];
  }

  // Fallback to timestamp-based ID
  return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to validate if an ID is safe for SelectItem
const isValidSelectId = (id: any): id is string => {
  return typeof id === 'string' && 
         id.trim().length > 0 && 
         id !== '' && 
         id !== 'undefined' && 
         id !== 'null';
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
      console.log('ProductSelector: Connecting to MongoDB...');
      const db = await connectToDatabase();
      
      const productsData = await db.collection('products')
        .find()
        .sort({ name: 1 })
        .toArray();

      console.log('ProductSelector: Fetched products from MongoDB:', productsData.length);
      
      // Convert MongoDB documents to Product interfaces with safe ID generation
      const products: Product[] = productsData.map(doc => {
        const safeId = generateSafeId(doc);
        console.log('ProductSelector: Generated ID for product:', { original: doc, safeId });
        
        return {
          id: safeId,
          sku: doc.sku || '',
          name: doc.name || '',
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
      
      // Apply strict filtering - only active products with valid IDs
      const validProducts = products.filter(product => {
        const isValid = product.is_active && 
                       isValidSelectId(product.id) && 
                       product.name && 
                       product.name.trim().length > 0;
        
        if (!isValid) {
          console.log('ProductSelector: Filtering out invalid product:', product);
        }
        
        return isValid;
      });
      
      console.log('ProductSelector: Valid products after filtering:', validProducts.length);
      return validProducts;
    }
  });

  const handleValueChange = (newValue: string) => {
    if (onValueChange) onValueChange(newValue);
    if (onChange) onChange(newValue);
  };

  // Final safety check before rendering - ensure no empty values
  const safeProducts = (products || []).filter(product => isValidSelectId(product.id));

  console.log('ProductSelector: Rendering with products:', safeProducts.length);

  return (
    <Select onValueChange={handleValueChange} defaultValue={value} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading-placeholder" disabled>
            Cargando...
          </SelectItem>
        ) : safeProducts.length === 0 ? (
          <SelectItem value="no-products-placeholder" disabled>
            No hay productos disponibles
          </SelectItem>
        ) : (
          safeProducts.map((product) => {
            // Additional safety check per item
            if (!isValidSelectId(product.id)) {
              console.error('ProductSelector: Skipping product with invalid ID:', product);
              return null;
            }
            
            return (
              <SelectItem key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </SelectItem>
            );
          }).filter(Boolean)
        )}
      </SelectContent>
    </Select>
  );
}
