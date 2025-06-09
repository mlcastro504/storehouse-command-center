
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
  const { data: locations } = useQuery({
    queryKey: ['locations-for-picking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, code, name, type')
        .eq('is_active', true)
        .order('code');
      
      if (error) throw error;
      // Filter out locations with empty, null, or invalid IDs
      return data?.filter(location => 
        location.id && 
        typeof location.id === 'string' && 
        location.id.trim() !== '' &&
        location.code &&
        location.name &&
        location.type
      ) || [];
    }
  });

  const filteredLocations = (locations || []).filter(loc => 
    loc.id && 
    typeof loc.id === 'string' && 
    loc.id.trim() !== '' &&
    filterTypes.includes(loc.type)
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filteredLocations.length > 0 ? (
            filteredLocations.map((location) => (
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
