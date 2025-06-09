
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
import { supabase } from '@/integrations/supabase/client';

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
      console.log('LocationSelector: Fetching locations for types:', filterTypes);
      const { data, error } = await supabase
        .from('locations')
        .select('id, code, name, type')
        .eq('is_active', true)
        .order('code');
      
      if (error) {
        console.error('LocationSelector: Error fetching locations:', error);
        throw error;
      }
      
      console.log('LocationSelector: Raw data received:', data);
      
      // Ultra-comprehensive filtering with logging
      const validLocations = (data || []).filter(location => {
        if (!location) {
          console.warn('LocationSelector: Found null/undefined location');
          return false;
        }
        
        if (!location.id) {
          console.warn('LocationSelector: Location missing id:', location);
          return false;
        }
        
        if (typeof location.id !== 'string') {
          console.warn('LocationSelector: Location id is not string:', location.id, typeof location.id);
          return false;
        }
        
        if (location.id.trim().length === 0) {
          console.warn('LocationSelector: Location id is empty string:', location);
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
      const isValid = location && 
                     location.id && 
                     typeof location.id === 'string' && 
                     location.id.trim().length > 0;
      
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
              // Final safety check per item
              if (!location.id || typeof location.id !== 'string' || location.id.trim().length === 0) {
                console.error('LocationSelector: Attempting to render invalid location:', location);
                return null;
              }
              
              return (
                <SelectItem key={location.id} value={location.id}>
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
