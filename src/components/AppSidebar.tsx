
import { Calendar, Home, Inbox, Search, Settings, LogOut, Moon, Sun } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from '@/hooks/useAuth'
import { getModulesForUser } from '@/data/modules'
import { useState, useEffect } from 'react'
import { useTranslation } from "react-i18next"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AppSidebar() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation(['common', 'settings', 'dashboard', 'inventory', 'locations', 'suppliers', 'picking', 'stock-move', 'putaway', 'scanner', 'loading', 'users', 'customers', 'ecommerce', 'accounting', 'chat']);
  const [companyName, setCompanyName] = useState('WarehouseOS')
  const [companyLogo, setCompanyLogo] = useState('')
  
  // Asegurar que se muestren todos los módulos disponibles para el usuario
  const userModules = user ? getModulesForUser(user.role.level) : []
  
  // Cargar configuraciones de la empresa
  useEffect(() => {
    const savedName = localStorage.getItem('companyName')
    const savedLogo = localStorage.getItem('companyLogo')
    
    if (savedName) {
      setCompanyName(savedName)
    }
    if (savedLogo) {
      setCompanyLogo(savedLogo)
    }
  }, [])

  const getIcon = (iconName: string) => {
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>
    return IconComponent || LucideIcons.Home
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          {companyLogo ? (
            <img 
              src={companyLogo} 
              alt="Logo" 
              className="w-8 h-8 object-contain rounded-lg"
            />
          ) : (
            <div className="w-8 h-8 warehouse-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WOS</span>
            </div>
          )}
          <div>
            <h2 className="font-bold text-lg">{companyName}</h2>
            <p className="text-xs text-muted-foreground">{t('sidebar.managementSystem')}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.mainModules')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userModules.length > 0 ? (
                userModules.map((module) => {
                  const IconComponent = getIcon(module.icon)
                  return (
                    <SidebarMenuItem key={module.id}>
                      <SidebarMenuButton asChild>
                        <a href={module.path} className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          <span>{t(module.displayName)}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <span className="text-muted-foreground">No hay módulos disponibles</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.system')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>{t('settings:title')}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        
        {user && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-sidebar-accent">
            <Avatar className="w-8 h-8">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.role.displayName}
              </p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
