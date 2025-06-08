
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryService } from '@/services/inventoryService';
import { toast } from 'sonner';
import { Database, CheckCircle, XCircle } from 'lucide-react';

export const ConnectionTest = () => {
  const [testing, setTesting] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus('idle');
    
    try {
      console.log('Starting connection test...');
      const result = await InventoryService.testConnection();
      
      if (result.success) {
        setConnectionStatus('success');
        toast.success('Conexión a MongoDB exitosa');
        console.log('Connection test result:', result);
      } else {
        setConnectionStatus('error');
        toast.error(`Error de conexión: ${result.error}`);
        console.error('Connection test failed:', result.error);
      }
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Error al probar la conexión');
      console.error('Connection test error:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Estado de Conexión MongoDB
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {connectionStatus === 'success' && (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-600">Conectado correctamente</span>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-600">Error de conexión</span>
            </>
          )}
          {connectionStatus === 'idle' && (
            <span className="text-gray-600">Estado desconocido</span>
          )}
        </div>
        
        <Button 
          onClick={testConnection} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Probando conexión...' : 'Probar Conexión'}
        </Button>
      </CardContent>
    </Card>
  );
};
