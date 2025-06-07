
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Plug, Check, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function IntegrationSettings() {
  const [integrations, setIntegrations] = useState({
    shopify: { enabled: false, apiKey: '', status: 'disconnected' },
    woocommerce: { enabled: false, apiKey: '', status: 'disconnected' },
    stripe: { enabled: true, apiKey: 'sk_test_***', status: 'connected' },
    mailchimp: { enabled: false, apiKey: '', status: 'disconnected' },
    zapier: { enabled: false, apiKey: '', status: 'disconnected' },
    slack: { enabled: true, webhookUrl: 'https://hooks.slack.com/***', status: 'connected' }
  });

  const { toast } = useToast();

  const handleToggleIntegration = (key: string, enabled: boolean) => {
    setIntegrations({
      ...integrations,
      [key]: { ...integrations[key as keyof typeof integrations], enabled }
    });

    toast({
      title: enabled ? "Integración habilitada" : "Integración deshabilitada",
      description: `La integración con ${key} ha sido ${enabled ? 'habilitada' : 'deshabilitada'}.`,
    });
  };

  const handleConnect = (platform: string) => {
    toast({
      title: "Conectando...",
      description: `Conectando con ${platform}. Te redirigiremos a su página de autorización.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Conectado</Badge>;
      case 'error':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="w-5 h-5" />
            Integraciones de E-commerce
          </CardTitle>
          <CardDescription>
            Conecta tu sistema con plataformas de e-commerce
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">S</span>
                </div>
                <div>
                  <h4 className="font-medium">Shopify</h4>
                  <p className="text-sm text-muted-foreground">Sincroniza productos y pedidos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(integrations.shopify.status)}
                <Switch
                  checked={integrations.shopify.enabled}
                  onCheckedChange={(checked) => handleToggleIntegration('shopify', checked)}
                />
                <Button variant="outline" size="sm" onClick={() => handleConnect('Shopify')}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Conectar
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">W</span>
                </div>
                <div>
                  <h4 className="font-medium">WooCommerce</h4>
                  <p className="text-sm text-muted-foreground">Integración con WordPress</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(integrations.woocommerce.status)}
                <Switch
                  checked={integrations.woocommerce.enabled}
                  onCheckedChange={(checked) => handleToggleIntegration('woocommerce', checked)}
                />
                <Button variant="outline" size="sm" onClick={() => handleConnect('WooCommerce')}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Conectar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integraciones de Pagos</CardTitle>
          <CardDescription>
            Configura procesadores de pagos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">S</span>
              </div>
              <div>
                <h4 className="font-medium">Stripe</h4>
                <p className="text-sm text-muted-foreground">Procesamiento de pagos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(integrations.stripe.status)}
              <Switch
                checked={integrations.stripe.enabled}
                onCheckedChange={(checked) => handleToggleIntegration('stripe', checked)}
              />
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Herramientas de Marketing</CardTitle>
          <CardDescription>
            Conecta herramientas de marketing y automatización
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-bold text-sm">M</span>
              </div>
              <div>
                <h4 className="font-medium">Mailchimp</h4>
                <p className="text-sm text-muted-foreground">Email marketing</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(integrations.mailchimp.status)}
              <Switch
                checked={integrations.mailchimp.enabled}
                onCheckedChange={(checked) => handleToggleIntegration('mailchimp', checked)}
              />
              <Button variant="outline" size="sm" onClick={() => handleConnect('Mailchimp')}>
                <ExternalLink className="w-4 h-4 mr-1" />
                Conectar
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">Z</span>
              </div>
              <div>
                <h4 className="font-medium">Zapier</h4>
                <p className="text-sm text-muted-foreground">Automatización de workflows</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(integrations.zapier.status)}
              <Switch
                checked={integrations.zapier.enabled}
                onCheckedChange={(checked) => handleToggleIntegration('zapier', checked)}
              />
              <Button variant="outline" size="sm" onClick={() => handleConnect('Zapier')}>
                <ExternalLink className="w-4 h-4 mr-1" />
                Conectar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comunicaciones</CardTitle>
          <CardDescription>
            Integra herramientas de comunicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-sm">S</span>
              </div>
              <div>
                <h4 className="font-medium">Slack</h4>
                <p className="text-sm text-muted-foreground">Notificaciones en tiempo real</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(integrations.slack.status)}
              <Switch
                checked={integrations.slack.enabled}
                onCheckedChange={(checked) => handleToggleIntegration('slack', checked)}
              />
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
