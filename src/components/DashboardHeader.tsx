
import { useAuth } from '@/hooks/useAuth'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
        </div>
        <div className="text-right">
          <Badge variant="secondary" className="mb-2">
            {user.role.displayName}
          </Badge>
          <p className="text-sm text-muted-foreground">
            Último acceso: {formatLastLogin()}
          </p>
        </div>
      </div>
    </Card>
  )
}
