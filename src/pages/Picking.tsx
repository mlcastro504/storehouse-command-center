
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PickingDashboard } from '@/components/picking/PickingDashboard';

export default function Picking() {
  return (
    <MainLayout>
      <PickingDashboard />
    </MainLayout>
  );
}
