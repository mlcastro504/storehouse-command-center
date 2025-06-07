
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function EcommerceSyncLogs() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['ecommerce-sync-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ecommerce_sync_logs')
        .select(`
          *,
          connection:ecommerce_connections(
            store_name,
            platform:ecommerce_platforms(display_name)
          )
        `)
        .order('started_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'partial': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'started': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'partial': return 'secondary';
      case 'started': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Logs de Sincronización</h2>
        <p className="text-muted-foreground">
          Historial de sincronizaciones con tus plataformas de e-commerce
        </p>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay logs de sincronización</h3>
              <p className="text-muted-foreground">
                Los logs aparecerán aquí cuando comiences a sincronizar tus tiendas
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log: any) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(log.status)}
                    <div>
                      <CardTitle className="text-base">
                        Sincronización de {log.sync_type}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {log.connection?.store_name} - {log.connection?.platform?.display_name}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Procesados</p>
                    <p className="text-muted-foreground">{log.records_processed || 0}</p>
                  </div>
                  <div>
                    <p className="font-medium">Exitosos</p>
                    <p className="text-green-600">{log.records_success || 0}</p>
                  </div>
                  <div>
                    <p className="font-medium">Fallidos</p>
                    <p className="text-red-600">{log.records_failed || 0}</p>
                  </div>
                  <div>
                    <p className="font-medium">Duración</p>
                    <p className="text-muted-foreground">
                      {log.duration_seconds ? `${log.duration_seconds}s` : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Iniciado:</span> {new Date(log.started_at).toLocaleString()}
                  </p>
                  {log.completed_at && (
                    <p className="text-sm">
                      <span className="font-medium">Completado:</span> {new Date(log.completed_at).toLocaleString()}
                    </p>
                  )}
                  {log.error_message && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">
                        <span className="font-medium">Error:</span> {log.error_message}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
