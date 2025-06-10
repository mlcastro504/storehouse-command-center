
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
      
      // Apply filtering after fetching
      const filteredData = (productsData as Product[]).filter(product => product.is_active);
      
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
