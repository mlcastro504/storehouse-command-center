
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { StockMoveService } from '@/services/stockMoveService';

interface ExecutionHistoryListProps {
  refreshTrigger: number;
}

export const ExecutionHistoryList: React.FC<ExecutionHistoryListProps> = ({
  refreshTrigger
}) => {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExecutions();
  }, [refreshTrigger]);

  const loadExecutions = async () => {
    try {
      setLoading(true);
      const data = await StockMoveService.getExecutionHistory();
      setExecutions(data);
    } catch (error) {
      console.error('Error loading execution history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'partial': return 'bg-orange-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'partial': return 'Parcial';
      case 'failed': return 'Fallido';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando historial...</div>;
  }

  if (executions.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ejecuciones registradas</h3>
        <p className="mt-1 text-sm text-gray-500">
          Las ejecuciones de tareas aparecerán aquí una vez completadas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Cantidad Movida</TableHead>
            <TableHead>Código Validación</TableHead>
            <TableHead>Ejecutado Por</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Notas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {executions.map((execution) => (
            <TableRow key={execution.id}>
              <TableCell>
                <Badge className={`${getStatusColor(execution.execution_status)} flex items-center`}>
                  {getStatusIcon(execution.execution_status)}
                  <span className="ml-1">{getStatusLabel(execution.execution_status)}</span>
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{execution.task?.products?.name}</div>
                  <div className="text-sm text-gray-500">SKU: {execution.task?.products?.sku}</div>
                </div>
              </TableCell>
              <TableCell className="font-medium">{execution.quantity_moved}</TableCell>
              <TableCell>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {execution.validation_code_used}
                </code>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{execution.executed_by}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-1 text-gray-400" />
                  {new Date(execution.completed_at).toLocaleString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-xs truncate text-sm text-gray-500">
                  {execution.execution_notes || '-'}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
