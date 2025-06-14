
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('settings');
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
    },
    {
      id: '3',
      name: 'Stripe',
      type: 'stripe',
      status: 'connected',
      apiKey: 'sk_test_***',
      syncFrequency: 'On event',
      dataTypes: ['Payments'],
      lastSync: 'Live'
    },
    {
      id: '4',
      name: 'Mailchimp',
      type: 'mailchimp',
      status: 'disconnected',
      apiKey: '',
      syncFrequency: 'manual',
      dataTypes: ['Contacts'],
      lastSync: 'Never'
    },
    {
      id: '5',
      name: 'Zapier',
      type: 'zapier',
      status: 'disconnected',
      apiKey: '',
      syncFrequency: 'manual',
      dataTypes: ['Workflows'],
      lastSync: 'Never'
    },
    {
      id: '6',
      name: 'Slack',
      type: 'slack',
      status: 'connected',
      apiKey: 'https://hooks.slack.com/***',
      syncFrequency: 'On event',
      dataTypes: ['Notifications'],
      lastSync: 'Live'
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
    ups: { name: 'UPS', icon: 'U' },
    stripe: { name: 'Stripe', icon: 'S' },
    mailchimp: { name: 'Mailchimp', icon: 'M' },
    zapier: { name: 'Zapier', icon: 'Z' },
    slack: { name: 'Slack', icon: 'S' }
  };

  const handleToggleIntegration = (integrationId: string, enabled: boolean) => {
    const integration = integrations.find(int => int.id === integrationId);
    if (!integration) return;

    setIntegrations(integrations.map(int => 
      int.id === integrationId 
        ? { ...int, status: enabled ? 'connected' : 'disconnected' as const }
        : int
    ));
    
    toast({
      title: t(enabled ? 'api.toast.enabled.title' : 'api.toast.disabled.title'),
      description: t(enabled ? 'api.toast.enabled.description' : 'api.toast.disabled.description', { name: integration.name }),
    });
  };

  const testConnection = (integrationId: string) => {
    setIntegrations(integrations.map(int => 
      int.id === integrationId 
        ? { ...int, status: 'connected' as const }
        : int
    ));
    
    toast({
      title: t('api.toast.testSuccess.title'),
      description: t('api.toast.testSuccess.description'),
    });
  };

  const syncNow = (integrationId: string) => {
    toast({
      title: t('api.toast.syncStarted.title'),
      description: t('api.toast.syncStarted.description'),
    });
  };

  const saveIntegration = () => {
    toast({
      title: t('api.toast.saved.title'),
      description: t('api.toast.saved.description'),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />{t('api.status.connected')}</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{t('api.status.error')}</Badge>;
      default:
        return <Badge variant="secondary">{t('api.status.disconnected')}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          {t('api.title')}
        </CardTitle>
        <CardDescription>
          {t('api.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('api.newIntegration')}
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
                   <Switch
                    checked={integration.status === 'connected'}
                    onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">{t('api.frequency')}</Label>
                  <p className="font-medium capitalize">{integration.syncFrequency}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('api.syncData')}</Label>
                  <div className="flex gap-1 flex-wrap">
                    {integration.dataTypes.map(type => (
                      <Badge key={type} variant="outline" className="text-xs capitalize">{type}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('api.lastSync')}</Label>
                  <p className="font-medium">{integration.lastSync}</p>
                </div>
                <div className="flex items-end gap-2">
                  {['woocommerce', 'shopify', 'amazon', 'odoo', 'netsuite'].includes(integration.type) ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => testConnection(integration.id)}
                        disabled={integration.status === 'connected'}
                      >
                        {t('api.test')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => syncNow(integration.id)}
                        disabled={integration.status !== 'connected'}
                      >
                        {t('api.syncNow')}
                      </Button>
                    </>
                  ) : (
                     <Button variant="outline" size="sm" onClick={saveIntegration}>
                      {t('api.configure')}
                    </Button>
                  )}
                </div>
              </div>

              {integration.status === 'connected' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded dark:bg-green-900/20 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {t('api.activeMessage')}
                  </p>
                </div>
              )}

              {integration.status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {t('api.errorMessage')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium">{t('api.syncLogs')}</Label>
          <div className="max-h-40 overflow-y-auto border rounded p-3 bg-muted dark:bg-slate-800">
            <div className="space-y-1 text-xs font-mono text-muted-foreground dark:text-slate-400">
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
