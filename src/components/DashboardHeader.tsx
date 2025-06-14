
import { useAuth } from '@/hooks/useAuth'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BrowserStorage } from '@/lib/browserStorage'
import { useTranslation } from 'react-i18next'

export function DashboardHeader() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation('dashboard')

  if (!user) return null

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('greetings.morning')
    if (hour < 18) return t('greetings.afternoon')
    return t('greetings.evening')
  }

  const formatLastLogin = () => {
    if (!user.lastLoginAt) return t('never')
    
    // Ensure we have a proper Date object
    const date = user.lastLoginAt instanceof Date 
      ? user.lastLoginAt 
      : new Date(user.lastLoginAt)
    
    return date.toLocaleDateString(i18n.language)
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
            {t('description')}
          </p>
          {!hasMockData() && (
            <p className="text-sm text-orange-600 mt-2">
              {t('mockData.notLoadedWarning')}
            </p>
          )}
        </div>
        <div className="text-right">
          <Badge variant="secondary" className="mb-2">
            {user.role.displayName}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {t('lastAccess')}: {formatLastLogin()}
          </p>
          {hasMockData() && (
            <p className="text-xs text-green-600 mt-1">
              {t('mockData.active')}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
