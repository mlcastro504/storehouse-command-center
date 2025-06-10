
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseOptimizer } from '../system/DatabaseOptimizer';
import { SystemHealthCheck } from '../system/SystemHealthCheck';
import { DeploymentValidator } from '../system/DeploymentValidator';
import { ModelRelationshipValidator } from '../system/ModelRelationshipValidator';
import { MockDataInitializer } from '../system/MockDataInitializer';

export function SystemSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Administration</h2>
        <p className="text-muted-foreground">
          Advanced system tools for database optimization, health monitoring, and development support.
        </p>
      </div>

      <Tabs defaultValue="mock-data" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="mock-data">Mock Data</TabsTrigger>
          <TabsTrigger value="health">Health Check</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="models">Data Models</TabsTrigger>
        </TabsList>

        <TabsContent value="mock-data" className="space-y-6">
          <MockDataInitializer />
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <SystemHealthCheck />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseOptimizer />
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <DeploymentValidator />
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <ModelRelationshipValidator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
