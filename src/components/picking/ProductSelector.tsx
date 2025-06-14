
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

// Helper function to generate safe IDs and guarantee it's never an empty string
const generateSafeId = (doc: any, index: number): string => {
  const possibleIds = [
    doc._id?.toString?.(),
    doc.id,
    doc.product_id,
    doc.sku ? `sku_${doc.sku}` : null,
  ].filter(
    id =>
      typeof id === 'string' &&
      !!id.trim() &&
      id !== 'undefined' &&
      id !== 'null'
  );
  if (possibleIds.length > 0 && possibleIds[0].trim()) {
    return possibleIds[0].trim();
  }
  // Fallback: always return a string that couldn't collide with an empty string!
  return `product_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const isValidSelectValue = (value: any): value is string => {
  // NOTE: value must be a non-empty string and NOT 'undefined'/'null'
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value !== 'undefined' &&
    value !== 'null'
  );
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

      // Filter: only products with valid id, name, is_active
      return products.filter(
        (product) =>
          isValidSelectValue(product.id) &&
          typeof product.name === 'string' &&
          product.name.trim().length > 0 &&
          product.is_active === true
      );
    }
  });

  const handleValueChange = (newValue: string) => {
    if (onValueChange) onValueChange(newValue);
    if (onChange) onChange(newValue);
  };

  // Final safety filter before rendering
  const renderableProducts = React.useMemo(
    () =>
      (products || []).filter(
        (product) =>
          isValidSelectValue(product.id) &&
          typeof product.name === 'string' &&
          product.name.trim().length > 0
      ),
    [products]
  );

  return (
    <Select
      onValueChange={handleValueChange}
      value={isValidSelectValue(value) ? value : undefined}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="_loading_item_" disabled>
            Cargando...
          </SelectItem>
        ) : renderableProducts.length === 0 ? (
          <SelectItem value="_no_products_available_" disabled>
            No hay productos disponibles
          </SelectItem>
        ) : (
          renderableProducts.map((product) => {
            // Final validation before rendering each item
            if (!isValidSelectValue(product.id)) {
              // Log error and skip rendering this product
              console.error("Skipping SelectItem due to invalid/empty id:", product);
              return null;
            }
            return (
              <SelectItem
                key={`product_${product.id}`}
                value={product.id}
              >
                {product.name} ({product.sku})
              </SelectItem>
            );
          })
        )}
      </SelectContent>
    </Select>
  );
}

