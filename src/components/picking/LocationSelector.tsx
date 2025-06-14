
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

// Helper function to generate safe IDs and guarantee it's never an empty string
const generateSafeId = (doc: any, index: number): string => {
  const possibleIds = [
    doc._id?.toString?.(),
    doc.id,
    doc.location_id,
    doc.code ? `loc_${doc.code}` : null,
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
  return `location_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Strict validation for SelectItem values
const isValidSelectValue = (value: any): value is string => {
  // NOTE: value must be a non-empty string and NOT 'undefined'/'null'
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value !== 'undefined' &&
    value !== 'null'
  );
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
      const db = await connectToDatabase();

      const locationsData = await db.collection('locations')
        .find()
        .sort({ code: 1 })
        .toArray();

      // Convert MongoDB documents to Location interfaces
      const locations: Location[] = locationsData.map((doc, index) => {
        const safeId = generateSafeId(doc, index);
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

      // Filter valid locations with strict validation
      let validLocations = locations.filter(
        location =>
          isValidSelectValue(location.id) &&
          typeof location.code === 'string' &&
          location.code.trim().length > 0 &&
          location.is_active === true
      );

      // Apply warehouse filter if provided
      if (warehouseId) {
        validLocations = validLocations.filter(
          location => location.warehouse_id === warehouseId
        );
      }

      return validLocations;
    }
  });

  const handleValueChange = (newValue: string) => {
    if (onValueChange) onValueChange(newValue);
    if (onChange) onChange(newValue);
  };

  // Apply type filter if needed
  const filteredLocations = filterTypes
    ? locations?.filter(
        location => filterTypes.includes(location.type || '')
      )
    : locations;

  // Final safety filter before rendering
  const renderableLocations = React.useMemo(
    () =>
      (filteredLocations || []).filter(
        (location) =>
          isValidSelectValue(location.id) &&
          typeof location.code === 'string' &&
          location.code.trim().length > 0
      ),
    [filteredLocations]
  );

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Select
        disabled={disabled}
        onValueChange={handleValueChange}
        value={isValidSelectValue(value) ? value : undefined}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="_loading_location_" disabled>
              Cargando...
            </SelectItem>
          ) : renderableLocations.length === 0 ? (
            <SelectItem value="_no_locations_available_" disabled>
              No hay ubicaciones disponibles
            </SelectItem>
          ) : (
            renderableLocations.map((location) => {
              // Final validation before rendering each SelectItem
              if (!isValidSelectValue(location.id)) {
                console.error("Skipping SelectItem due to invalid/empty id:", location);
                return null;
              }
              return (
                <SelectItem
                  key={`location_${location.id}`}
                  value={location.id}
                >
                  {location.code} - {location.name}
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

