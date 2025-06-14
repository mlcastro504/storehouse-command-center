
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
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

interface CreateConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateConnectionDialog({ open, onOpenChange }: CreateConnectionDialogProps) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    platform_id: '',
    store_name: '',
    store_url: '',
    api_key: '',
    webhook_url: '',
    settings: {}
  });

  const { data: platforms = [] } = useQuery({
    queryKey: ['ecommerce-platforms'],
    queryFn: async () => {
      const db = await connectToDatabase();
      const plats = await db.collection('ecommerce_platforms').find({ is_active: true }).sort({ display_name: 1 }).toArray();
      return plats;
    },
  });

  const createConnectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const db = await connectToDatabase();
      await db.collection('ecommerce_connections').insertOne({
        ...data,
        api_key_encrypted: data.api_key,
        sync_enabled: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecommerce-connections'] });
      onOpenChange(false);
      setFormData({
        platform_id: '',
        store_name: '',
        store_url: '',
        api_key: '',
        webhook_url: '',
        settings: {}
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createConnectionMutation.mutate(formData);
  };

  const selectedPlatform = platforms.find((p: any) => p.id === formData.platform_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Conexión de E-commerce</DialogTitle>
          <DialogDescription>
            Conecta tu tienda online para sincronizar productos y pedidos
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="platform">Plataforma</Label>
            <Select 
              value={formData.platform_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, platform_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una plataforma" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform: any) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="store_name">Nombre de la tienda</Label>
            <Input
              id="store_name"
              value={formData.store_name}
              onChange={(e) => setFormData(prev => ({ ...prev, store_name: e.target.value }))}
              placeholder="Mi Tienda Online"
              required
            />
          </div>

          <div>
            <Label htmlFor="store_url">URL de la tienda</Label>
            <Input
              id="store_url"
              type="url"
              value={formData.store_url}
              onChange={(e) => setFormData(prev => ({ ...prev, store_url: e.target.value }))}
              placeholder="https://mitienda.com"
            />
          </div>

          {selectedPlatform?.name === 'shopify' && (
            <div>
              <Label htmlFor="api_key">API Key / Admin API Access Token</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                placeholder="shpat_xxxxxxxxxxxxxxxxxx"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Obtén tu token desde: Admin → Apps → Manage private apps
              </p>
            </div>
          )}

          {selectedPlatform?.name !== 'shopify' && (
            <div>
              <Label htmlFor="api_key">API Key / Token de Acceso</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                placeholder="Tu API key"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="webhook_url">Webhook URL (opcional)</Label>
            <Input
              id="webhook_url"
              type="url"
              value={formData.webhook_url}
              onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
              placeholder="https://tu-webhook.com/endpoint"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createConnectionMutation.isPending}>
              {createConnectionMutation.isPending ? 'Creando...' : 'Crear Conexión'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
