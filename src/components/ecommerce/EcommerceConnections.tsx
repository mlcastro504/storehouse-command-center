
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, Trash2, Power, PowerOff } from 'lucide-react';
import { CreateConnectionDialog } from './CreateConnectionDialog';
import { useToast } from "@/hooks/use-toast";

export function EcommerceConnections() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['ecommerce-connections'],
    queryFn: async () => {
      const db = await connectToDatabase();
      const data = await db.collection('ecommerce_connections').find().sort({ created_at: -1 }).toArray();
      return data.map((c: any) => ({
        ...c,
        id: c.id ?? c._id?.toString?.() ?? "",
      }));
    },
  });

  const toggleSyncMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const db = await connectToDatabase();
      await db.collection('ecommerce_connections').updateOne(
        { id },
        { $set: { sync_enabled: enabled } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecommerce-connections'] });
      toast({
        title: "Conexión actualizada",
        description: "El estado de sincronización ha sido actualizado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la conexión.",
        variant: "destructive",
      });
    },
  });

  const deleteConnectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const db = await connectToDatabase();
      await db.collection('ecommerce_connections').deleteOne({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecommerce-connections'] });
      toast({
        title: "Conexión eliminada",
        description: "La conexión ha sido eliminada correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la conexión.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Conexiones de E-commerce</h2>
          <p className="text-muted-foreground">
            Gestiona las conexiones con tus plataformas de e-commerce
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Conexión
        </Button>
      </div>

      {connections.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No hay conexiones configuradas</h3>
              <p className="text-muted-foreground mb-4">
                Conecta tu primera tienda para comenzar a sincronizar productos y pedidos
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Conexión
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection: any) => (
            <Card key={connection.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{connection.store_name}</CardTitle>
                  <Badge variant={connection.sync_enabled ? "default" : "secondary"}>
                    {connection.sync_enabled ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <CardDescription>
                  {connection.platform?.display_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {connection.store_url && (
                    <div>
                      <p className="text-sm font-medium">URL de la tienda:</p>
                      <p className="text-sm text-muted-foreground truncate">{connection.store_url}</p>
                    </div>
                  )}
                  
                  {connection.last_sync_at && (
                    <div>
                      <p className="text-sm font-medium">Última sincronización:</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(connection.last_sync_at).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSyncMutation.mutate({
                        id: connection.id,
                        enabled: !connection.sync_enabled
                      })}
                    >
                      {connection.sync_enabled ? (
                        <PowerOff className="w-4 h-4 mr-1" />
                      ) : (
                        <Power className="w-4 h-4 mr-1" />
                      )}
                      {connection.sync_enabled ? 'Pausar' : 'Activar'}
                    </Button>
                    
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteConnectionMutation.mutate(connection.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateConnectionDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
