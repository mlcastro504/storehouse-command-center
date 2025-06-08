
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InventoryService } from '@/services/inventoryService';
import { getDatabaseStats } from '@/lib/mongodb';
import { toast } from 'sonner';
import { Database, CheckCircle, XCircle, Activity, HardDrive } from 'lucide-react';

export const ConnectionTest = () => {
  const [testing, setTesting] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [dbStats, setDbStats] = React.useState<any>(null);

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus('idle');
    setDbStats(null);
    
    try {
      console.log('Starting comprehensive connection test...');
      
      // Test básico de conexión
      const result = await InventoryService.testConnection();
      
      if (result.success) {
        // Obtener estadísticas de la base de datos
        const stats = await getDatabaseStats();
        setDbStats(stats);
        
        setConnectionStatus('success');
        toast.success('Conexión a MongoDB exitosa con API Keys');
        console.log('Connection test result:', result);
        console.log('Database stats:', stats);
      } else {
        setConnectionStatus('error');
        toast.error(`Error de conexión: ${result.error}`);
        console.error('Connection test failed:', result.error);
      }
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Error al probar la conexión');
      console.error('Connection test error:', error);
    } finally {
      setTesting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Estado de Conexión MongoDB
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {connectionStatus === 'success' && (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-600 dark:text-green-400">Conectado correctamente</span>
              <Badge variant="outline" className="ml-auto">
                API Activa
              </Badge>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-600 dark:text-red-400">Error de conexión</span>
            </>
          )}
          {connectionStatus === 'idle' && (
            <span className="text-muted-foreground">Estado desconocido</span>
          )}
        </div>

        {dbStats && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Colecciones</p>
                <p className="text-lg font-bold">{dbStats.collections || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Tamaño de Datos</p>
                <p className="text-lg font-bold">{formatBytes(dbStats.dataSize || 0)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Almacenamiento</p>
                <p className="text-lg font-bold">{formatBytes(dbStats.storageSize || 0)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Índices</p>
                <p className="text-lg font-bold">{dbStats.indexes || 0}</p>
              </div>
            </div>
          </div>
        )}
        
        <Button 
          onClick={testConnection} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Probando conexión...' : 'Probar Conexión y Estadísticas'}
        </Button>

        {connectionStatus === 'success' && (
          <div className="text-xs text-muted-foreground p-2 bg-green-500/10 border border-green-500/20 rounded">
            ✅ Base de datos: warehouseos<br/>
            🔑 Autenticación: API Keys activas<br/>
            🌐 Cluster: cluster0.k7hby3a.mongodb.net
          </div>
        )}
      </CardContent>
    </Card>
  );
};
