
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { IntegrationSettings } from '@/components/settings/IntegrationSettings';
import { SystemSettings } from '@/components/settings/SystemSettings';
import { CompanySettings } from '@/components/settings/CompanySettings';
import { WarehouseSettings } from '@/components/settings/WarehouseSettings';
import { DatabaseSettings } from '@/components/settings/DatabaseSettings';
import { BackupSettings } from '@/components/settings/BackupSettings';
import { ApiIntegrationSettings } from '@/components/settings/ApiIntegrationSettings';
import { LanguageSettings } from '@/components/settings/LanguageSettings';

export default function Settings() {
  const { t } = useTranslation('settings');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>

        <Tabs defaultValue="company" className="space-y-4">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="company">{t('tabs.company')}</TabsTrigger>
            <TabsTrigger value="warehouses">{t('tabs.warehouses')}</TabsTrigger>
            <TabsTrigger value="database">{t('tabs.database')}</TabsTrigger>
            <TabsTrigger value="backup">{t('tabs.backup')}</TabsTrigger>
            <TabsTrigger value="api">{t('tabs.api')}</TabsTrigger>
            <TabsTrigger value="language">Language</TabsTrigger>
            <TabsTrigger value="security">{t('tabs.security')}</TabsTrigger>
            <TabsTrigger value="system">{t('tabs.system')}</TabsTrigger>
            <TabsTrigger value="legacy">{t('tabs.legacy')}</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <CompanySettings />
          </TabsContent>

          <TabsContent value="warehouses">
            <WarehouseSettings />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseSettings />
          </TabsContent>

          <TabsContent value="backup">
            <BackupSettings />
          </TabsContent>

          <TabsContent value="api">
            <ApiIntegrationSettings />
          </TabsContent>

          <TabsContent value="language">
            <LanguageSettings />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="system">
            <SystemSettings />
          </TabsContent>

          <TabsContent value="legacy" className="space-y-4">
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
                <TabsTrigger value="account">{t('tabs.account')}</TabsTrigger>
                <TabsTrigger value="notifications">{t('tabs.notifications')}</TabsTrigger>
                <TabsTrigger value="integrations">{t('tabs.integrations')}</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <GeneralSettings />
              </TabsContent>

              <TabsContent value="account">
                <AccountSettings />
              </TabsContent>

              <TabsContent value="notifications">
                <NotificationSettings />
              </TabsContent>

              <TabsContent value="integrations">
                <IntegrationSettings />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
