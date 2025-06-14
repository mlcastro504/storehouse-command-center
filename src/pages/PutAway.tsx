
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingPalletsList } from '@/components/putaway/PendingPalletsList';
import { ActiveTasksList } from '@/components/putaway/ActiveTasksList';
import { TaskHistoryList } from '@/components/putaway/TaskHistoryList';
import { PutAwayMetricsDashboard } from '@/components/putaway/PutAwayMetricsDashboard';
import { PutAwayRulesList } from '@/components/putaway/PutAwayRulesList';
import { PutAwayTasksList } from '@/components/putaway/PutAwayTasksList';
import { CreatePutAwayTaskDialog } from '@/components/putaway/CreatePutAwayTaskDialog';
import { Package, Clock, History, BarChart3, Settings, List } from 'lucide-react';

export default function PutAway() {
  const { t } = useTranslation('putaway');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
        </div>

        {/* Dashboard de métricas */}
        <PutAwayMetricsDashboard />

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('tabs.pending')}
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('tabs.active')}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              {t('tabs.history')}
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              {t('tabs.allTasks')}
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('tabs.metrics')}
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t('tabs.rules')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('pending.title')}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('pending.description')}
                </p>
              </CardHeader>
              <CardContent>
                <PendingPalletsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('active.title')}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('active.description')}
                </p>
              </CardHeader>
              <CardContent>
                <ActiveTasksList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('history.title')}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('history.description')}
                </p>
              </CardHeader>
              <CardContent>
                <TaskHistoryList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('allTasks.title')}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t('allTasks.description')}
                  </p>
                </div>
                <CreatePutAwayTaskDialog />
              </CardHeader>
              <CardContent>
                <PutAwayTasksList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('metrics.title')}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('metrics.description')}
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  {t('metrics.wip')}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('rules.title')}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('rules.description')}
                </p>
              </CardHeader>
              <CardContent>
                <PutAwayRulesList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
