
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

// Enhanced helper function to validate and generate safe IDs
const generateSafeId = (doc: any): string => {
  console.log('ProductSelector: Generating ID for doc:', doc);
  
  // Try multiple ID sources with additional validation
  const possibleIds = [
    doc._id?.toString?.(),
    doc.id,
    doc.product_id,
    doc.sku ? `sku_${doc.sku}` : null,
    doc.name ? `name_${doc.name.replace(/\s+/g, '_').toLowerCase()}` : null
  ].filter(id => id && typeof id === 'string' && id.trim().length > 0 && id !== 'undefined' && id !== 'null');

  if (possibleIds.length > 0) {
    const finalId = possibleIds[0].trim();
    console.log('ProductSelector: Using ID:', finalId);
    return finalId;
  }

  // Enhanced fallback with more randomness
  const fallbackId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  console.log('ProductSelector: Generated fallback ID:', fallbackId);
  return fallbackId;
};

// Stricter helper function to validate if an ID is safe for SelectItem
const isValidSelectId = (id: any): id is string => {
  const isValid = typeof id === 'string' && 
         id.trim().length > 0 && 
         id !== '' && 
         id !== 'undefined' && 
         id !== 'null' &&
         id !== 'NaN' &&
         !id.includes('undefined') &&
         !id.includes('null');
  
  if (!isValid) {
    console.warn('ProductSelector: Invalid ID detected:', id);
  }
  
  return isValid;
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
      
      // Convert MongoDB documents to Product interfaces with enhanced safe ID generation
      const products: Product[] = productsData.map((doc, index) => {
        const safeId = generateSafeId(doc);
        console.log(`ProductSelector: Product ${index} - Generated ID:`, safeId, 'for doc:', doc);
        
        return {
          id: safeId,
          sku: doc.sku || `sku_${index}`,
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
      
      // Apply ultra-strict filtering with multiple validation layers
      const validProducts = products.filter((product, index) => {
        const hasValidId = isValidSelectId(product.id);
        const hasValidName = product.name && typeof product.name === 'string' && product.name.trim().length > 0;
        const isActive = product.is_active === true;
        
        const isValid = hasValidId && hasValidName && isActive;
        
        if (!isValid) {
          console.warn(`ProductSelector: Filtering out invalid product at index ${index}:`, {
            product,
            hasValidId,
            hasValidName,
            isActive,
            reasons: {
              invalidId: !hasValidId,
              invalidName: !hasValidName,
              inactive: !isActive
            }
          });
        }
        
        return isValid;
      });
      
      console.log('ProductSelector: Valid products after filtering:', validProducts.length);
      console.log('ProductSelector: Valid product IDs:', validProducts.map(p => p.id));
      
      return validProducts;
    }
  });

  const handleValueChange = (newValue: string) => {
    console.log('ProductSelector: Value changed to:', newValue);
    if (onValueChange) onValueChange(newValue);
    if (onChange) onChange(newValue);
  };

  // Triple safety check before rendering
  const safeProducts = (products || []).filter(product => {
    const isSafe = isValidSelectId(product.id) && product.name && product.name.trim().length > 0;
    if (!isSafe) {
      console.error('ProductSelector: Unsafe product detected before render:', product);
    }
    return isSafe;
  });

  console.log('ProductSelector: Final safe products for rendering:', safeProducts.length);

  return (
    <Select onValueChange={handleValueChange} defaultValue={value} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading-placeholder-unique-id" disabled>
            Cargando...
          </SelectItem>
        ) : safeProducts.length === 0 ? (
          <SelectItem value="no-products-placeholder-unique-id" disabled>
            No hay productos disponibles
          </SelectItem>
        ) : (
          safeProducts.map((product) => {
            // Final per-item safety validation
            if (!isValidSelectId(product.id)) {
              console.error('ProductSelector: CRITICAL - Invalid ID at render time:', product);
              return null;
            }
            
            console.log('ProductSelector: Rendering item with ID:', product.id);
            
            return (
              <SelectItem key={`product_${product.id}`} value={product.id}>
                {product.name} ({product.sku})
              </SelectItem>
            );
          }).filter(Boolean)
        )}
      </SelectContent>
    </Select>
  );
}
