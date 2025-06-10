
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardHeader } from '@/components/DashboardHeader';
import { KPICards } from '@/components/KPICards';
import { ActivityChart } from '@/components/ActivityChart';
import { TaskList } from '@/components/TaskList';

export default function Dashboard() {
  const { t } = useTranslation('dashboard');

  return (
    <MainLayout>
      <div className="space-y-6">
        <DashboardHeader />
        <KPICards />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityChart />
          <TaskList />
        </div>
      </div>
    </MainLayout>
  );
}
