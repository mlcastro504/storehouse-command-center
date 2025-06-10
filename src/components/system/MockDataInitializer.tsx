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
      'users', 'products', 'suppliers', 'pallets', 'locations', 
      'putaway_tasks', 'picking_tasks', 'stock_move_tasks', 
      'customers', 'ecommerce_orders', 'chat_messages'
    ];
    
    const stats: any = {};
    let totalRecords = 0;
    
    collections.forEach(collection => {
      const data = BrowserStorage.get(collection) || [];
      stats[collection] = data.length;
      totalRecords += data.length;
    });
    
    return { stats, totalRecords, hasData: totalRecords > 0 };
  };

  const generateMockData = async () => {
    setIsGenerating(true);
    setProgress(0);
    setIsComplete(false);
    
    try {
      // Simulate progress
      const progressSteps = [
        { step: 10, message: 'Clearing existing data...' },
        { step: 20, message: 'Generating users and roles...' },
        { step: 30, message: 'Creating suppliers and products...' },
        { step: 40, message: 'Setting up warehouses and locations...' },
        { step: 50, message: 'Generating pallets and stock levels...' },
        { step: 60, message: 'Creating operational tasks...' },
        { step: 70, message: 'Generating customer orders...' },
        { step: 80, message: 'Setting up chat and communication...' },
        { step: 90, message: 'Creating accounting data...' },
        { step: 100, message: 'Finalizing configuration...' }
      ];
      
      for (const { step, message } of progressSteps) {
        setProgress(step);
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Generate the actual data
      const generatedData = await MockDataGenerator.generateAllMockData();
      
      setDataStats(generatedData);
      setIsComplete(true);
      
      toast({
        title: "Mock Data Generated Successfully!",
        description: `Generated complete dataset with ${Object.values(generatedData).flat().length} total records`,
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
    const collections = [
      'users', 'products', 'suppliers', 'categories', 'warehouses', 'locations',
      'stock_levels', 'pallets', 'putaway_tasks', 'stock_move_tasks',
      'customers', 'ecommerce_orders', 'picking_tasks', 'scan_devices',
      'scan_sessions', 'chat_channels', 'chat_messages', 'accounts',
      'contacts', 'invoices', 'journal_entries', 'company_config'
    ];
    
    collections.forEach(collection => {
      BrowserStorage.set(collection, []);
    });
    
    setDataStats(null);
    setIsComplete(false);
    
    toast({
      title: "Data Cleared",
      description: "All mock data has been removed from localStorage",
    });
  };

  const existingDataCheck = checkExistingData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          WarehouseOS Mock Data Generator
        </CardTitle>
        <CardDescription>
          Generate realistic mock data to test all WarehouseOS modules and features
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
                <strong>Mock data detected:</strong> {existingDataCheck.totalRecords} records found in localStorage
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>No mock data found.</strong> Generate comprehensive test data to start using WarehouseOS features.
              </AlertDescription>
            </Alert>
          )}
          
          {existingDataCheck.hasData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(existingDataCheck.stats).map(([collection, count]) => (
                <div key={collection} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm capitalize">{collection.replace('_', ' ')}</span>
                  <Badge variant="outline">{count as number}</Badge>
                </div>
              ))}
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
              {isGenerating ? 'Generating...' : 'Generate Complete Mock Data'}
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
                {progress < 20 ? 'Preparing data structures...' :
                 progress < 40 ? 'Creating core entities...' :
                 progress < 60 ? 'Generating inventory data...' :
                 progress < 80 ? 'Setting up operational tasks...' :
                 progress < 100 ? 'Finalizing relationships...' :
                 'Complete!'}
              </p>
            </div>
          )}
        </div>

        {isComplete && dataStats && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-green-600">
              ✅ Mock Data Generated Successfully!
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
                    {(dataStats.putAwayTasks?.length || 0) + (dataStats.pickingTasks?.length || 0) + (dataStats.stockMoveTasks?.length || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{dataStats.ecommerceOrders?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">E-commerce Orders</p>
                </CardContent>
              </Card>
            </div>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Ready to test!</strong> All WarehouseOS modules now have realistic data. 
                You can start testing Put Away, Picking, Stock Move, E-commerce, Chat, and Accounting features.
                <br /><br />
                <strong>Login credentials:</strong> Use any of the generated user emails with password "password123"
                <br />
                • admin@warehouseos.com (Administrator)
                • teamleader@warehouseos.com (Team Leader)  
                • putaway@warehouseos.com (Put Away Operator)
                • picker@warehouseos.com (Picker)
                • accountant@warehouseos.com (Accountant)
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Features Coverage */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Mock Data Includes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Core Operations</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 5 Users with different roles and permissions</li>
                <li>• 10 Products with full specifications and barcodes</li>
                <li>• 3 Suppliers with contact information</li>
                <li>• 2 Warehouses with structured locations</li>
                <li>• 6 Pallets in various states (received, assigned, completed)</li>
                <li>• Stock levels distributed across storage and picking areas</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Workflow Tasks</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Put Away tasks (pending, assigned, in progress)</li>
                <li>• Picking tasks from e-commerce orders</li>
                <li>• Stock Move tasks for replenishment</li>
                <li>• E-commerce orders from Shopify/WooCommerce</li>
                <li>• Customer database with order history</li>
                <li>• Scanner devices and active sessions</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Communication & Accounting</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 4 Chat channels with team conversations</li>
                <li>• Recent messages between team members</li>
                <li>• Chart of accounts for financial tracking</li>
                <li>• Customer and supplier contacts</li>
                <li>• Sample invoices (paid and pending)</li>
                <li>• Journal entries for accounting workflow</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">System Configuration</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Company profile: "WarehouseOS Demo Ltd"</li>
                <li>• Multi-language support (English/Spanish)</li>
                <li>• UK-based warehouse setup</li>
                <li>• Device management configuration</li>
                <li>• Backup and notification settings</li>
                <li>• Complete role-based access control</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
