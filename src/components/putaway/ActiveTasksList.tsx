
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useActiveTasks } from '@/hooks/usePutAway';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CompleteTaskDialog } from './CompleteTaskDialog';
import { CancelTaskDialog } from './CancelTaskDialog';
import { Package, MapPin, Clock, User, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ActiveTasksList = () => {
  const { t, i18n } = useTranslation('putaway');
  const { user } = useAuth();
  const { data: tasks, isLoading, error } = useActiveTasks(user?.id); // Only show user's tasks
  const [selectedTask, setSelectedTask] = React.useState<any | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = React.useState(false);
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {t('active.error')}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{t('active.empty_title')}</p>
        <p className="text-sm">{t('active.empty_description')}</p>
      </div>
    );
  }

  const handleCompleteTask = (task: any) => {
    setSelectedTask(task);
    setShowCompleteDialog(true);
  };

  const handleCancelTask = (task: any) => {
    setSelectedTask(task);
    setShowCancelDialog(true);
  };

  return (
    <>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{task.task_number}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t('active.pallet')}: {task.pallet?.pallet_number}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="default">{t('active.status_in_progress')}</Badge>
                  <Badge variant="outline">{task.priority}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('active.product')}</p>
                    <p className="font-medium">
                      {task.pallet?.product?.name || 'Desconocido'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('active.suggested_location')}</p>
                    <p className="font-medium">
                      {task.suggested_location?.name || 'No asignada'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('active.started')}</p>
                    <p className="font-medium">
                      {format(new Date(task.started_at), 'dd/MM HH:mm', { locale: i18n.language === 'es' ? es : undefined })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {t('active.assigned_to')}: {task.operator_id === user?.id ? t('active.assigned_to_you') : task.operator_id}
                </span>
              </div>

              {task.operator_id === user?.id && (
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelTask(task)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    {t('active.cancel_button')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleCompleteTask(task)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {t('active.complete_button')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTask && (
        <>
          <CompleteTaskDialog
            open={showCompleteDialog}
            onOpenChange={setShowCompleteDialog}
            task={selectedTask}
          />
          <CancelTaskDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
            task={selectedTask}
          />
        </>
      )}
    </>
  );
};
