
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, ExternalLink, Info } from 'lucide-react';

interface CreateConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const platformConfigurations = {
  shopify: {
    fields: [
      { key: 'store_name', label: 'Nombre de la tienda', type: 'text', required: true, placeholder: 'Mi Tienda Shopify' },
      { key: 'shop_domain', label: 'Dominio de la tienda', type: 'text', required: true, placeholder: 'mitienda.myshopify.com' },
      { key: 'api_key', label: 'Admin API Access Token', type: 'password', required: true, placeholder: 'shpat_xxxxxxxxxxxxxxxxxx' },
      { key: 'webhook_url', label: 'Webhook URL (opcional)', type: 'url', required: false, placeholder: 'https://tu-webhook.com/shopify' }
    ],
    instructions: 'Para obtener tu Admin API Access Token: Admin → Apps → Manage private apps → Create a private app',
    apiDocsUrl: 'https://shopify.dev/docs/api/admin-rest'
  },
  woocommerce: {
    fields: [
      { key: 'store_name', label: 'Nombre de la tienda', type: 'text', required: true, placeholder: 'Mi Tienda WooCommerce' },
      { key: 'store_url', label: 'URL de la tienda', type: 'url', required: true, placeholder: 'https://mitienda.com' },
      { key: 'consumer_key', label: 'Consumer Key', type: 'text', required: true, placeholder: 'ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
      { key: 'consumer_secret', label: 'Consumer Secret', type: 'password', required: true, placeholder: 'cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
      { key: 'webhook_url', label: 'Webhook URL (opcional)', type: 'url', required: false, placeholder: 'https://tu-webhook.com/woocommerce' }
    ],
    instructions: 'Para generar las claves API: WooCommerce → Settings → Advanced → REST API → Add key',
    apiDocsUrl: 'https://woocommerce.github.io/woocommerce-rest-api-docs/'
  },
  prestashop: {
    fields: [
      { key: 'store_name', label: 'Nombre de la tienda', type: 'text', required: true, placeholder: 'Mi Tienda PrestaShop' },
      { key: 'store_url', label: 'URL de la tienda', type: 'url', required: true, placeholder: 'https://mitienda.com' },
      { key: 'api_key', label: 'Webservice Key', type: 'password', required: true, placeholder: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' },
      { key: 'webhook_url', label: 'Webhook URL (opcional)', type: 'url', required: false, placeholder: 'https://tu-webhook.com/prestashop' }
    ],
    instructions: 'Para generar la clave: Advanced Parameters → Webservice → Add new webservice key',
    apiDocsUrl: 'https://devdocs.prestashop.com/1.7/webservice/'
  },
  magento: {
    fields: [
      { key: 'store_name', label: 'Nombre de la tienda', type: 'text', required: true, placeholder: 'Mi Tienda Magento' },
      { key: 'store_url', label: 'URL de la tienda', type: 'url', required: true, placeholder: 'https://mitienda.com' },
      { key: 'access_token', label: 'Access Token', type: 'password', required: true, placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
      { key: 'webhook_url', label: 'Webhook URL (opcional)', type: 'url', required: false, placeholder: 'https://tu-webhook.com/magento' }
    ],
    instructions: 'Para generar el token: System → Extensions → Integrations → Add New Integration',
    apiDocsUrl: 'https://developer.adobe.com/commerce/webapi/'
  },
  bigcommerce: {
    fields: [
      { key: 'store_name', label: 'Nombre de la tienda', type: 'text', required: true, placeholder: 'Mi Tienda BigCommerce' },
      { key: 'store_hash', label: 'Store Hash', type: 'text', required: true, placeholder: 'abc123def' },
      { key: 'access_token', label: 'Access Token', type: 'password', required: true, placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
      { key: 'client_id', label: 'Client ID', type: 'text', required: true, placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
      { key: 'webhook_url', label: 'Webhook URL (opcional)', type: 'url', required: false, placeholder: 'https://tu-webhook.com/bigcommerce' }
    ],
    instructions: 'Para crear API credentials: Settings → API → Store-level API accounts → Create API account',
    apiDocsUrl: 'https://developer.bigcommerce.com/api-docs/'
  },
  opencart: {
    fields: [
      { key: 'store_name', label: 'Nombre de la tienda', type: 'text', required: true, placeholder: 'Mi Tienda OpenCart' },
      { key: 'store_url', label: 'URL de la tienda', type: 'url', required: true, placeholder: 'https://mitienda.com' },
      { key: 'api_key', label: 'API Key', type: 'password', required: true, placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
      { key: 'username', label: 'API Username', type: 'text', required: true, placeholder: 'api_user' },
      { key: 'webhook_url', label: 'Webhook URL (opcional)', type: 'url', required: false, placeholder: 'https://tu-webhook.com/opencart' }
    ],
    instructions: 'Para habilitar la API: System → Users → API → Add New',
    apiDocsUrl: 'https://docs.opencart.com/developer/api/'
  },
  squarespace: {
    fields: [
      { key: 'store_name', label: 'Nombre de la tienda', type: 'text', required: true, placeholder: 'Mi Tienda Squarespace' },
      { key: 'store_url', label: 'URL de la tienda', type: 'url', required: true, placeholder: 'https://mitienda.squarespace.com' },
      { key: 'api_key', label: 'API Key', type: 'password', required: true, placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
      { key: 'webhook_url', label: 'Webhook URL (opcional)', type: 'url', required: false, placeholder: 'https://tu-webhook.com/squarespace' }
    ],
    instructions: 'Para obtener tu API key: Settings → Advanced → Import & Export → API Keys',
    apiDocsUrl: 'https://developers.squarespace.com/'
  }
};

export function CreateConnectionDialog({ open, onOpenChange }: CreateConnectionDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { data: platforms = [] } = useQuery({
    queryKey: ['ecommerce-platforms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ecommerce_platforms')
        .select('*')
        .eq('is_active', true)
        .order('display_name');
      
      if (error) {
        console.error('Error fetching platforms:', error);
        // Fallback con plataformas populares
        return [
          { id: '1', name: 'shopify', display_name: 'Shopify', api_url: 'https://{{shop}}.myshopify.com/admin/api/2023-10/', is_active: true },
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

  const createConnectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('ecommerce_connections')
        .insert([{
          platform_id: data.platform_id,
          user_id: user?.id,
          store_name: data.store_name,
          store_url: data.store_url,
          api_key_encrypted: data.api_credentials,
          webhook_url: data.webhook_url,
          settings: data.additional_settings || {},
          sync_enabled: false,
          is_active: true
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecommerce-connections'] });
      toast({
        title: "Conexión creada exitosamente",
        description: "La conexión ha sido configurada correctamente.",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating connection:', error);
      toast({
        title: "Error al crear conexión",
        description: "No se pudo crear la conexión. Verifica los datos e intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedPlatform('');
    setFormData({});
  };

  const handlePlatformChange = (platformId: string) => {
    setSelectedPlatform(platformId);
    setFormData({});
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const platform = platforms.find(p => p.id === selectedPlatform);
    if (!platform) return;

    const config = platformConfigurations[platform.name as keyof typeof platformConfigurations];
    if (!config) return;

    // Validar campos requeridos
    const missingFields = config.fields
      .filter(field => field.required && !formData[field.key])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast({
        title: "Campos requeridos faltantes",
        description: `Por favor completa: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Preparar datos para envío
    const connectionData = {
      platform_id: selectedPlatform,
      store_name: formData.store_name,
      store_url: formData.store_url || formData.shop_domain,
      api_credentials: JSON.stringify(formData),
      webhook_url: formData.webhook_url,
      additional_settings: {}
    };

    createConnectionMutation.mutate(connectionData);
  };

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);
  const config = selectedPlatformData ? platformConfigurations[selectedPlatformData.name as keyof typeof platformConfigurations] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Nueva Conexión de E-commerce
          </DialogTitle>
          <DialogDescription>
            Conecta tu tienda online para sincronizar productos y pedidos automáticamente
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de plataforma */}
          <div className="space-y-2">
            <Label htmlFor="platform">Plataforma de E-commerce</Label>
            <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu plataforma" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform: any) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      {platform.display_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Configuración específica de la plataforma */}
          {config && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Configuración de {selectedPlatformData?.display_name}
                </CardTitle>
                <CardDescription>
                  {config.instructions}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={field.key}>
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      {field.required && (
                        <Badge variant="secondary" className="text-xs">Requerido</Badge>
                      )}
                    </div>
                    <Input
                      id={field.key}
                      type={field.type}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  </div>
                ))}

                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Info className="w-4 h-4 text-blue-600" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Documentación de la API</p>
                    <a 
                      href={config.apiDocsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Ver documentación <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedPlatform || createConnectionMutation.isPending}
            >
              {createConnectionMutation.isPending ? 'Creando conexión...' : 'Crear Conexión'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
