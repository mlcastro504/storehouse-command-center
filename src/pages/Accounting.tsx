
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AccountingDashboard } from '@/components/accounting/AccountingDashboard';

export default function Accounting() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Contabilidad</h1>
          <p className="text-gray-600">Gestiona cuentas, transacciones e informes financieros</p>
        </div>
        <AccountingDashboard />
      </div>
    </MainLayout>
  );
}
