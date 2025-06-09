
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';

interface LocationSelectorProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  filterTypes: string[];
}

export const LocationSelector = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  filterTypes 
}: LocationSelectorProps) => {
  const { data: locations, isLoading, error } = useQuery({
    queryKey: ['locations-for-picking', filterTypes],
    queryFn: async () => {
      console.log('LocationSelector: Fetching locations from MongoDB for types:', filterTypes);
      const db = await connectToDatabase();
      const collection = db.collection('locations');
      
      const data = await collection
        .find({ 
          is_active: true,
          type: { $in: filterTypes }
        })
        .sort({ code: 1 })
        .toArray();
      
      console.log('LocationSelector: Raw data received:', data);
      
      // Filter valid locations
      const validLocations = (data || []).filter(location => {
        if (!location) {
          console.warn('LocationSelector: Found null/undefined location');
          return false;
        }
        
        if (!location._id) {
          console.warn('LocationSelector: Location missing _id:', location);
          return false;
        }
        
        const idString = location._id.toString();
        if (!idString || idString.trim().length === 0) {
          console.warn('LocationSelector: Location _id is empty:', location);
          return false;
        }
        
        if (!location.code || location.code.trim().length === 0) {
          console.warn('LocationSelector: Location missing code:', location);
          return false;
        }
        
        if (!location.name || location.name.trim().length === 0) {
          console.warn('LocationSelector: Location missing name:', location);
          return false;
        }
        
        if (!location.type || location.type.trim().length === 0) {
          console.warn('LocationSelector: Location missing type:', location);
          return false;
        }
        
        if (!filterTypes.includes(location.type)) {
          console.log('LocationSelector: Location type not in filter:', location.type, 'allowed:', filterTypes);
          return false;
        }
        
        return true;
      });
      
      console.log('LocationSelector: Filtered valid locations:', validLocations);
      return validLocations;
    }
  });

  // Additional safety check before rendering
  const safeLocations = React.useMemo(() => {
    if (!locations) return [];
    
    return locations.filter(location => {
      const idString = location._id?.toString();
      const isValid = location && 
                     location._id && 
                     idString && 
                     idString.trim().length > 0;
      
      if (!isValid) {
        console.error('LocationSelector: Invalid location found during render:', location);
      }
      
      return isValid;
    });
  }, [locations]);

  if (error) {
    console.error('LocationSelector: Query error:', error);
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Error cargando ubicaciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="error-locations" disabled>
              Error al cargar ubicaciones
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading-locations" disabled>
              Cargando ubicaciones...
            </SelectItem>
          ) : safeLocations.length > 0 ? (
            safeLocations.map((location) => {
              const idString = location._id.toString();
              
              // Final safety check per item
              if (!idString || idString.trim().length === 0) {
                console.error('LocationSelector: Attempting to render invalid location:', location);
                return null;
              }
              
              return (
                <SelectItem key={idString} value={idString}>
                  {location.code} - {location.name} ({location.type})
                </SelectItem>
              );
            })
          ) : (
            <SelectItem value="no-locations-available" disabled>
              No hay ubicaciones disponibles
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
