
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
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  warehouseId?: string;
  label?: string;
  filterTypes?: string[];
}

export function LocationSelector({ 
  value, 
  onValueChange,
  onChange,
  placeholder = "Seleccionar ubicación...",
  disabled = false,
  warehouseId,
  label,
  filterTypes
}: LocationSelectorProps) {
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations-selector', warehouseId],
    queryFn: async () => {
      console.log('LocationSelector: Connecting to MongoDB...');
      const db = await connectToDatabase();
      
      const locationsData = await db.collection('locations')
        .find()
        .sort({ code: 1 })
        .toArray();

      console.log('LocationSelector: Fetched locations from MongoDB:', locationsData.length);
      
      // Convert MongoDB documents to Location interfaces with all required fields
      const locations: Location[] = locationsData.map(doc => ({
        id: doc._id?.toString() || doc.id || `loc_${Date.now()}_${Math.random()}`,
        code: doc.code || '',
        name: doc.name || '',
        warehouse_id: doc.warehouse_id || '',
        type: doc.type || 'bin',
        level: doc.level || 0,
        capacity: doc.capacity || 0,
        current_stock: doc.current_stock || 0,
        current_occupancy: doc.current_occupancy || 0,
        occupancy_status: doc.occupancy_status || 'available',
        confirmation_code: doc.confirmation_code || '',
        is_active: doc.is_active !== false,
        user_id: doc.user_id || 'system',
        created_at: doc.created_at || new Date(),
        updated_at: doc.updated_at || new Date()
      }));
      
      // Apply filtering after fetching - ensure only active locations with valid IDs
      let filteredData = locations.filter(location => 
        location.is_active && 
        location.id && 
        location.id.trim() !== '' && 
        typeof location.id === 'string' &&
        location.id.length > 0
      );
      
      if (warehouseId) {
        filteredData = filteredData.filter(location => 
          location.warehouse_id === warehouseId
        );
      }
      
      return filteredData;
    }
  });

  const handleValueChange = (newValue: string) => {
    if (onValueChange) onValueChange(newValue);
    if (onChange) onChange(newValue);
  };

  // Filter locations by type if filterTypes is provided
  const filteredLocations = filterTypes 
    ? locations?.filter(location => filterTypes.includes(location.type || ''))
    : locations;

  // Additional safety check - ensure no empty values make it to SelectItem
  const safeLocations = filteredLocations?.filter(location => 
    location.id && 
    location.id.trim() !== '' && 
    typeof location.id === 'string' &&
    location.id.length > 0
  ) || [];

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Select disabled={disabled} onValueChange={handleValueChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading-placeholder" disabled>
              Cargando...
            </SelectItem>
          ) : safeLocations.length === 0 ? (
            <SelectItem value="no-locations-placeholder" disabled>
              No hay ubicaciones disponibles
            </SelectItem>
          ) : (
            safeLocations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.code} - {location.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
