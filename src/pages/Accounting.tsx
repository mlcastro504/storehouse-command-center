
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { AccountingDashboard } from '@/components/accounting/AccountingDashboard';

export default function Accounting() {
  const { t } = useTranslation('accounting');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>
        <AccountingDashboard />
      </div>
    </MainLayout>
  );
}
