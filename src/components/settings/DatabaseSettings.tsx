
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, XCircle, RefreshCw, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { testConnection, getDatabaseStats, connectToDatabase } from '@/lib/mongodb';

// Helpers to persist/recover db config in localStorage
const DB_CONFIG_KEY = "warehouseos_dbconfig";
function loadDbConfig() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DB_CONFIG_KEY) ?? '{}');
    return {
      uri: parsed.uri || 'mongodb://mlcastro:Futuro2025,@192.168.2.34:27017/?authSource=admin',
      database: parsed.database || 'warehouseos',
      replicationEnabled: !!parsed.replicationEnabled,
      connectionStatus: 'disconnected'
    };
  } catch {
    return {
      uri: 'mongodb://mlcastro:Futuro2025,@192.168.2.34:27017/?authSource=admin',
      database: 'warehouseos',
      replicationEnabled: false,
      connectionStatus: 'disconnected'
    };
  }
}
function saveDbConfig(config: any) {
  localStorage.setItem(DB_CONFIG_KEY, JSON.stringify({
    uri: config.uri,
    database: config.database,
    replicationEnabled: config.replicationEnabled
  }));
}

export function DatabaseSettings() {
  const [dbConfig, setDbConfig] = useState(loadDbConfig());
  const [isConnecting, setIsConnecting] = useState(false);
  const [dbStats, setDbStats] = useState<any>(null);

  const { toast } = useToast();

  // Sincronizar config inicial desde localStorage
  useEffect(() => {
    setDbConfig(loadDbConfig());
  }, []);

  useEffect(() => {
    handleTestConnection();
    // eslint-disable-next-line
  }, []);

  const handleTestConnection = async () => {
    setIsConnecting(true);
    setDbConfig(prev => ({ ...prev, connectionStatus: 'connecting' }));
    try {
      const result = await testConnection();

      if (result.success) {
        setDbConfig(prev => ({ ...prev, connectionStatus: 'connected' }));
        // Get database stats
        const stats = await getDatabaseStats();
        setDbStats(stats);

        toast({
          title: "Conexión exitosa",
          description: "La conexión a MongoDB se ha establecido correctamente.",
        });
      } else {
        setDbConfig(prev => ({ ...prev, connectionStatus: 'error' }));
        toast({
          title: "Error de conexión",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setDbConfig(prev => ({ ...prev, connectionStatus: 'error' }));
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar a la base de datos MongoDB.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Botón que fuerza crear la base (simulado) y conecta a ella
  const handleCreateDatabase = async () => {
    setIsConnecting(true);
    setDbConfig(prev => ({ ...prev, connectionStatus: 'connecting' }));
    try {
      // Simulación: Crea la base usando connectToDatabase
      await connectToDatabase();
      saveDbConfig(dbConfig);
      setDbConfig(prev => ({ ...prev, connectionStatus: 'connected' }));
      const stats = await getDatabaseStats();
      setDbStats(stats);
      toast({
        title: "Base de datos creada",
        description: "La base de datos se creó y la app ahora está conectada.",
      });
    } catch (error) {
      setDbConfig(prev => ({ ...prev, connectionStatus: 'error' }));
      toast({
        title: "Error al crear base de datos",
        description: "Ocurrió un error al crear la base de datos.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const saveConfiguration = () => {
    saveDbConfig(dbConfig);
    toast({
      title: "Configuración guardada",
      description: "La configuración de MongoDB se ha guardado. Se reiniciará la conexión.",
    });
    handleTestConnection();
  };

  const getStatusBadge = () => {
    switch (dbConfig.connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Conectado</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-100 text-yellow-800"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Conectando</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Base de Datos MongoDB
        </CardTitle>
        <CardDescription>
          Configura el acceso y crea tu base de datos MongoDB.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Estado de Conexión</span>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              {dbConfig.connectionStatus === 'connected' 
                ? 'Base de datos MongoDB conectada y funcionando correctamente'
                : 'Verificando estado de la conexión...'}
            </p>
            {dbStats && dbConfig.connectionStatus === 'connected' && (
              <div className="text-xs text-muted-foreground mt-2">
                <p>Colecciones: {dbStats.collections}</p>
                <p>Tamaño de datos: {(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB</p>
                <p>Índices: {dbStats.indexes}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {isConnecting ? 'Probando...' : 'Probar Conexión'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCreateDatabase}
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {isConnecting ? 'Creando...' : 'Crear Base de Datos'}
            </Button>
            <Button 
              variant="outline" 
              onClick={saveConfiguration}
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
              Guardar y Aplicar
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>URI de Conexión</Label>
            <Input
              value={dbConfig.uri}
              onChange={(e) => setDbConfig({ ...dbConfig, uri: e.target.value })}
              placeholder="mongodb://user:pass@host:port/?authSource=admin"
              className="bg-white"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              Especifica la URI de tu MongoDB para conectar la app.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Nombre de la Base de Datos</Label>
            <Input
              value={dbConfig.database}
              onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
              placeholder="warehouseos"
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Replicación Habilitada</Label>
              <p className="text-xs text-muted-foreground">
                Activa la replicación para alta disponibilidad
              </p>
            </div>
            <Switch
              checked={dbConfig.replicationEnabled}
              onCheckedChange={(checked) => setDbConfig({ ...dbConfig, replicationEnabled: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
