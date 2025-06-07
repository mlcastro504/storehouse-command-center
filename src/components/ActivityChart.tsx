
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity } from "lucide-react"

const mockData = [
  { name: 'Lun', inbound: 45, outbound: 32, transfers: 12 },
  { name: 'Mar', inbound: 52, outbound: 38, transfers: 15 },
  { name: 'Mié', inbound: 48, outbound: 41, transfers: 18 },
  { name: 'Jue', inbound: 61, outbound: 45, transfers: 22 },
  { name: 'Vie', inbound: 55, outbound: 52, transfers: 19 },
  { name: 'Sáb', inbound: 33, outbound: 28, transfers: 8 },
  { name: 'Dom', inbound: 25, outbound: 18, transfers: 5 }
]

export function ActivityChart() {
  return (
    <Card className="warehouse-card col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Actividad Semanal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Bar dataKey="inbound" fill="hsl(220, 70%, 50%)" name="Entradas" />
            <Bar dataKey="outbound" fill="hsl(210, 65%, 45%)" name="Salidas" />
            <Bar dataKey="transfers" fill="hsl(140, 70%, 45%)" name="Transferencias" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
