
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIntegrationSettings } from '@/hooks/useIntegrationSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Settings, Zap, Database, Plus, ShoppingCart, Globe, Store } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateConnectionDialog } from '@/components/ecommerce/CreateConnectionDialog';

interface EcommercePlatform {
  id: string;
  name: string;
  display_name: string;
  api_url: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
}

interface ExternalIntegration {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: React.ReactNode;
  category: 'shipping' | 'erp' | 'sms' | 'payment' | 'analytics';
  isConnected: boolean;
}

const externalIntegrations: ExternalIntegration[] = [
  {
    id: 'fedex-api',
    name: 'fedex',
    displayName: 'FedEx API',
    description: 'Conecta con servicios de paquetería FedEx',
    icon: <ExternalLink className="w-5 h-5 text-blue-600" />,
    category: 'shipping',
    isConnected: false
  },
  {
    id: 'ups-api',
    name: 'ups',
    displayName: 'UPS API',
    description: 'Conecta con servicios de paquetería UPS',
    icon: <ExternalLink className="w-5 h-5 text-yellow-600" />,
    category: 'shipping',
    isConnected: false
  },
  {
    id: 'sap-erp',
    name: 'sap',
    displayName: 'SAP ERP',
    description: 'Sincronización con sistema SAP ERP',
    icon: <Database className="w-5 h-5 text-green-600" />,
    category: 'erp',
    isConnected: true
  },
  {
    id: 'oracle-erp',
    name: 'oracle',
    displayName: 'Oracle ERP',
    description: 'Sincronización con Oracle ERP Cloud',
    icon: <Database className="w-5 h-5 text-red-600" />,
    category: 'erp',
    isConnected: false
  },
  {
    id: 'twilio-sms',
    name: 'twilio',
    displayName: 'Twilio SMS',
    description: 'Servicio de mensajería SMS',
    icon: <Zap className="w-5 h-5 text-purple-600" />,
    category: 'sms',
    isConnected: false
  },
  {
    id: 'stripe-payments',
    name: 'stripe',
    displayName: 'Stripe Payments',
    description: 'Procesamiento de pagos con Stripe',
    icon: <Zap className="w-5 h-5 text-indigo-600" />,
    category: 'payment',
    isConnected: false
  },
  {
    id: 'google-analytics',
    name: 'google-analytics',
    displayName: 'Google Analytics',
    description: 'Análisis y métricas de Google',
    icon: <Globe className="w-5 h-5 text-orange-600" />,
    category: 'analytics',
    isConnected: false
  }
];

export function IntegrationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings: integrationSettings, updateSetting, createSetting, loading } = useIntegrationSettings();
  const [selectedIntegration, setSelectedIntegration] = useState<ExternalIntegration | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<EcommercePlatform | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [ecommerceDialogOpen, setEcommerceDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [webhooksEnabled, setWebhooksEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'ecommerce' | 'external'>('ecommerce');

  const [configForm, setConfigForm] = useState({
    apiKey: '',
    webhookUrl: '',
    additionalSettings: ''
  });

  // Consultar plataformas de e-commerce
  const { data: ecommercePlatforms = [], isLoading: platformsLoading } = useQuery({
    queryKey: ['ecommerce-platforms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ecommerce_platforms')
        .select('*')
        .eq('is_active', true)
        .order('display_name');
      
      if (error) {
        console.error('Error fetching platforms:', error);
        // Retornar plataformas mock si hay error
        return [
          { id: '1', name: 'shopify', display_name: 'Shopify', api_url: 'https://{{shop}}.myshopify.com/admin/api/2023-10/graphql.json', is_active: true },
          { id: '2', name: 'woocommerce', display_name: 'WooCommerce', api_url: 'https://{{domain}}/wp-json/wc/v3/', is_active: true },
          { id: '3', name: 'prestashop', display_name: 'PrestaShop', api_url: 'https://{{domain}}/api/', is_active: true },
          { id: '4', name: 'magento', display_name: 'Magento 2', api_url: 'https://{{domain}}/rest/V1/', is_active: true },
          { id: '5', name: 'opencart', display_name: 'OpenCart', api_url: 'https://{{domain}}/index.php?route=api/', is_active: true },
          { id: '6', name: 'bigcommerce', display_name: 'BigCommerce', api_url: 'https://api.bigcommerce.com/stores/{{store_hash}}/v3/', is_active: true },
          { id: '7', name: 'squarespace', display_name: 'Squarespace', api_url: 'https://api.squarespace.com/1.0/', is_active: true }
        ];
      }
      return data || [];
    },
  });

  // Consultar conexiones existentes
  const { data: connections = [] } = useQuery({
    queryKey: ['ecommerce-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ecommerce_connections')
        .select(`
          *,
          platform:ecommerce_platforms(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching connections:', error);
        return [];
      }
      return data || [];
    },
  });

  const handleConfigureIntegration = (integration: ExternalIntegration) => {
    setSelectedIntegration(integration);
    
    const existingSetting = integrationSettings.find(
      s => s.integration_type === 'external' && s.integration_name === integration.name
    );
    
    if (existingSetting) {
      setConfigForm({
        apiKey: existingSetting.api_key_encrypted || '',
        webhookUrl: existingSetting.webhook_url || '',
        additionalSettings: JSON.stringify(existingSetting.settings || {}, null, 2)
      });
    } else {
      setConfigForm({
        apiKey: '',
        webhookUrl: '',
        additionalSettings: '{}'
      });
    }
    
    setConfigDialogOpen(true);
  };

  const handleConfigurePlatform = (platform: any) => {
    const platformData: EcommercePlatform = {
      id: platform.id,
      name: platform.name,
      display_name: platform.display_name,
      api_url: platform.api_url,
      description: `Integración con ${platform.display_name}`,
      icon: <Store className="w-5 h-5 text-green-600" />,
      isConnected: connections.some(c => c.platform_id === platform.id)
    };
    
    setSelectedPlatform(platformData);
    setEcommerceDialogOpen(true);
  };

  const handleSaveConfiguration = async () => {
    if (!selectedIntegration || !user?.id) return;

    try {
      const settings = JSON.parse(configForm.additionalSettings || '{}');
      
      const existingSetting = integrationSettings.find(
        s => s.integration_type === 'external' && s.integration_name === selectedIntegration.name
      );

      const settingData = {
        integration_type: 'external',
        integration_name: selectedIntegration.name,
        is_enabled: true,
        api_key_encrypted: configForm.apiKey,
        webhook_url: configForm.webhookUrl,
        settings
      };

      if (existingSetting) {
        await updateSetting(existingSetting.id, settingData);
      } else {
        await createSetting(settingData);
      }

      setConfigDialogOpen(false);
      setSelectedIntegration(null);
    } catch (error) {
      console.error('Error parsing settings:', error);
      toast({
        title: "Error",
        description: "La configuración adicional debe ser un JSON válido.",
        variant: "destructive"
      });
    }
  };

  const handleToggleIntegration = async (integration: ExternalIntegration) => {
    if (!user?.id) return;

    const existingSetting = integrationSettings.find(
      s => s.integration_type === 'external' && s.integration_name === integration.name
    );

    if (existingSetting) {
      await updateSetting(existingSetting.id, {
        is_enabled: !existingSetting.is_enabled
      });
    } else {
      await createSetting({
        integration_type: 'external',
        integration_name: integration.name,
        is_enabled: true,
        settings: {}
      });
    }
  };

  const isIntegrationEnabled = (integrationName: string) => {
    const setting = integrationSettings.find(
      s => s.integration_type === 'external' && s.integration_name === integrationName
    );
    return setting?.is_enabled || false;
  };

  const isIntegrationConfigured = (integrationName: string) => {
    const setting = integrationSettings.find(
      s => s.integration_type === 'external' && s.integration_name === integrationName
    );
    return !!(setting?.api_key_encrypted || setting?.webhook_url);
  };

  const getPlatformIcon = (platformName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      shopify: <Store className="w-5 h-5 text-green-600" />,
      woocommerce: <Store className="w-5 h-5 text-purple-600" />,
      prestashop: <Store className="w-5 h-5 text-blue-600" />,
      magento: <Store className="w-5 h-5 text-orange-600" />,
      opencart: <Store className="w-5 h-5 text-red-600" />,
      bigcommerce: <Store className="w-5 h-5 text-indigo-600" />,
      squarespace: <Store className="w-5 h-5 text-gray-600" />
    };
    return iconMap[platformName] || <Store className="w-5 h-5 text-gray-600" />;
  };

  if (loading || platformsLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs para E-commerce y Integraciones Externas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Integraciones
          </CardTitle>
          <CardDescription>
            Conecta tu sistema con servicios externos y plataformas de e-commerce
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('ecommerce')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'ecommerce' 
                  ? 'bg-background shadow-sm' 
                  : 'hover:bg-background/60'
              }`}
            >
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              E-commerce
            </button>
            <button
              onClick={() => setActiveTab('external')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'external' 
                  ? 'bg-background shadow-sm' 
                  : 'hover:bg-background/60'
              }`}
            >
              <ExternalLink className="w-4 h-4 inline mr-2" />
              APIs Externas
            </button>
          </div>

          {activeTab === 'ecommerce' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Plataformas de E-commerce</h3>
                  <p className="text-sm text-muted-foreground">
                    Conecta tu sistema con las plataformas de e-commerce más populares
                  </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Conexión
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ecommercePlatforms.map((platform: any) => {
                  const isConnected = connections.some(c => c.platform_id === platform.id);
                  return (
                    <div key={platform.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getPlatformIcon(platform.name)}
                          </div>
                          <div>
                            <h4 className="font-medium">{platform.display_name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {platform.name === 'shopify' && 'Tienda online líder'}
                              {platform.name === 'woocommerce' && 'Plugin de WordPress'}
                              {platform.name === 'prestashop' && 'Solución europea'}
                              {platform.name === 'magento' && 'Potente y flexible'}
                              {platform.name === 'opencart' && 'Código abierto'}
                              {platform.name === 'bigcommerce' && 'SaaS enterprise'}
                              {platform.name === 'squarespace' && 'Diseño elegante'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={isConnected ? "default" : "secondary"}>
                          {isConnected ? 'Conectado' : 'Disponible'}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleConfigurePlatform(platform)}
                        >
                          {isConnected ? 'Gestionar' : 'Conectar'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {connections.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-medium mb-4">Conexiones Activas</h4>
                  <div className="space-y-2">
                    {connections.map((connection: any) => (
                      <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getPlatformIcon(connection.platform?.name || 'default')}
                          </div>
                          <div>
                            <p className="font-medium">{connection.store_name}</p>
                            <p className="text-sm text-muted-foreground">{connection.platform?.display_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={connection.sync_enabled ? "default" : "secondary"}>
                            {connection.sync_enabled ? 'Activo' : 'Pausado'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'external' && (
            <div className="space-y-4">
              {externalIntegrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{integration.displayName}</h3>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isIntegrationConfigured(integration.name) && (
                      <Badge variant="outline">Configurado</Badge>
                    )}
                    <Badge variant={isIntegrationEnabled(integration.name) ? "default" : "secondary"}>
                      {isIntegrationEnabled(integration.name) ? 'Conectado' : 'Desconectado'}
                    </Badge>
                    <Switch
                      checked={isIntegrationEnabled(integration.name)}
                      onCheckedChange={() => handleToggleIntegration(integration)}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleConfigureIntegration(integration)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuración de Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Webhooks</CardTitle>
          <CardDescription>
            Configura URLs de webhook para recibir notificaciones automáticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Webhooks activos</Label>
              <p className="text-sm text-muted-foreground">
                Activar recepción de webhooks de servicios externos
              </p>
            </div>
            <Switch 
              checked={webhooksEnabled}
              onCheckedChange={setWebhooksEnabled}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>URL de Webhook Principal</Label>
            <div className="flex space-x-2">
              <div className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                https://tu-dominio.com/api/webhooks
              </div>
              <Button variant="outline" size="sm">Copiar</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Webhook de E-commerce</Label>
            <div className="flex space-x-2">
              <div className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                https://tu-dominio.com/api/ecommerce/webhook
              </div>
              <Button variant="outline" size="sm">Copiar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Configuración Externa */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Configurar {selectedIntegration?.displayName}
            </DialogTitle>
            <DialogDescription>
              Configura los parámetros de conexión para esta integración
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key / Token de Acceso</Label>
              <Input
                id="apiKey"
                type="password"
                value={configForm.apiKey}
                onChange={(e) => setConfigForm(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Ingresa tu API key"
              />
            </div>

            <div>
              <Label htmlFor="webhookUrl">Webhook URL (opcional)</Label>
              <Input
                id="webhookUrl"
                type="url"
                value={configForm.webhookUrl}
                onChange={(e) => setConfigForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                placeholder="https://ejemplo.com/webhook"
              />
            </div>

            <div>
              <Label htmlFor="additionalSettings">Configuración Adicional (JSON)</Label>
              <textarea
                id="additionalSettings"
                className="w-full h-32 p-2 border rounded text-sm font-mono"
                value={configForm.additionalSettings}
                onChange={(e) => setConfigForm(prev => ({ ...prev, additionalSettings: e.target.value }))}
                placeholder='{"setting1": "value1", "setting2": "value2"}'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveConfiguration}>
              Guardar Configuración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para E-commerce */}
      <Dialog open={ecommerceDialogOpen} onOpenChange={setEcommerceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Gestionar {selectedPlatform?.display_name}
            </DialogTitle>
            <DialogDescription>
              {connections.some(c => c.platform_id === selectedPlatform?.id) 
                ? 'Gestiona tus conexiones existentes' 
                : 'Crea una nueva conexión con esta plataforma'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para gestionar las conexiones de {selectedPlatform?.display_name}, 
              utiliza el botón "Nueva Conexión" en la sección principal.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEcommerceDialogOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              setEcommerceDialogOpen(false);
              setIsCreateDialogOpen(true);
            }}>
              Nueva Conexión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de creación de conexión */}
      <CreateConnectionDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
