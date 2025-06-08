
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { EcommerceDashboard } from '@/components/ecommerce/EcommerceDashboard';

export default function Ecommerce() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">E-commerce</h1>
          <p className="text-gray-600">Integración con plataformas de comercio electrónico</p>
        </div>
        <EcommerceDashboard />
      </div>
    </MainLayout>
  );
}
