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
import { Location } from '@/types/inventory';

interface LocationSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  warehouseId?: string;
}

export function LocationSelector({ 
  value, 
  onValueChange, 
  placeholder = "Seleccionar ubicación...",
  disabled = false,
  warehouseId
}: LocationSelectorProps) {
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations-selector', warehouseId],
    queryFn: async () => {
      console.log('LocationSelector: Connecting to MongoDB...');
      const db = await connectToDatabase();
      
      const filter = warehouseId ? { warehouse_id: warehouseId, is_active: true } : { is_active: true };
      const locationsData = await db.collection('locations')
        .find(filter)
        .sort({ code: 1 })
        .toArray();

      console.log('LocationSelector: Fetched locations from MongoDB:', locationsData.length);
      return locationsData as Location[];
    }
  });

  return (
    <Select disabled={disabled} onValueChange={onValueChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading" disabled>Cargando...</SelectItem>
        ) : (
          locations?.map((location) => (
            <SelectItem key={location.id} value={location.id || ''}>
              {location.code} - {location.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
