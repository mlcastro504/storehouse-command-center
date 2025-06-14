
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

// Helper function to validate and generate safe IDs
const generateSafeId = (doc: any): string => {
  // Try multiple ID sources
  const possibleIds = [
    doc._id?.toString?.(),
    doc.id,
    doc.location_id,
    doc.code ? `loc_${doc.code}` : null
  ].filter(id => id && typeof id === 'string' && id.trim().length > 0);

  if (possibleIds.length > 0) {
    return possibleIds[0];
  }

  // Fallback to timestamp-based ID
  return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to validate if an ID is safe for SelectItem
const isValidSelectId = (id: any): id is string => {
  return typeof id === 'string' && 
         id.trim().length > 0 && 
         id !== '' && 
         id !== 'undefined' && 
         id !== 'null';
};

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
      
      // Convert MongoDB documents to Location interfaces with safe ID generation
      const locations: Location[] = locationsData.map(doc => {
        const safeId = generateSafeId(doc);
        console.log('LocationSelector: Generated ID for location:', { original: doc, safeId });
        
        return {
          id: safeId,
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
        };
      });
      
      // Apply strict filtering - only active locations with valid IDs
      let validLocations = locations.filter(location => {
        const isValid = location.is_active && 
                       isValidSelectId(location.id) && 
                       location.code && 
                       location.code.trim().length > 0;
        
        if (!isValid) {
          console.log('LocationSelector: Filtering out invalid location:', location);
        }
        
        return isValid;
      });
      
      if (warehouseId) {
        validLocations = validLocations.filter(location => 
          location.warehouse_id === warehouseId
        );
      }
      
      console.log('LocationSelector: Valid locations after filtering:', validLocations.length);
      return validLocations;
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

  // Final safety check before rendering - ensure no empty values
  const safeLocations = (filteredLocations || []).filter(location => isValidSelectId(location.id));

  console.log('LocationSelector: Rendering with locations:', safeLocations.length);

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
            safeLocations.map((location) => {
              // Additional safety check per item
              if (!isValidSelectId(location.id)) {
                console.error('LocationSelector: Skipping location with invalid ID:', location);
                return null;
              }
              
              return (
                <SelectItem key={location.id} value={location.id}>
                  {location.code} - {location.name}
                </SelectItem>
              );
            }).filter(Boolean)
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
