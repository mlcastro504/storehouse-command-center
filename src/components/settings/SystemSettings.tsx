
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SystemHealthCheck } from '@/components/system/SystemHealthCheck';
import { DeploymentValidator } from '@/components/system/DeploymentValidator';
import { ModelRelationshipValidator } from '@/components/system/ModelRelationshipValidator';

export function SystemSettings() {
  const { t } = useTranslation(['settings', 'common']);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Validation & Health</h2>
        <p className="text-muted-foreground">
          Comprehensive system validation, health checks, and deployment readiness assessment
        </p>
      </div>

      <SystemHealthCheck />
      <ModelRelationshipValidator />
      <DeploymentValidator />
    </div>
  );
}
