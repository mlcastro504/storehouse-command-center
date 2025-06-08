
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const PutAwayPerformanceChart = () => {
  // Datos de ejemplo para los gráficos
  const dailyPerformance = [
    { day: 'Lun', completed: 45, pending: 12, efficiency: 85 },
    { day: 'Mar', completed: 52, pending: 8, efficiency: 92 },
    { day: 'Mié', completed: 48, pending: 15, efficiency: 78 },
    { day: 'Jue', completed: 61, pending: 5, efficiency: 95 },
    { day: 'Vie', completed: 55, pending: 10, efficiency: 88 },
    { day: 'Sáb', completed: 38, pending: 7, efficiency: 82 },
    { day: 'Dom', completed: 28, pending: 4, efficiency: 90 },
  ];

  const operatorPerformance = [
    { name: 'Juan Pérez', tasks: 125, efficiency: 92, avgTime: 8.5 },
    { name: 'María García', tasks: 118, efficiency: 89, avgTime: 9.2 },
    { name: 'Carlos López', tasks: 110, efficiency: 85, avgTime: 10.1 },
    { name: 'Ana Martín', tasks: 98, efficiency: 88, avgTime: 9.8 },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">327</div>
            <p className="text-sm text-muted-foreground">Tareas Completadas</p>
            <p className="text-xs text-green-600">+12% vs semana anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">45</div>
            <p className="text-sm text-muted-foreground">Tareas Pendientes</p>
            <p className="text-xs text-blue-600">-8% vs semana anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">87%</div>
            <p className="text-sm text-muted-foreground">Eficiencia Promedio</p>
            <p className="text-xs text-purple-600">+3% vs semana anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">9.2</div>
            <p className="text-sm text-muted-foreground">Min. Promedio/Tarea</p>
            <p className="text-xs text-orange-600">-0.8 min vs semana anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Rendimiento Diario */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento Diario</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Completadas"
              />
              <Line 
                type="monotone" 
                dataKey="pending" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Pendientes"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Rendimiento por Operario */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Operario (Esta Semana)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={operatorPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tasks" fill="#3b82f6" name="Tareas Completadas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabla de Rendimiento por Operario */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de Rendimiento por Operario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Operario</th>
                  <th className="text-right p-2">Tareas</th>
                  <th className="text-right p-2">Eficiencia</th>
                  <th className="text-right p-2">Tiempo Promedio</th>
                </tr>
              </thead>
              <tbody>
                {operatorPerformance.map((operator, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{operator.name}</td>
                    <td className="p-2 text-right">{operator.tasks}</td>
                    <td className="p-2 text-right">
                      <span className={`font-medium ${
                        operator.efficiency >= 90 ? 'text-green-600' :
                        operator.efficiency >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {operator.efficiency}%
                      </span>
                    </td>
                    <td className="p-2 text-right">{operator.avgTime} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
