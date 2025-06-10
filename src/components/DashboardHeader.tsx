
import { useAuth } from '@/hooks/useAuth'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BrowserStorage } from '@/lib/browserStorage'

export function DashboardHeader() {
  const { user } = useAuth()

  if (!user) return null

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const formatLastLogin = () => {
    if (!user.lastLoginAt) return 'Nunca'
    
    // Ensure we have a proper Date object
    const date = user.lastLoginAt instanceof Date 
      ? user.lastLoginAt 
      : new Date(user.lastLoginAt)
    
    return date.toLocaleDateString('es-ES')
  }

  // Check if we have mock data loaded
  const hasMockData = () => {
    const users = BrowserStorage.get('users');
    const products = BrowserStorage.get('products');
    return users && products && users.length > 0 && products.length > 0;
  }

  return (
    <Card className="warehouse-card p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {user.firstName}
          </h1>
          <p className="text-muted-foreground">
            Bienvenido al sistema de gestión de almacenes
          </p>
          {!hasMockData() && (
            <p className="text-sm text-orange-600 mt-2">
              ⚠️ No hay datos mock cargados. Ve a Configuración → Sistema → Mock Data para generar datos de prueba.
            </p>
          )}
        </div>
        <div className="text-right">
          <Badge variant="secondary" className="mb-2">
            {user.role.displayName}
          </Badge>
          <p className="text-sm text-muted-foreground">
            Último acceso: {formatLastLogin()}
          </p>
          {hasMockData() && (
            <p className="text-xs text-green-600 mt-1">
              ✅ Datos mock activos
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
