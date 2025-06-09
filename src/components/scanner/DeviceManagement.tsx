import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { useScanDevices, useCreateScanDevice, useAssignDevice, useDeviceAssignments } from '@/hooks/useScanner';
import { Plus, Smartphone, Tablet, Camera, Settings, User, Battery, Wifi, WifiOff } from 'lucide-react';
import { ScanDevice } from '@/types/scanner';

export const DeviceManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  
  const { data: devices, isLoading } = useScanDevices();
  const { data: assignments } = useDeviceAssignments();
  const createDevice = useCreateScanDevice();
  const assignDevice = useAssignDevice();

  const deviceForm = useForm();
  const assignForm = useForm();

  const onCreateDevice = async (data: any) => {
    const deviceData: Partial<ScanDevice> = {
      device_name: data.device_name,
      device_type: data.device_type as 'handheld' | 'fixed' | 'mobile_app' | 'tablet' | 'camera_device',
      device_model: data.device_model,
      device_id: `${data.device_type}_${Date.now()}`,
      capabilities: {
        has_camera: data.device_type === 'mobile_app' || data.device_type === 'tablet' || data.device_type === 'camera_device',
        has_rear_camera: data.device_type === 'mobile_app' || data.device_type === 'tablet',
        has_front_camera: data.device_type === 'mobile_app' || data.device_type === 'tablet',
        supports_barcode: true,
        supports_qr: true,
        supports_rfid: data.device_type === 'handheld',
        can_vibrate: data.device_type === 'mobile_app' || data.device_type === 'tablet',
        has_flashlight: data.device_type === 'mobile_app' || data.device_type === 'tablet' || data.device_type === 'handheld'
      },
      settings: {
        preferred_camera: 'rear' as 'rear' | 'front' | 'auto',
        vibration_enabled: true,
        sound_enabled: true,
        flashlight_enabled: false,
        auto_focus: true,
        scan_timeout: 5000,
        validation_mode: 'normal' as 'strict' | 'normal' | 'lenient'
      }
    };

    await createDevice.mutateAsync(deviceData);
    setIsCreateDialogOpen(false);
    deviceForm.reset();
  };

  const onAssignDevice = async (data: any) => {
    if (selectedDevice) {
      await assignDevice.mutateAsync({
        deviceId: selectedDevice,
        userId: data.user_id,
        assignmentType: data.assignment_type as 'permanent' | 'temporary' | 'shift_based'
      });
      setSelectedDevice(null);
      assignForm.reset();
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'handheld':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'camera_device':
        return <Camera className="h-4 w-4" />;
      default:
        return <Smartphone className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'default';
      case 'disconnected':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return <div>Cargando dispositivos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Dispositivos</h2>
          <p className="text-muted-foreground">
            Administra los dispositivos de escaneo del sistema
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Dispositivo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Dispositivo</DialogTitle>
            </DialogHeader>
            <Form {...deviceForm}>
              <form onSubmit={deviceForm.handleSubmit(onCreateDevice)} className="space-y-4">
                <FormField
                  control={deviceForm.control}
                  name="device_name"
                  rules={{ required: 'El nombre es requerido' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Dispositivo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Scanner-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={deviceForm.control}
                  name="device_type"
                  rules={{ required: 'El tipo es requerido' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Dispositivo</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="handheld">Escáner Portátil</SelectItem>
                            <SelectItem value="mobile_app">Aplicación Móvil</SelectItem>
                            <SelectItem value="tablet">Tablet</SelectItem>
                            <SelectItem value="camera_device">Dispositivo con Cámara</SelectItem>
                            <SelectItem value="fixed">Escáner Fijo</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={deviceForm.control}
                  name="device_model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Zebra TC21, iPhone 12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={createDevice.isPending}>
                  {createDevice.isPending ? 'Registrando...' : 'Registrar Dispositivo'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices?.map((device) => (
              <Card key={device.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.device_type)}
                      <CardTitle className="text-lg">{device.device_name}</CardTitle>
                    </div>
                    <Badge variant={getStatusColor(device.connection_status)}>
                      <div className="flex items-center gap-1">
                        {device.connection_status === 'connected' ? (
                          <Wifi className="h-3 w-3" />
                        ) : (
                          <WifiOff className="h-3 w-3" />
                        )}
                        {device.connection_status}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="capitalize">
                        {device.device_type === 'handheld' ? 'Portátil' :
                         device.device_type === 'mobile_app' ? 'Móvil' :
                         device.device_type === 'tablet' ? 'Tablet' :
                         device.device_type === 'camera_device' ? 'Cámara' : device.device_type}
                      </span>
                    </div>
                    
                    {device.device_model && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Modelo:</span>
                        <span>{device.device_model}</span>
                      </div>
                    )}

                    {device.battery_level && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Batería:</span>
                        <div className="flex items-center gap-1">
                          <Battery className="h-3 w-3" />
                          <span>{device.battery_level}%</span>
                        </div>
                      </div>
                    )}

                    {device.assigned_to && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Asignado a:</span>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="text-xs">{device.assigned_to}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedDevice(device.id)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Gestionar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asignaciones de Dispositivos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments?.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.device_id}</TableCell>
                      <TableCell>{assignment.user_id}</TableCell>
                      <TableCell className="capitalize">{assignment.assignment_type}</TableCell>
                      <TableCell>{new Date(assignment.assigned_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
                          {assignment.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Gestionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para asignar dispositivo */}
      <Dialog open={!!selectedDevice} onOpenChange={() => setSelectedDevice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Dispositivo</DialogTitle>
          </DialogHeader>
          <Form {...assignForm}>
            <form onSubmit={assignForm.handleSubmit(onAssignDevice)} className="space-y-4">
              <FormField
                control={assignForm.control}
                name="user_id"
                rules={{ required: 'Selecciona un usuario' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="ID del usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={assignForm.control}
                name="assignment_type"
                rules={{ required: 'Selecciona el tipo de asignación' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Asignación</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="permanent">Permanente</SelectItem>
                          <SelectItem value="temporary">Temporal</SelectItem>
                          <SelectItem value="shift_based">Por Turno</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={assignDevice.isPending}>
                {assignDevice.isPending ? 'Asignando...' : 'Asignar Dispositivo'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
