
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Settings, 
  TestTube, 
  Power,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EcommerceAdvancedService } from '@/services/ecommerceAdvancedService';
import { toast } from 'sonner';

export const EcommerceChannelsManager = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const queryClient = useQueryClient();

  // Query para obtener canales
  const { data: channels, isLoading } = useQuery({
    queryKey: ['ecommerce-channels'],
    queryFn: EcommerceAdvancedService.getChannels
  });

  // Mutación para crear canal
  const createChannelMutation = useMutation({
    mutationFn: EcommerceAdvancedService.createChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecommerce-channels'] });
      setIsCreateDialogOpen(false);
      toast.success('Canal creado exitosamente');
    },
    onError: () => {
      toast.error('Error al crear el canal');
    }
  });

  // Mutación para probar conexión
  const testConnectionMutation = useMutation({
    mutationFn: EcommerceAdvancedService.testChannelConnection,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ecommerce-channels'] });
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    }
  });

  const handleCreateChannel = (formData: FormData) => {
    const channelData = {
      name: formData.get('name') as string,
      platform_type: formData.get('platform_type') as string,
      api_endpoint: formData.get('api_endpoint') as string,
      api_key_encrypted: formData.get('api_key') as string,
      webhook_url: formData.get('webhook_url') as string,
      is_sandbox: formData.get('is_sandbox') === 'on',
      sync_frequency_minutes: parseInt(formData.get('sync_frequency') as string) || 10,
      settings: {},
      user_id: 'current_user_id'
    };

    createChannelMutation.mutate(channelData);
  };

  const handleTestConnection = (channelId: string) => {
    testConnectionMutation.mutate(channelId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'syncing': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'error': return 'destructive';
      case 'syncing': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando canales...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Canales</h2>
          <p className="text-gray-600">Conecta y administra tus plataformas de e-commerce</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Canal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Canal</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateChannel(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Canal</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej: Mi Tienda Shopify"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform_type">Plataforma</Label>
                <Select name="platform_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopify">Shopify</SelectItem>
                    <SelectItem value="woocommerce">WooCommerce</SelectItem>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="etsy">Etsy</SelectItem>
                    <SelectItem value="mercadolibre">MercadoLibre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_endpoint">API Endpoint</Label>
                <Input
                  id="api_endpoint"
                  name="api_endpoint"
                  placeholder="https://mi-tienda.myshopify.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key">API Key / Token</Label>
                <Input
                  id="api_key"
                  name="api_key"
                  type="password"
                  placeholder="Tu API key o token de acceso"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_url">Webhook URL (Opcional)</Label>
                <Input
                  id="webhook_url"
                  name="webhook_url"
                  placeholder="https://tu-webhook.com/ecommerce"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sync_frequency">Frecuencia de Sync (minutos)</Label>
                <Input
                  id="sync_frequency"
                  name="sync_frequency"
                  type="number"
                  defaultValue="10"
                  min="1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="is_sandbox" name="is_sandbox" />
                <Label htmlFor="is_sandbox">Modo Sandbox/Testing</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createChannelMutation.isPending}
                >
                  {createChannelMutation.isPending ? 'Creando...' : 'Crear Canal'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels?.map((channel) => (
          <Card key={channel.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{channel.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(channel.sync_status)}
                  <Badge variant={getStatusColor(channel.sync_status)}>
                    {channel.sync_status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{channel.platform_type}</Badge>
                {channel.is_sandbox && (
                  <Badge variant="secondary">Sandbox</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <p>Sincronización: cada {channel.sync_frequency_minutes} min</p>
                {channel.last_sync_at && (
                  <p>Último sync: {new Date(channel.last_sync_at).toLocaleString()}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => handleTestConnection(channel.id)}
                  disabled={testConnectionMutation.isPending}
                >
                  <TestTube className="w-3 h-3" />
                  Probar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => setSelectedChannel(channel)}
                >
                  <Settings className="w-3 h-3" />
                  Config
                </Button>
                <Button
                  size="sm"
                  variant={channel.is_active ? "destructive" : "default"}
                  className="flex items-center gap-1"
                >
                  <Power className="w-3 h-3" />
                  {channel.is_active ? 'Pausar' : 'Activar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {channels?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay canales configurados</h3>
            <p className="text-gray-600 text-center mb-4">
              Conecta tu primera plataforma de e-commerce para comenzar
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Crear Primer Canal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
