
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Database, Play, CheckCircle, AlertTriangle, Trash2, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { MockDataGenerator } from '@/lib/mockDataGenerator';
import { BrowserStorage } from '@/lib/browserStorage';

export function MockDataInitializer() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [dataStats, setDataStats] = useState<any>(null);
  const { toast } = useToast();

  const checkExistingData = () => {
    const collections = [
      // Core entities
      'roles', 'users', 'products', 'suppliers', 'categories', 'warehouses', 'locations', 
      'pallets', 'stock_levels',
      
      // Operational tasks
      'putaway_tasks', 'picking_tasks', 'stock_move_tasks', 
      
      // Customer and business
      'customers', 'ecommerce_orders', 'ecommerce_connections',
      
      // Communication and devices
      'chat_channels', 'chat_messages', 'scan_devices', 'scan_sessions',
      
      // Accounting
      'accounts', 'contacts', 'invoices', 'journal_entries', 'payments',
      
      // Shipping and loading
      'loading_docks', 'shipments', 'loading_appointments',
      
      // Additional systems
      'stock_movements', 'sync_logs', 'audit_logs'
    ];
    
    const stats: any = {};
    let totalRecords = 0;
    
    collections.forEach(collection => {
      const data = BrowserStorage.get(collection) || [];
      const count = Array.isArray(data) ? data.length : 0;
      stats[collection] = count;
      totalRecords += count;
    });
    
    return { stats, totalRecords, hasData: totalRecords > 0 };
  };

  const generateMockData = async () => {
    setIsGenerating(true);
    setProgress(0);
    setIsComplete(false);
    
    try {
      // Simulate realistic progress steps
      const progressSteps = [
        { step: 5, message: 'Clearing existing data...' },
        { step: 15, message: 'Generating user roles and permissions...' },
        { step: 25, message: 'Creating users and authentication data...' },
        { step: 35, message: 'Setting up suppliers and product catalog...' },
        { step: 45, message: 'Configuring warehouses and locations...' },
        { step: 55, message: 'Generating inventory and stock levels...' },
        { step: 65, message: 'Creating operational tasks and workflows...' },
        { step: 75, message: 'Setting up customer orders and e-commerce...' },
        { step: 85, message: 'Generating accounting and financial data...' },
        { step: 95, message: 'Configuring communication and device systems...' },
        { step: 100, message: 'Finalizing data relationships and indexing...' }
      ];
      
      for (const { step, message } of progressSteps) {
        setProgress(step);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Generate the actual comprehensive data
      const generatedData = await MockDataGenerator.generateAllMockData();
      
      setDataStats(generatedData);
      setIsComplete(true);
      
      // Calculate total records
      const totalRecords = Object.values(generatedData).reduce((total, collection) => {
        return total + (Array.isArray(collection) ? collection.length : 0);
      }, 0);
      
      toast({
        title: "Complete Mock Dataset Generated!",
        description: `Successfully generated ${totalRecords} records across ${Object.keys(generatedData).length} collections`,
      });
      
    } catch (error) {
      console.error('Error generating mock data:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate mock data. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAllData = () => {
    try {
      const clearedCount = MockDataGenerator.clearAllData();
      
      setDataStats(null);
      setIsComplete(false);
      
      toast({
        title: "All Data Cleared",
        description: `Removed ${clearedCount} collections and all related data from localStorage`,
      });
      
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Clear Error",
        description: "Failed to clear all data. Check console for details.",
        variant: "destructive"
      });
    }
  };

  const existingDataCheck = checkExistingData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          WarehouseOS Complete Mock Data System
        </CardTitle>
        <CardDescription>
          Generate comprehensive, interconnected mock data for all WarehouseOS modules and test every feature
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Data Status */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Current Data Status</h3>
          
          {existingDataCheck.hasData ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Mock data active:</strong> {existingDataCheck.totalRecords} total records found across all collections
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>No mock data detected.</strong> Generate complete test dataset to unlock all WarehouseOS functionality.
              </AlertDescription>
            </Alert>
          )}
          
          {existingDataCheck.hasData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(existingDataCheck.stats)
                .filter(([, count]) => (count as number) > 0)
                .slice(0, 12)
                .map(([collection, count]) => (
                <div key={collection} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm capitalize">{collection.replace(/_/g, ' ')}</span>
                  <Badge variant="outline">{count as number}</Badge>
                </div>
              ))}
              {Object.keys(existingDataCheck.stats).filter(key => (existingDataCheck.stats[key] as number) > 0).length > 12 && (
                <div className="flex items-center justify-center p-2 bg-muted rounded text-sm text-muted-foreground">
                  +{Object.keys(existingDataCheck.stats).filter(key => (existingDataCheck.stats[key] as number) > 0).length - 12} more...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Generation Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={generateMockData} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isGenerating ? 'Generating Complete Dataset...' : 'Generate All Mock Data'}
            </Button>
            
            {existingDataCheck.hasData && (
              <>
                <Button 
                  onClick={clearAllData} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </Button>
                
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refresh App
                </Button>
              </>
            )}
          </div>
          
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {progress < 10 ? 'Preparing data structures...' :
                 progress < 30 ? 'Setting up core entities...' :
                 progress < 50 ? 'Creating inventory and warehouse data...' :
                 progress < 70 ? 'Generating operational workflows...' :
                 progress < 90 ? 'Building business and financial records...' :
                 progress < 100 ? 'Finalizing system integration...' :
                 'Complete!'}
              </p>
            </div>
          )}
        </div>

        {isComplete && dataStats && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-green-600">
              ✅ Complete Mock Dataset Generated Successfully!
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{dataStats.users?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Users & Roles</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{dataStats.products?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Products</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{dataStats.pallets?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Pallets</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{dataStats.locations?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Locations</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {(dataStats.putaway_tasks?.length || 0) + (dataStats.picking_tasks?.length || 0) + (dataStats.stock_move_tasks?.length || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{dataStats.ecommerce_orders?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">E-commerce Orders</p>
                </CardContent>
              </Card>
            </div>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>System Ready for Full Testing!</strong> All WarehouseOS modules now have comprehensive, interconnected data.
                <br /><br />
                <strong>Test Login Credentials:</strong>
                <br />
                • admin@warehouseos.com (Administrator - Full Access)
                <br />
                • teamleader@warehouseos.com (Team Leader - Operations Management)  
                <br />
                • putaway@warehouseos.com (Put Away Operator - Receiving & Storage)
                <br />
                • picker@warehouseos.com (Picker - Order Fulfillment)
                <br />
                • accountant@warehouseos.com (Accountant - Financial Management)
                <br /><br />
                <strong>Password for all users:</strong> password123
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Complete Features Coverage */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Complete System Coverage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Core Operations & Inventory</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 5 Users with role-based permissions</li>
                <li>• 10 Products with complete specifications</li>
                <li>• 3 Suppliers with contact details</li>
                <li>• 2 Warehouses with location hierarchy</li>
                <li>• 36+ Storage locations (aisles, racks, shelves)</li>
                <li>• 6 Pallets in various operational states</li>
                <li>• Stock levels across storage and picking areas</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Operational Workflows</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Put Away tasks (pending, active, completed)</li>
                <li>• Picking tasks from real e-commerce orders</li>
                <li>• Stock Move tasks for replenishment</li>
                <li>• 3 E-commerce orders from multiple channels</li>
                <li>• Customer database with order history</li>
                <li>• Scanner devices and active sessions</li>
                <li>• Loading docks and shipment tracking</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Business & Financial Systems</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Complete chart of accounts</li>
                <li>• Customer and supplier contacts</li>
                <li>• Invoices (paid and pending)</li>
                <li>• Journal entries and payments</li>
                <li>• E-commerce platform connections</li>
                <li>• Sync logs and audit trails</li>
                <li>• Financial reporting data</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Communication & Administration</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 4 Chat channels with team conversations</li>
                <li>• Real-time message history</li>
                <li>• User session management</li>
                <li>• Notification preferences</li>
                <li>• System configuration settings</li>
                <li>• Company profile and branding</li>
                <li>• Multi-language support (EN/ES)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
