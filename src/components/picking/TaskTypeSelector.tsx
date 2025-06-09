
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const TaskTypeSelector = ({ value, onChange }: TaskTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Tipo de Tarea</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sale">Venta</SelectItem>
          <SelectItem value="transfer">Transferencia</SelectItem>
          <SelectItem value="replenishment">Reposición</SelectItem>
          <SelectItem value="quality_control">Control Calidad</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
