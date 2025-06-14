
import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePutAwayTasks } from '@/hooks/usePutAway';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package, MapPin, Clock, User, Play, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const PutAwayTasksList = () => {
  const { t, i18n } = useTranslation('putaway');
  const { data: tasks, isLoading, error } = usePutAwayTasks();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {t('allTasks.error')}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{t('allTasks.empty_title')}</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('taskList.status_pending')}</Badge>;
      case 'in_progress':
        return <Badge variant="default">{t('taskList.status_in_progress')}</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-600">{t('taskList.status_completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('taskList.status_cancelled')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">{t('taskList.priority_urgent')}</Badge>;
      case 'high':
        return <Badge variant="destructive">{t('taskList.priority_high')}</Badge>;
      case 'medium':
        return <Badge variant="default">{t('taskList.priority_medium')}</Badge>;
      case 'low':
        return <Badge variant="secondary">{t('taskList.priority_low')}</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('taskList.task')}</TableHead>
            <TableHead>{t('taskList.product')}</TableHead>
            <TableHead>{t('taskList.locations')}</TableHead>
            <TableHead>{t('taskList.quantity')}</TableHead>
            <TableHead>{t('taskList.status')}</TableHead>
            <TableHead>{t('taskList.priority')}</TableHead>
            <TableHead>{t('taskList.assigned_to')}</TableHead>
            <TableHead>{t('taskList.date')}</TableHead>
            <TableHead>{t('taskList.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">
                {task.task_number}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{task.product?.name || 'Producto desconocido'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>{t('taskList.from')}: {task.from_location?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-green-600" />
                    <span>{t('taskList.to')}: {task.to_location?.name || task.suggested_location?.name || 'N/A'}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{task.quantity_completed || 0} / {task.quantity_to_putaway || 0}</div>
                  <div className="text-muted-foreground">{t('taskList.units')}</div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(task.status)}</TableCell>
              <TableCell>{getPriorityBadge(task.priority)}</TableCell>
              <TableCell>
                {task.assigned_to || task.operator_id ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{task.assigned_to || task.operator_id}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">{t('taskList.unassigned')}</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(task.created_date || task.started_at), 'dd/MM/yyyy', { locale: i18n.language === 'es' ? es : undefined })}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {task.status === 'pending' && (
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-1" />
                      {t('taskList.start_button')}
                    </Button>
                  )}
                  {task.status === 'in_progress' && (
                    <Button size="sm" variant="default">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {t('taskList.complete_button')}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
