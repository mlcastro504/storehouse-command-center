
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
import { ExternalLink, Settings, Zap, Database, Plus, ShoppingCart, Globe, Store, Truck, CreditCard, MessageSquare, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateConnectionDialog } from '@/components/ecommerce/CreateConnectionDialog';

interface ExternalIntegration {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: React.ReactNode;
  category: 'shipping' | 'erp' | 'sms' | 'payment' | 'analytics' | 'marketing';
  isPopular?: boolean;
}

interface EcommercePlatform {
  id: string;
  name: string;
  display_name: string;
  api_url: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
}

const externalIntegrations: ExternalIntegration[] = [
  // Paquetería y Logística
  {
    id: 'fedex-api',
    name: 'fedex',
    displayName: 'FedEx',
    description: 'Servicios de envío y seguimiento de paquetes FedEx',
    icon: <Truck className="w-5 h-5 text-purple-600" />,
    category: 'shipping',
    isPopular: true
  },
  {
    id: 'ups-api',
    name: 'ups',
    displayName: 'UPS',
    description: 'Servicios de envío y logística UPS',
    icon: <Truck className="w-5 h-5 text-yellow-600" />,
    category: 'shipping',
    isPopular: true
  },
  {
    id: 'dhl-api',
    name: 'dhl',
    displayName: 'DHL',
    description: 'Servicios de envío internacional DHL',
    icon: <Truck className="w-5 h-5 text-red-600" />,
    category: 'shipping',
    isPopular: true
  },
  
  // Sistemas ERP
  {
    id: 'sap-erp',
    name: 'sap',
    displayName: 'SAP ERP',
    description: 'Integración con sistema SAP ERP empresarial',
    icon: <Database className="w-5 h-5 text-blue-600" />,
    category: 'erp',
    isPopular: true
  },
  {
    id: 'oracle-erp',
    name: 'oracle',
    displayName: 'Oracle ERP',
    description: 'Sincronización con Oracle ERP Cloud',
    icon: <Database className="w-5 h-5 text-red-600" />,
    category: 'erp',
    isPopular: true
  },
  {
    id: 'microsoft-dynamics',
    name: 'dynamics',
    displayName: 'Microsoft Dynamics',
    description: 'Integración con Microsoft Dynamics 365',
    icon: <Database className="w-5 h-5 text-blue-500" />,
    category: 'erp',
    isPopular: true
  },
  
  // Pagos
  {
    id: 'stripe-payments',
    name: 'stripe',
    displayName: 'Stripe',
    description: 'Procesamiento de pagos online con Stripe',
    icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
    category: 'payment',
    isPopular: true
  },
  {
    id: 'paypal-api',
    name: 'paypal',
    displayName: 'PayPal',
    description: 'Integración con servicios de pago PayPal',
    icon: <CreditCard className="w-5 h-5 text-blue-600" />,
    category: 'payment',
    isPopular: true
  },
  {
    id: 'mercadopago-api',
    name: 'mercadopago',
    displayName: 'Mercado Pago',
    description: 'Procesamiento de pagos en América Latina',
    icon: <CreditCard className="w-5 h-5 text-cyan-600" />,
    category: 'payment',
    isPopular: true
  },
  
  // SMS y Comunicación
  {
    id: 'twilio-sms',
    name: 'twilio',
    displayName: 'Twilio',
    description: 'Servicios de SMS, WhatsApp y comunicación',
    icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
    category: 'sms',
    isPopular: true
  },
  {
    id: 'whatsapp-business',
    name: 'whatsapp',
    displayName: 'WhatsApp Business',
    description: 'API de WhatsApp Business para mensajería',
    icon: <MessageSquare className="w-5 h-5 text-green-600" />,
    category: 'sms',
    isPopular: true
  },
  
  // Analytics y Marketing
  {
    id: 'google-analytics',
    name: 'google-analytics',
    displayName: 'Google Analytics',
    description: 'Análisis web y métricas de Google',
    icon: <BarChart3 className="w-5 h-5 text-orange-600" />,
    category: 'analytics',
    isPopular: true
  },
  {
    id: 'facebook-pixel',
    name: 'facebook-pixel',
    displayName: 'Facebook Pixel',
    description: 'Seguimiento y conversiones de Facebook',
    icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
    category: 'marketing',
    isPopular: true
  },
  {
    id: 'mailchimp-api',
    name: 'mailchimp',
    displayName: 'Mailchimp',
    description: 'Email marketing y automatización',
    icon: <Globe className="w-5 h-5 text-yellow-600" />,
    category: 'marketing',
    isPopular: true
  }
];

const popularEcommercePlatforms = [
  { name: 'shopify', displayName: 'Shopify', description: 'Líder mundial en e-commerce', users: '2M+' },
  { name: 'woocommerce', displayName: 'WooCommerce', description: 'Plugin más popular de WordPress', users: '5M+' },
  { name: 'magento', displayName: 'Magento', description: 'Plataforma enterprise potente', users: '250K+' },
  { name: 'prestashop', displayName: 'PrestaShop', description: 'Solución europea líder', users: '300K+' },
  { name: 'bigcommerce', displayName: 'BigCommerce', description: 'SaaS para empresas', users: '60K+' },
  { name: 'opencart', displayName: 'OpenCart', description: 'Código abierto y flexible', users: '750K+' },
  { name: 'squarespace', displayName: 'Squarespace', description: 'Diseño elegante y simple', users: '4M+' }
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
        return popularEcommercePlatforms.map((p, index) => ({
          id: (index + 1).toString(),
          name: p.name,
          display_name: p.displayName,
          api_url: `https://api.${p.name}.com/v1/`,
          is_active: true
        }));
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

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      shipping: <Truck className="w-4 h-4" />,
      erp: <Database className="w-4 h-4" />,
      payment: <CreditCard className="w-4 h-4" />,
      sms: <MessageSquare className="w-4 h-4" />,
      analytics: <BarChart3 className="w-4 h-4" />,
      marketing: <Globe className="w-4 h-4" />
    };
    return iconMap[category] || <ExternalLink className="w-4 h-4" />;
  };

  const getCategoryName = (category: string) => {
    const nameMap: { [key: string]: string } = {
      shipping: 'Envíos',
      erp: 'ERP',
      payment: 'Pagos',
      sms: 'Comunicación',
      analytics: 'Analytics',
      marketing: 'Marketing'
    };
    return nameMap[category] || category;
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

  const popularIntegrations = externalIntegrations.filter(int => int.isPopular);
  const categorizedIntegrations = externalIntegrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, ExternalIntegration[]>);

  return (
    <div className="space-y-6">
      {/* Header con tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Integraciones y Conexiones
          </CardTitle>
          <CardDescription>
            Conecta tu sistema con las plataformas de e-commerce más populares y servicios externos
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
              Plataformas E-commerce
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
              Servicios Externos
            </button>
          </div>

          {activeTab === 'ecommerce' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Plataformas E-commerce Populares</h3>
                  <p className="text-sm text-muted-foreground">
                    Conecta con las principales plataformas del mercado
                  </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Conexión
                </Button>
              </div>

              {/* Plataformas populares destacadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularEcommercePlatforms.map((platform, index) => {
                  const isConnected = connections.some(c => c.platform?.name === platform.name);
                  
                  return (
                    <Card key={platform.name} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {getPlatformIcon(platform.name)}
                            </div>
                            <div>
                              <h4 className="font-medium">{platform.displayName}</h4>
                              <p className="text-xs text-muted-foreground">
                                {platform.users} usuarios
                              </p>
                            </div>
                          </div>
                          <Badge variant={isConnected ? "default" : "secondary"}>
                            {isConnected ? 'Conectado' : 'Disponible'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {platform.description}
                        </p>
                        <Button 
                          variant={isConnected ? "outline" : "default"} 
                          size="sm" 
                          className="w-full"
                          onClick={() => setIsCreateDialogOpen(true)}
                        >
                          {isConnected ? 'Gestionar' : 'Conectar'}
                        </Button>
                      </CardContent>
                      {platform.name === 'shopify' || platform.name === 'woocommerce' ? (
                        <Badge className="absolute top-2 right-2" variant="default">
                          Popular
                        </Badge>
                      ) : null}
                    </Card>
                  );
                })}
              </div>

              {/* Conexiones existentes */}
              {connections.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-medium mb-4">Conexiones Activas ({connections.length})</h4>
                  <div className="space-y-2">
                    {connections.map((connection: any) => (
                      <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
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
                            {connection.sync_enabled ? 'Sincronizando' : 'Pausado'}
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
            <div className="space-y-6">
              {/* Integraciones populares */}
              <div>
                <h3 className="text-lg font-medium mb-4">Servicios Más Populares</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {popularIntegrations.map((integration) => (
                    <Card key={integration.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {integration.icon}
                            </div>
                            <div>
                              <h4 className="font-medium">{integration.displayName}</h4>
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(integration.category)}
                                <span className="text-xs text-muted-foreground">
                                  {getCategoryName(integration.category)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="default" className="text-xs">
                            Popular
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {integration.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {isIntegrationConfigured(integration.name) && (
                              <Badge variant="outline" className="text-xs">Configurado</Badge>
                            )}
                            <Badge variant={isIntegrationEnabled(integration.name) ? "default" : "secondary"} className="text-xs">
                              {isIntegrationEnabled(integration.name) ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Integraciones por categoría */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Todas las Integraciones</h3>
                {Object.entries(categorizedIntegrations).map(([category, integrations]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3">
                      {getCategoryIcon(category)}
                      <h4 className="font-medium">{getCategoryName(category)}</h4>
                      <Badge variant="outline" className="text-xs">
                        {integrations.length} servicios
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {integrations.map((integration) => (
                        <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {integration.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{integration.displayName}</h4>
                                {integration.isPopular && (
                                  <Badge variant="default" className="text-xs">Popular</Badge>
                                )}
                              </div>
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
                  </div>
                ))}
              </div>
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
