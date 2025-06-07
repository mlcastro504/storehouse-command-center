
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, CheckCircle2 } from "lucide-react"
import { Task } from '@/types/warehouse'
import { useAuth } from '@/hooks/useAuth'

// Mock tasks basadas en rol
const getTasksForRole = (roleName: string, userId: string): Task[] => {
  const managerTasks: Task[] = [
    {
      id: '1',
      title: 'Revisar inventario semanal',
      description: 'Verificar niveles de stock y generar reporte',
      assignedTo: userId,
      assignedBy: 'admin-1',
      module: 'inventory',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Asignar turnos de carga',
      description: 'Organizar equipos para descarga de camiones',
      assignedTo: userId,
      assignedBy: 'admin-1',
      module: 'loading',
      priority: 'medium',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    }
  ]

  const driverTasks: Task[] = [
    {
      id: '3',
      title: 'Entrega Ruta Norte',
      description: 'Completar entregas en zona norte de la ciudad',
      assignedTo: userId,
      assignedBy: 'manager-1',
      module: 'loading',
      priority: 'urgent',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
      createdAt: new Date()
    },
    {
      id: '4',
      title: 'Verificar documentación',
      description: 'Revisar y completar documentos de entrega',
      assignedTo: userId,
      assignedBy: 'manager-1',
      module: 'loading',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
      createdAt: new Date()
    }
  ]

  if (roleName === 'driver') {
    return driverTasks
  }

  return managerTasks
}

export function TaskList() {
  const { user } = useAuth()
  
  if (!user) return null

  const tasks = getTasksForRole(user.role.name, user.id)

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'in_progress':
        return 'text-blue-600'
      case 'cancelled':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatTimeUntilDue = (dueDate: Date) => {
    const now = new Date()
    const diffMs = dueDate.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} día${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `${diffHours} hora${diffHours > 1 ? 's' : ''}`
    } else {
      return 'Vencida'
    }
  }

  return (
    <Card className="warehouse-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Mis Tareas Pendientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium">{task.title}</h4>
              <Badge variant={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {task.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Vence en {formatTimeUntilDue(task.dueDate!)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className={getStatusColor(task.status)}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline">
                Ver Detalles
              </Button>
              {task.status === 'pending' && (
                <Button size="sm" className="warehouse-btn-primary">
                  Iniciar
                </Button>
              )}
              {task.status === 'in_progress' && (
                <Button size="sm" variant="default">
                  Completar
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
            <p>No tienes tareas pendientes</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
