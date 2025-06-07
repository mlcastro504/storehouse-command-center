
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Settings, Zap, Database } from 'lucide-react';

export function IntegrationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            APIs Externas
          </CardTitle>
          <CardDescription>
            Conecta tu sistema con servicios externos para ampliar funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">API de Envíos</h3>
                  <p className="text-sm text-muted-foreground">Conecta con servicios de paquetería</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">No conectado</Badge>
                <Button variant="outline" size="sm">Configurar</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">ERP Externo</h3>
                  <p className="text-sm text-muted-foreground">Sincronización con sistema ERP</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Conectado</Badge>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Notificaciones SMS</h3>
                  <p className="text-sm text-muted-foreground">Servicio de mensajería SMS</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">No conectado</Badge>
                <Button variant="outline" size="sm">Configurar</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>URL de Webhook</Label>
            <div className="flex space-x-2">
              <div className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                https://tu-dominio.com/api/webhooks
              </div>
              <Button variant="outline" size="sm">Copiar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
