
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
      connectionStatus: parsed.connectionStatus || 'disconnected'
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
    replicationEnabled: config.replicationEnabled,
    connectionStatus: config.connectionStatus
  }));
}

export function DatabaseSettings() {
  const [dbConfig, setDbConfig] = useState(loadDbConfig());
  const [isConnecting, setIsConnecting] = useState(false);
  const [dbStats, setDbStats] = useState<any>(null);

  const { toast } = useToast();

  // Sincroniza config inicial desde localStorage
  useEffect(() => {
    setDbConfig(loadDbConfig());
  }, []);

  // Auto-validar y conectar al editar la URI
  useEffect(() => {
    const tryAutoConnect = async () => {
      if (!dbConfig.uri) {
        setDbConfig(prev => ({ ...prev, connectionStatus: 'disconnected' }));
        setDbStats(null);
        return;
      }
      if (isValidUri(dbConfig.uri)) {
        setIsConnecting(true);
        setDbConfig(prev => ({ ...prev, connectionStatus: 'connecting' }));
        try {
          await connectToDatabase(dbConfig.uri, dbConfig.database);
          const result = await testConnection(dbConfig.uri, dbConfig.database);
          if (result.success) {
            setDbConfig(prev => ({ ...prev, connectionStatus: 'connected' }));
            saveDbConfig({ ...dbConfig, connectionStatus: 'connected' });
            const stats = await getDatabaseStats();
            setDbStats(stats);
            toast({
              title: "Connected",
              description: "MongoDB connection established.",
            });
          } else {
            setDbConfig(prev => ({ ...prev, connectionStatus: 'error' }));
            setDbStats(null);
            toast({
              title: "Connection Error",
              description: result.message,
              variant: "destructive",
            });
          }
        } catch (err: any) {
          setDbConfig(prev => ({ ...prev, connectionStatus: 'error' }));
          setDbStats(null);
          toast({
            title: "Connection Error",
            description: err?.message ?? "Failed to connect.",
            variant: "destructive",
          });
        } finally {
          setIsConnecting(false);
        }
      } else {
        setDbConfig(prev => ({ ...prev, connectionStatus: 'error' }));
        setDbStats(null);
      }
    };

    tryAutoConnect();
    // eslint-disable-next-line
  }, [dbConfig.uri]);

  // Cuando cambian nombre db, desconectar (pero no revalida aún, solo por seguridad)
  useEffect(() => {
    setDbConfig(prev => ({ ...prev, connectionStatus: 'disconnected' }));
    setDbStats(null);
    // eslint-disable-next-line
  }, [dbConfig.database]);

  // Auxiliar para validar
  const isValidUri = (uri: string) => {
    return uri && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'));
  };

  // Botón para crear/montar la BD y conectar definitivamente
  const handleCreateDatabase = async () => {
    setIsConnecting(true);
    setDbConfig(prev => ({ ...prev, connectionStatus: 'connecting' }));
    try {
      if (!isValidUri(dbConfig.uri) || !dbConfig.database) {
        setDbConfig(prev => ({ ...prev, connectionStatus: 'error' }));
        toast({
          title: "Error",
          description: "The URI and Database name must be valid.",
          variant: "destructive",
        });
        setIsConnecting(false);
        return;
      }
      await connectToDatabase(dbConfig.uri, dbConfig.database); // Crea y conecta
      saveDbConfig({ ...dbConfig, connectionStatus: 'connected' });
      setDbConfig(prev => ({ ...prev, connectionStatus: 'connected' }));
      const stats = await getDatabaseStats();
      setDbStats(stats);
      toast({
        title: "Database Created",
        description: "Database created and app connected.",
      });
    } catch (error: any) {
      setDbConfig(prev => ({ ...prev, connectionStatus: 'error' }));
      toast({
        title: "Error Creating Database",
        description: error.message || "There was a problem creating the database.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Guardar config y conectar
  const saveConfiguration = async () => {
    saveDbConfig({ ...dbConfig, connectionStatus: 'connecting' });
    setDbConfig(prev => ({ ...prev, connectionStatus: 'connecting' }));
    setIsConnecting(true);
    try {
      if (!isValidUri(dbConfig.uri)) {
        setDbConfig(prev => ({ ...prev, connectionStatus: 'error' }));
        toast({
          title: "Error",
          description: "MongoDB URI is not valid.",
          variant: "destructive",
        });
        setIsConnecting(false);
        return;
      }
      await connectToDatabase(dbConfig.uri, dbConfig.database);
      saveDbConfig({ ...dbConfig, connectionStatus: 'connected' });
      setDbConfig(prev => ({ ...prev, connectionStatus: 'connected' }));
      const stats = await getDatabaseStats();
      setDbStats(stats);
      toast({
        title: "Configuration Saved",
        description: "Changes saved and MongoDB connection refreshed.",
      });
    } catch (error: any) {
      setDbConfig(prev => ({ ...prev, connectionStatus: 'error' }));
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect after saving.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Solo se puede cambiar el estado de replicación si se desconecta o cambia la URI/db
  const handleReplicationChange = (checked: boolean) => {
    setDbConfig(prev => ({
      ...prev,
      replicationEnabled: checked,
      connectionStatus: "disconnected"
    }));
    setDbStats(null);
  };

  const getStatusBadge = () => {
    switch (dbConfig.connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Connecting</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          MongoDB Database
        </CardTitle>
        <CardDescription>
          Configure access and create your MongoDB database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Connection status</span>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              {dbConfig.connectionStatus === 'connected'
                ? 'MongoDB database connected and working correctly'
                : dbConfig.connectionStatus === 'connecting'
                  ? 'Checking connection status...'
                  : dbConfig.connectionStatus === 'error'
                    ? 'Connection error. Please check your URI and database name.'
                    : 'Disconnected. Save your configuration or test the connection.'}
            </p>
            {dbStats && dbConfig.connectionStatus === 'connected' && (
              <div className="text-xs text-muted-foreground mt-2">
                <p>Collections: {dbStats.collections}</p>
                <p>Data size: {(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB</p>
                <p>Indexes: {dbStats.indexes}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {/* El botón Test Connection ya no es necesario porque ahora valida en tiempo real,
                pero si quieres dejarlo para pruebas manuales puedes mantenerlo, aquí lo dejé oculto */}
            <Button
              variant="outline"
              onClick={handleCreateDatabase}
              disabled={isConnecting || dbConfig.connectionStatus === "connected"}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {isConnecting && dbConfig.connectionStatus === 'connecting'
                ? 'Creating...'
                : 'Create Database'}
            </Button>
            <Button
              variant="outline"
              onClick={saveConfiguration}
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
              Save & Apply
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Connection URI</Label>
            <Input
              value={dbConfig.uri}
              onChange={(e) => setDbConfig({ ...dbConfig, uri: e.target.value })}
              placeholder="mongodb://user:pass@host:port/?authSource=admin"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              Enter your MongoDB URI to connect the app.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Database name</Label>
            <Input
              value={dbConfig.database}
              onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value, connectionStatus: "disconnected" })}
              placeholder="warehouseos"
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Replication Enabled</Label>
              <p className="text-xs text-muted-foreground">
                Enable replication for high availability
              </p>
            </div>
            <Switch
              checked={dbConfig.replicationEnabled}
              onCheckedChange={handleReplicationChange}
              disabled={isConnecting}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
