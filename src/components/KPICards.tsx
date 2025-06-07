
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { KPI } from '@/types/warehouse'
import { useAuth } from '@/hooks/useAuth'

// Mock KPIs basados en rol
const getKPIsForRole = (roleName: string): KPI[] => {
  const baseKPIs = [
    {
      id: '1',
      title: 'Productos en Stock',
      value: 2847,
      previousValue: 2650,
      format: 'number' as const,
      trend: 'up' as const,
      icon: 'Package'
    },
    {
      id: '2',
      title: 'Pedidos Pendientes',
      value: 143,
      previousValue: 156,
      format: 'number' as const,
      trend: 'down' as const,
      icon: 'Clock'
    },
    {
      id: '3',
      title: 'Eficiencia Operativa',
      value: 87,
      previousValue: 84,
      format: 'percentage' as const,
      trend: 'up' as const,
      icon: 'Target'
    },
    {
      id: '4',
      title: 'Valor Inventario',
      value: 1250000,
      previousValue: 1180000,
      format: 'currency' as const,
      trend: 'up' as const,
      icon: 'DollarSign'
    }
  ]

  const driverKPIs = [
    {
      id: '5',
      title: 'Entregas Hoy',
      value: 12,
      previousValue: 10,
      format: 'number' as const,
      trend: 'up' as const,
      icon: 'Truck'
    },
    {
      id: '6',
      title: 'Rutas Completadas',
      value: 8,
      previousValue: 8,
      format: 'number' as const,
      trend: 'stable' as const,
      icon: 'MapPin'
    },
    {
      id: '7',
      title: 'Tiempo Promedio',
      value: 45,
      previousValue: 52,
      format: 'number' as const,
      trend: 'down' as const,
      icon: 'Clock'
    }
  ]

  if (roleName === 'driver') {
    return driverKPIs
  }

  return baseKPIs
}

export function KPICards() {
  const { user } = useAuth()
  
  if (!user) return null

  const kpis = getKPIsForRole(user.role.name)

  const formatValue = (value: number, format: KPI['format']) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR'
        }).format(value)
      case 'percentage':
        return `${value}%`
      default:
        return new Intl.NumberFormat('es-ES').format(value)
    }
  }

  const getTrendIcon = (trend: KPI['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getIcon = (iconName: string) => {
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>
    return IconComponent || LucideIcons.BarChart3
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpis.map((kpi) => {
        const IconComponent = getIcon(kpi.icon)
        const changePercent = kpi.previousValue 
          ? Math.round(((kpi.value - kpi.previousValue) / kpi.previousValue) * 100)
          : 0

        return (
          <Card key={kpi.id} className="warehouse-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <IconComponent className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(kpi.value, kpi.format)}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {getTrendIcon(kpi.trend)}
                <span>
                  {changePercent > 0 ? '+' : ''}{changePercent}% vs anterior
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
