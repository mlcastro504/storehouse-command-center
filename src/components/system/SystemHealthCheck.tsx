
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertTriangle, Loader2, Database, Globe, Users, Package } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface HealthCheckResult {
  component: string;
  status: 'success' | 'error' | 'warning' | 'checking';
  message: string;
  details?: string;
}

export function SystemHealthCheck() {
  const { t } = useTranslation(['common', 'settings']);
  const { toast } = useToast();
  const [checks, setChecks] = useState<HealthCheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const healthChecks = [
    {
      name: 'Database Connection',
      icon: Database,
      check: async () => {
        try {
          // Test MongoDB connection through our browser storage mock
          const { connectToDatabase } = await import('@/lib/mongodb');
          const db = await connectToDatabase();
          const stats = await db.stats();
          return {
            status: 'success' as const,
            message: 'MongoDB connection successful',
            details: `Collections: ${stats.collections}, Storage: ${(stats.storageSize / 1024).toFixed(2)}KB`
          };
        } catch (error) {
          return {
            status: 'error' as const,
            message: 'Database connection failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    },
    {
      name: 'Internationalization',
      icon: Globe,
      check: async () => {
        try {
          const { default: i18n } = await import('@/lib/i18n');
          const currentLang = i18n.language;
          const resources = i18n.options.resources;
          
          if (!resources || !resources.en || !resources.es) {
            throw new Error('Missing language resources');
          }
          
          return {
            status: 'success' as const,
            message: 'i18n system operational',
            details: `Current: ${currentLang}, Available: ${Object.keys(resources).join(', ')}`
          };
        } catch (error) {
          return {
            status: 'error' as const,
            message: 'i18n system failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    },
    {
      name: 'Authentication System',
      icon: Users,
      check: async () => {
        try {
          // Check if localStorage has user data and auth functions work
          const savedUser = localStorage.getItem('warehouseOS_user');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            return {
              status: 'success' as const,
              message: 'Authentication system active',
              details: `User: ${user.firstName} ${user.lastName}, Role: ${user.role?.name || 'Unknown'}`
            };
          } else {
            return {
              status: 'warning' as const,
              message: 'No active user session',
              details: 'System ready for login'
            };
          }
        } catch (error) {
          return {
            status: 'error' as const,
            message: 'Authentication system error',
            details: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    },
    {
      name: 'Inventory Models',
      icon: Package,
      check: async () => {
        try {
          const { connectToDatabase } = await import('@/lib/mongodb');
          const db = await connectToDatabase();
          
          // Test core collections
          const collections = ['products', 'categories', 'warehouses', 'locations', 'stock_levels'];
          const results = await Promise.all(
            collections.map(async (collection) => {
              try {
                const result = await db.collection(collection).find({}).limit(1).toArray();
                return { collection, status: 'ok', count: result.length };
              } catch (error) {
                return { collection, status: 'error', error: error instanceof Error ? error.message : 'Unknown' };
              }
            })
          );
          
          const errors = results.filter(r => r.status === 'error');
          if (errors.length > 0) {
            return {
              status: 'warning' as const,
              message: 'Some inventory collections have issues',
              details: errors.map(e => `${e.collection}: ${e.error}`).join(', ')
            };
          }
          
          return {
            status: 'success' as const,
            message: 'Inventory models operational',
            details: `Collections available: ${collections.join(', ')}`
          };
        } catch (error) {
          return {
            status: 'error' as const,
            message: 'Inventory models check failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    }
  ];

  const runHealthChecks = async () => {
    setIsRunning(true);
    setChecks([]);
    setProgress(0);

    for (let i = 0; i < healthChecks.length; i++) {
      const healthCheck = healthChecks[i];
      
      // Update progress
      setProgress((i / healthChecks.length) * 100);
      
      // Set checking status
      setChecks(prev => [...prev, {
        component: healthCheck.name,
        status: 'checking',
        message: 'Running check...'
      }]);

      try {
        const result = await healthCheck.check();
        
        // Update with result
        setChecks(prev => prev.map(check => 
          check.component === healthCheck.name 
            ? { ...check, ...result }
            : check
        ));
      } catch (error) {
        setChecks(prev => prev.map(check => 
          check.component === healthCheck.name 
            ? {
                ...check,
                status: 'error' as const,
                message: 'Check failed',
                details: error instanceof Error ? error.message : 'Unknown error'
              }
            : check
        ));
      }

      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setProgress(100);
    setIsRunning(false);

    // Show summary toast
    const errorCount = checks.filter(c => c.status === 'error').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;
    
    if (errorCount === 0 && warningCount === 0) {
      toast({
        title: "System Health Check Complete",
        description: "All systems operational",
      });
    } else {
      toast({
        title: "System Health Check Complete",
        description: `${errorCount} errors, ${warningCount} warnings found`,
        variant: errorCount > 0 ? "destructive" : "default"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'checking':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      checking: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          System Health Check
        </CardTitle>
        <CardDescription>
          Comprehensive validation of WarehouseOS components and functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={runHealthChecks} 
            disabled={isRunning}
            className="min-w-[140px]"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              'Run Health Check'
            )}
          </Button>
          
          {isRunning && (
            <div className="flex-1">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-1">
                Progress: {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>

        {checks.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Health Check Results</h3>
            {checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <p className="font-medium">{check.component}</p>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                    {check.details && (
                      <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(check.status)}
              </div>
            ))}
          </div>
        )}

        {!isRunning && checks.length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded">
            <h4 className="font-semibold mb-2">Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {checks.filter(c => c.status === 'success').length}
                </p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {checks.filter(c => c.status === 'warning').length}
                </p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {checks.filter(c => c.status === 'error').length}
                </p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
