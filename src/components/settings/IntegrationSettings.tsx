
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
import { ExternalLink, Settings, Zap, Database, Plus, ShoppingCart, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EcommerceConnections } from '@/components/ecommerce/EcommerceConnections';

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
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [webhooksEnabled, setWebhooksEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'ecommerce' | 'external'>('ecommerce');

  const [configForm, setConfigForm] = useState({
    apiKey: '',
    webhookUrl: '',
    additionalSettings: ''
  });

  const handleConfigureIntegration = (integration: ExternalIntegration) => {
    setSelectedIntegration(integration);
    
    // Buscar configuración existente
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

  if (loading) {
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
            <EcommerceConnections />
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

      {/* Dialog de Configuración */}
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
    </div>
  );
}
