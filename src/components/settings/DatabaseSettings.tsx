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

  // Sincronizar config inicial desde localStorage
  useEffect(() => {
    setDbConfig(loadDbConfig());
  }, []);

  // Cuando cambian URI/base, desconectar hasta probar/guardar de nuevo
  useEffect(() => {
    setDbConfig(prev => ({ ...prev, connectionStatus: 'disconnected' }));
    setDbStats(null);
    // eslint-disable-next-line
  }, [dbConfig.uri, dbConfig.database]);

  // Función auxiliar que evalúa si la URI es válida
  const isValidUri = (uri: string) => {
    return uri && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'));
  };

  // Probar conexión funcionando solo si la URI parece válida
  const handleTestConnection = async () => {
    setIsConnecting(true);
    setDbConfig(prev => ({ ...prev, connectionStatus: 'connecting' }));
    try {
      if (!isValidUri(dbConfig.uri)) {
        setDbConfig(prev => ({ ...prev, connectionStatus: 'error' }));
        toast({
          title: "Connection Error",
          description: "Please enter a valid MongoDB URI.",
          variant: "destructive",
        });
        setIsConnecting(false);
        return;
      }
      // Test against stored connection state
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
        toast({
          title: "Connection Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setDbConfig(prev => ({ ...prev, connectionStatus: 'error' }));
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to MongoDB.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // "Crear base de datos" ahora si conecta y guarda
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
      // "Crear" es conectar en el mock
      await connectToDatabase(dbConfig.uri, dbConfig.database);
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

  // Guardar config y volver a "probar conexión" con la nueva info
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
      // Guardar y reconectar
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
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {isConnecting && dbConfig.connectionStatus === 'connecting'
                ? 'Testing...'
                : 'Test Connection'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCreateDatabase}
              disabled={isConnecting}
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
              onChange={(e) => setDbConfig({ ...dbConfig, uri: e.target.value, connectionStatus: "disconnected" })}
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
              onCheckedChange={(checked) =>
                setDbConfig({ ...dbConfig, replicationEnabled: checked, connectionStatus: "disconnected" })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
