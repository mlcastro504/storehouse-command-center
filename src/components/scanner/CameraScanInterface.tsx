
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScannerService } from '@/services/scannerService';
import { CameraScanConfig } from '@/types/scanner';
import { Camera, CameraOff, Flashlight, FlashlightOff, RotateCw } from 'lucide-react';

interface CameraScanInterfaceProps {
  onScanSuccess: (value: string) => void;
  onScanError: (error: string) => void;
  config?: CameraScanConfig;
}

export const CameraScanInterface: React.FC<CameraScanInterfaceProps> = ({
  onScanSuccess,
  onScanError,
  config = {
    enabled: true,
    preferred_camera: 'rear',
    resolution: 'medium',
    auto_focus: true,
    flash_mode: 'auto',
    scan_area_overlay: true,
    continuous_scan: false,
    beep_on_scan: true,
    vibrate_on_scan: true
  }
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<'rear' | 'front'>(config.preferred_camera);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkCameraSupport();
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraSupport = async () => {
    const supported = await ScannerService.isCameraSupported();
    setCameraSupported(supported);
    if (!supported) {
      setError('La cámara no está disponible en este dispositivo');
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      const newStream = await ScannerService.initializeCamera({
        ...config,
        preferred_camera: currentCamera
      });

      if (newStream && videoRef.current) {
        setStream(newStream);
        videoRef.current.srcObject = newStream;
        setIsScanning(true);
      } else {
        throw new Error('No se pudo inicializar la cámara');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al acceder a la cámara: ${errorMessage}`);
      onScanError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const switchCamera = async () => {
    stopCamera();
    setCurrentCamera(prev => prev === 'rear' ? 'front' : 'rear');
    setTimeout(() => {
      startCamera();
    }, 500);
  };

  const toggleFlash = async () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && 'torch' in videoTrack.getCapabilities()) {
        try {
          await videoTrack.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any]
          });
          setFlashEnabled(!flashEnabled);
        } catch (err) {
          console.error('Error toggling flash:', err);
        }
      }
    }
  };

  const simulateScan = () => {
    // Simulación de escaneo exitoso para pruebas
    const mockBarcode = `TEST-${Date.now()}`;
    
    if (config.beep_on_scan) {
      // Crear sonido de beep
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    }

    if (config.vibrate_on_scan && 'vibrate' in navigator) {
      navigator.vibrate(100);
    }

    onScanSuccess(mockBarcode);
  };

  if (!cameraSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CameraOff className="h-5 w-5 text-red-500" />
            Cámara no disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Este dispositivo no soporta escaneo con cámara o no se han otorgado los permisos necesarios.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Escaneo con Cámara
          </div>
          <Badge variant={isScanning ? 'default' : 'secondary'}>
            {isScanning ? 'Activo' : 'Inactivo'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 bg-black rounded-lg object-cover"
            style={{ display: isScanning ? 'block' : 'none' }}
          />
          
          {!isScanning && (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Presiona "Iniciar Cámara" para comenzar</p>
              </div>
            </div>
          )}

          {config.scan_area_overlay && isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-32 border-2 border-white rounded-lg shadow-lg">
                <div className="w-full h-full border border-dashed border-white rounded-lg"></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {!isScanning ? (
            <Button onClick={startCamera} className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Iniciar Cámara
            </Button>
          ) : (
            <Button onClick={stopCamera} variant="destructive" className="flex items-center gap-2">
              <CameraOff className="h-4 w-4" />
              Detener Cámara
            </Button>
          )}

          {isScanning && (
            <>
              <Button onClick={switchCamera} variant="outline" className="flex items-center gap-2">
                <RotateCw className="h-4 w-4" />
                Cambiar Cámara
              </Button>

              <Button
                onClick={toggleFlash}
                variant="outline"
                className="flex items-center gap-2"
              >
                {flashEnabled ? (
                  <FlashlightOff className="h-4 w-4" />
                ) : (
                  <Flashlight className="h-4 w-4" />
                )}
                Flash
              </Button>

              <Button onClick={simulateScan} variant="secondary">
                Simular Escaneo
              </Button>
            </>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Enfoque la cámara hacia el código de barras o QR</p>
          <p>• Mantenga el dispositivo estable para mejor lectura</p>
          <p>• Use buena iluminación o active el flash si es necesario</p>
        </div>
      </CardContent>
    </Card>
  );
};
