
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Settings, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  apiKey: string;
  syncFrequency: string;
  dataTypes: string[];
  lastSync: string;
}

export function ApiIntegrationSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'WooCommerce Store',
      type: 'woocommerce',
      status: 'connected',
      apiKey: 'ck_***************',
      syncFrequency: 'hourly',
      dataTypes: ['products', 'orders', 'stock'],
      lastSync: '2024-01-15 14:30'
    },
    {
      id: '2',
      name: 'Shopify Store',
      type: 'shopify',
      status: 'disconnected',
      apiKey: '',
      syncFrequency: 'daily',
      dataTypes: ['products', 'orders'],
      lastSync: 'Never'
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const { toast } = useToast();

  const integrationTypes = {
    woocommerce: { name: 'WooCommerce', icon: 'W' },
    shopify: { name: 'Shopify', icon: 'S' },
    amazon: { name: 'Amazon', icon: 'A' },
    odoo: { name: 'Odoo ERP', icon: 'O' },
    netsuite: { name: 'NetSuite', icon: 'N' },
    dhl: { name: 'DHL', icon: 'D' },
    ups: { name: 'UPS', icon: 'U' }
  };

  const testConnection = (integrationId: string) => {
    setIntegrations(integrations.map(int => 
      int.id === integrationId 
        ? { ...int, status: 'connected' as const }
        : int
    ));
    
    toast({
      title: "Conexión exitosa",
      description: "La integración se ha conectado correctamente.",
    });
  };

  const syncNow = (integrationId: string) => {
    toast({
      title: "Sincronización iniciada",
      description: "La sincronización manual se ha iniciado.",
    });
  };

  const saveIntegration = () => {
    toast({
      title: "Integración guardada",
      description: "La configuración de la integración se ha guardado.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Conectado</Badge>;
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
          <RefreshCw className="w-5 h-5" />
          Sincronización por API
        </CardTitle>
        <CardDescription>
          Conecta WarehouseOS con plataformas externas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva Integración
          </Button>
        </div>

        <div className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {integrationTypes[integration.type as keyof typeof integrationTypes]?.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {integrationTypes[integration.type as keyof typeof integrationTypes]?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(integration.status)}
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Frecuencia</Label>
                  <p className="font-medium capitalize">{integration.syncFrequency}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Datos Sincronizados</Label>
                  <div className="flex gap-1 flex-wrap">
                    {integration.dataTypes.map(type => (
                      <Badge key={type} variant="outline" className="text-xs capitalize">{type}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Última Sincronización</Label>
                  <p className="font-medium">{integration.lastSync}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => testConnection(integration.id)}
                    disabled={integration.status === 'connected'}
                  >
                    Probar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => syncNow(integration.id)}
                    disabled={integration.status !== 'connected'}
                  >
                    Sincronizar
                  </Button>
                </div>
              </div>

              {integration.status === 'connected' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700">
                    ✓ Integración activa y sincronizando correctamente
                  </p>
                </div>
              )}

              {integration.status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-700">
                    ⚠ Error en la conexión. Verifica las credenciales de API.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium">Logs de Sincronización</Label>
          <div className="max-h-40 overflow-y-auto border rounded p-3 bg-gray-50">
            <div className="space-y-1 text-xs font-mono">
              <p>[2024-01-15 14:30:15] WooCommerce: Sincronización completada - 125 productos actualizados</p>
              <p>[2024-01-15 13:30:12] WooCommerce: Iniciando sincronización de productos</p>
              <p>[2024-01-15 12:30:08] WooCommerce: Sincronización completada - 23 órdenes importadas</p>
              <p>[2024-01-15 11:30:05] Shopify: Error de conexión - API key inválida</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
