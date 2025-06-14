
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTaskHistory } from '@/hooks/usePutAway';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Package, MapPin, Clock, CheckCircle, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const TaskHistoryList = () => {
  const { t, i18n } = useTranslation('putaway');
  const { user } = useAuth();
  const [showOnlyMine, setShowOnlyMine] = React.useState(false);
  const { data: tasks, isLoading, error } = useTaskHistory(showOnlyMine ? user?.id : undefined);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {t('history.error')}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{t('history.empty_title')}</p>
        <p className="text-sm">
          {showOnlyMine ? t('history.empty_description_mine') : t('history.empty_description_all')}
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="border-green-500 text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t('history.status_completed')}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            {t('history.status_cancelled')}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {t('history.count', { count: tasks.length })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowOnlyMine(!showOnlyMine)}
        >
          <Eye className="h-4 w-4 mr-1" />
          {showOnlyMine ? t('history.view_all') : t('history.view_mine')}
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{task.task_number}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Palet: {task.pallet?.pallet_number}
                  </p>
                </div>
                {getStatusBadge(task.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">{t('history.product')}</p>
                    <p className="font-medium">
                      {task.pallet?.product?.name || 'Desconocido'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">{t('history.location')}</p>
                    <p className="font-medium">
                      {task.actual_location?.name || task.suggested_location?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">{t('history.duration')}</p>
                    <p className="font-medium">
                      {task.duration_minutes ? `${task.duration_minutes} min` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground">{t('history.completed_at')}</p>
                  <p className="font-medium">
                    {task.completed_at
                      ? format(new Date(task.completed_at), 'dd/MM/yyyy HH:mm', { locale: i18n.language === 'es' ? es : undefined })
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {task.notes && (
                <div className="mt-3 p-2 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">{t('history.notes')}:</p>
                  <p className="text-sm">{task.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
