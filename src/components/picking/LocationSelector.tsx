
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
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations-for-picking', filterTypes],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, code, name, type')
        .eq('is_active', true)
        .order('code');
      
      if (error) throw error;
      
      // Comprehensive filtering to ensure only valid locations with non-empty IDs
      return data?.filter(location => {
        return location && 
               location.id && 
               typeof location.id === 'string' && 
               location.id.trim().length > 0 &&
               location.code && 
               location.code.trim().length > 0 &&
               location.name && 
               location.name.trim().length > 0 &&
               location.type && 
               location.type.trim().length > 0 &&
               filterTypes.includes(location.type);
      }) || [];
    }
  });

  const validLocations = locations || [];

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Cargando ubicaciones...
            </SelectItem>
          ) : validLocations.length > 0 ? (
            validLocations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.code} - {location.name} ({location.type})
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-locations" disabled>
              No hay ubicaciones disponibles
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
