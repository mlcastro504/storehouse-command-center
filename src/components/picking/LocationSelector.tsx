
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

// Enhanced helper function to validate and generate safe IDs
const generateSafeId = (doc: any): string => {
  console.log('LocationSelector: Generating ID for doc:', doc);
  
  // Try multiple ID sources with additional validation
  const possibleIds = [
    doc._id?.toString?.(),
    doc.id,
    doc.location_id,
    doc.code ? `loc_${doc.code}` : null,
    doc.name ? `name_${doc.name.replace(/\s+/g, '_').toLowerCase()}` : null
  ].filter(id => id && typeof id === 'string' && id.trim().length > 0 && id !== 'undefined' && id !== 'null');

  if (possibleIds.length > 0) {
    const finalId = possibleIds[0].trim();
    console.log('LocationSelector: Using ID:', finalId);
    return finalId;
  }

  // Enhanced fallback with more randomness
  const fallbackId = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  console.log('LocationSelector: Generated fallback ID:', fallbackId);
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
    console.warn('LocationSelector: Invalid ID detected:', id);
  }
  
  return isValid;
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
      
      // Convert MongoDB documents to Location interfaces with enhanced safe ID generation
      const locations: Location[] = locationsData.map((doc, index) => {
        const safeId = generateSafeId(doc);
        console.log(`LocationSelector: Location ${index} - Generated ID:`, safeId, 'for doc:', doc);
        
        return {
          id: safeId,
          code: doc.code || `LOC${index}`,
          name: doc.name || `Location ${index}`,
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
      
      // Apply ultra-strict filtering with multiple validation layers
      let validLocations = locations.filter((location, index) => {
        const hasValidId = isValidSelectId(location.id);
        const hasValidCode = location.code && typeof location.code === 'string' && location.code.trim().length > 0;
        const isActive = location.is_active === true;
        
        const isValid = hasValidId && hasValidCode && isActive;
        
        if (!isValid) {
          console.warn(`LocationSelector: Filtering out invalid location at index ${index}:`, {
            location,
            hasValidId,
            hasValidCode,
            isActive,
            reasons: {
              invalidId: !hasValidId,
              invalidCode: !hasValidCode,
              inactive: !isActive
            }
          });
        }
        
        return isValid;
      });
      
      if (warehouseId) {
        validLocations = validLocations.filter(location => 
          location.warehouse_id === warehouseId
        );
      }
      
      console.log('LocationSelector: Valid locations after filtering:', validLocations.length);
      console.log('LocationSelector: Valid location IDs:', validLocations.map(l => l.id));
      
      return validLocations;
    }
  });

  const handleValueChange = (newValue: string) => {
    console.log('LocationSelector: Value changed to:', newValue);
    if (onValueChange) onValueChange(newValue);
    if (onChange) onChange(newValue);
  };

  // Filter locations by type if filterTypes is provided
  const filteredLocations = filterTypes 
    ? locations?.filter(location => filterTypes.includes(location.type || ''))
    : locations;

  // Triple safety check before rendering
  const safeLocations = (filteredLocations || []).filter(location => {
    const isSafe = isValidSelectId(location.id) && location.code && location.code.trim().length > 0;
    if (!isSafe) {
      console.error('LocationSelector: Unsafe location detected before render:', location);
    }
    return isSafe;
  });

  console.log('LocationSelector: Final safe locations for rendering:', safeLocations.length);

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Select disabled={disabled} onValueChange={handleValueChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading-placeholder-unique-id" disabled>
              Cargando...
            </SelectItem>
          ) : safeLocations.length === 0 ? (
            <SelectItem value="no-locations-placeholder-unique-id" disabled>
              No hay ubicaciones disponibles
            </SelectItem>
          ) : (
            safeLocations.map((location) => {
              // Final per-item safety validation
              if (!isValidSelectId(location.id)) {
                console.error('LocationSelector: CRITICAL - Invalid ID at render time:', location);
                return null;
              }
              
              console.log('LocationSelector: Rendering item with ID:', location.id);
              
              return (
                <SelectItem key={`location_${location.id}`} value={location.id}>
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
