
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StockMoveDashboard } from '@/components/stockmove/StockMoveDashboard';

const StockMove = () => {
  return (
    <MainLayout>
      <StockMoveDashboard />
    </MainLayout>
  );
};

export default StockMove;
