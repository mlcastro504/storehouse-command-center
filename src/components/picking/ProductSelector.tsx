
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
      
      // Convert MongoDB documents to Product interfaces with all required fields
      const products: Product[] = productsData.map(doc => ({
        id: doc._id?.toString() || doc.id || `prod_${Date.now()}`,
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
      }));
      
      // Apply filtering after fetching
      const filteredData = products.filter(product => product.is_active);
      
      return filteredData;
    }
  });

  const handleValueChange = (newValue: string) => {
    if (onValueChange) onValueChange(newValue);
    if (onChange) onChange(newValue);
  };

  // Filter out products with invalid IDs (null, undefined, or empty string)
  const validProducts = products?.filter(product => 
    product.id && product.id.trim() !== ''
  );

  return (
    <Select onValueChange={handleValueChange} defaultValue={value} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading" disabled>
            Cargando...
          </SelectItem>
        ) : validProducts?.map((product) => (
          <SelectItem key={product.id} value={product.id}>
            {product.name} ({product.sku})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
