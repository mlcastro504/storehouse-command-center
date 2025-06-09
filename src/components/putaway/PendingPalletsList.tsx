
import React from 'react';
import { usePendingPallets, useClaimPallet } from '@/hooks/usePutAway';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Weight, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const PendingPalletsList = () => {
  const { data: pallets, isLoading, error } = usePendingPallets();
  const claimPallet = useClaimPallet();

  const handleClaimPallet = (palletId: string) => {
    claimPallet.mutate(palletId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Error al cargar los palets pendientes
      </div>
    );
  }

  if (!pallets || pallets.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hay palets pendientes de almacenar</p>
        <p className="text-sm">Los palets aparecerán aquí cuando sean descargados</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {pallets.map((pallet) => (
        <Card key={pallet.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{pallet.pallet_number}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Producto: {pallet.product?.name || 'Desconocido'}
                </p>
              </div>
              <Badge variant="secondary">{pallet.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad</p>
                  <p className="font-medium">{pallet.quantity} unidades</p>
                </div>
              </div>
              
              {pallet.weight && (
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Peso</p>
                    <p className="font-medium">{pallet.weight} kg</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Recibido</p>
                  <p className="font-medium">
                    {format(new Date(pallet.received_at), 'dd/MM HH:mm', { locale: es })}
                  </p>
                </div>
              </div>

              {pallet.expiry_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Vencimiento</p>
                  <p className="font-medium">
                    {format(new Date(pallet.expiry_date), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
              )}
            </div>

            {pallet.special_requirements && pallet.special_requirements.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Requisitos especiales:</p>
                <div className="flex flex-wrap gap-2">
                  {pallet.special_requirements.map((req, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={() => handleClaimPallet(pallet.id)}
                disabled={claimPallet.isPending}
                className="flex items-center gap-2"
              >
                {claimPallet.isPending ? (
                  'Asignando...'
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    Tomar Palet
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
