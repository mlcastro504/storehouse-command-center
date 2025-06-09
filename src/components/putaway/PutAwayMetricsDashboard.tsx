
import React from 'react';
import { usePutAwayMetrics } from '@/hooks/usePutAway';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Clock, Users, TrendingUp, AlertCircle, Target } from 'lucide-react';

export const PutAwayMetricsDashboard = () => {
  const { data: metrics, isLoading, error } = usePutAwayMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="text-center text-red-500 py-4">
        Error al cargar las métricas
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Tareas Hoy',
      value: metrics.today_tasks,
      icon: Target,
      color: 'text-blue-600',
    },
    {
      title: 'Palets Pendientes',
      value: metrics.pending_pallets,
      icon: Package,
      color: 'text-orange-600',
    },
    {
      title: 'Operarios Activos',
      value: metrics.active_operators,
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Tiempo Promedio',
      value: `${metrics.average_completion_time}m`,
      icon: Clock,
      color: 'text-purple-600',
    },
    {
      title: 'Tasa de Error',
      value: `${metrics.error_rate}%`,
      icon: AlertCircle,
      color: 'text-red-600',
    },
    {
      title: 'Eficiencia',
      value: `${metrics.efficiency_percentage}%`,
      icon: TrendingUp,
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metricCards.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
