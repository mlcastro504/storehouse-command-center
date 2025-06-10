
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function DatabaseSettings() {
  const [dbConfig, setDbConfig] = useState({
    uri: 'mongodb://localhost:27017',
    database: 'warehouseos',
    replicationEnabled: false,
    connectionStatus: 'connected'
  });

  const [isConnecting, setIsConnecting] = useState(false);

  const { toast } = useToast();

  const testConnection = async () => {
    setIsConnecting(true);
    
    // Simulate connection test
    setTimeout(() => {
      setIsConnecting(false);
      setDbConfig({ ...dbConfig, connectionStatus: 'connected' });
      toast({
        title: "Conexión exitosa",
        description: "La conexión a MongoDB se ha establecido correctamente.",
      });
    }, 2000);
  };

  const restartConnection = () => {
    setIsConnecting(true);
    setDbConfig({ ...dbConfig, connectionStatus: 'connecting' });
    
    setTimeout(() => {
      setIsConnecting(false);
      setDbConfig({ ...dbConfig, connectionStatus: 'connected' });
      toast({
        title: "Conexión reiniciada",
        description: "La conexión a la base de datos se ha reiniciado correctamente.",
      });
    }, 3000);
  };

  const saveConfiguration = () => {
    toast({
      title: "Configuración guardada",
      description: "La configuración de MongoDB se ha guardado. Se reiniciará la conexión.",
    });
    restartConnection();
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
          Configura la conexión a tu base de datos MongoDB
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
                ? 'Base de datos conectada y funcionando correctamente'
                : 'Verificando estado de la conexión...'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {isConnecting ? 'Probando...' : 'Probar Conexión'}
            </Button>
            <Button 
              variant="outline" 
              onClick={restartConnection}
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
              Reiniciar
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>URI de Conexión</Label>
            <Input
              value={dbConfig.uri}
              onChange={(e) => setDbConfig({ ...dbConfig, uri: e.target.value })}
              placeholder="mongodb://username:password@host:port"
            />
            <p className="text-xs text-muted-foreground">
              Formato: mongodb://[username:password@]host:port[/database][?options]
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

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={testConnection} disabled={isConnecting}>
            Probar Configuración
          </Button>
          <Button onClick={saveConfiguration} disabled={isConnecting}>
            Guardar y Aplicar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
