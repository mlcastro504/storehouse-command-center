
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (isSignUp) {
      // Implementar registro aquí si es necesario
      setError('El registro no está implementado aún. Use las credenciales de prueba.')
      return
    }
    
    const success = await login(email, password)
    if (!success) {
      setError('Credenciales inválidas. Verifica tu email y contraseña.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 warehouse-gradient rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">WOS</span>
          </div>
          <CardTitle className="text-2xl">WarehouseOS</CardTitle>
          <CardDescription>
            Sistema de Gestión de Almacenes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@warehouseos.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            {error && (
              <Alert>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full warehouse-btn-primary"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm"
              >
                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground mt-4">
              <p className="font-medium">Usuarios de prueba:</p>
              <p>• <strong>webmastertodoaca@gmail.com</strong> (Administrador)</p>
              <p>  Contraseña: <strong>Futuro2025</strong></p>
              <hr className="my-2" />
              <p>• manager@warehouseos.com (Manager)</p>
              <p>• driver@warehouseos.com (Driver)</p>
              <p className="mt-1">Contraseña: <strong>password123</strong></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
