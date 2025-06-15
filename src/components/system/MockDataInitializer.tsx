import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Database, Play, CheckCircle, AlertTriangle, Trash2, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { MockDataGenerator } from '@/lib/mockDataGenerator';
import { connectToDatabase } from '@/lib/mongodb';

export function MockDataInitializer() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [dataStats, setDataStats] = useState<any>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const { toast } = useToast();

  const checkExistingData = async () => {
    const dataExists = await MockDataGenerator.hasExistingData();
    setHasData(dataExists);
    if (dataExists) {
      const db = await connectToDatabase('mongodb://localhost/mockdb', 'mockdb');
      const collectionsToCount = [
        'products', 'pallets', 'users', 'locations', 'putaway_tasks', 
        'stock_levels', 'ecommerce_orders', 'invoices', 'suppliers'
      ];
      let total = 0;
      for (const name of collectionsToCount) {
        try {
          const items = await db.collection(name).find({}).toArray();
          total += items.length;
        } catch (e) {
            console.warn(`Could not count collection ${name}`, e);
        }
      }
      setTotalRecords(total);
    } else {
      setTotalRecords(0);
    }
  };

  useEffect(() => {
    checkExistingData();
  }, [isComplete, isClearing]);

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
      const success = await MockDataGenerator.generateAllMockData();
      
      if (success) {
        setDataStats({ generated: true });
        setIsComplete(true);
        
        toast({
          title: "Complete Mock Dataset Generated!",
          description: "Successfully generated comprehensive data across all MongoDB collections",
        });
      }
      
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

  const clearAllData = async () => {
    setIsClearing(true);
    try {
      const cleared = await MockDataGenerator.clearAllData();
      
      if (cleared) {
        setDataStats(null);
        setIsComplete(false);
        setHasData(false);
        setTotalRecords(0);
        
        toast({
          title: "All Mock Data Cleared",
          description: "Removed all collections and data from BrowserStorage",
        });
        
        // Force refresh the page to ensure all components reload with empty data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Clear Error",
        description: "Failed to clear all data. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

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
          
          {hasData ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Mock data active:</strong> {totalRecords} total records found across the system.
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
        </div>

        {/* Generation Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={generateMockData} 
              disabled={isGenerating || isClearing}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isGenerating ? 'Generating Complete Dataset...' : 'Generate All Mock Data'}
            </Button>
            
            <Button 
              onClick={clearAllData} 
              variant="destructive"
              disabled={isGenerating || isClearing}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isClearing ? 'Clearing All Data...' : 'Clear All Mock Data'}
            </Button>
            
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              disabled={isGenerating || isClearing}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Refresh App
            </Button>
          </div>
          
          {(isGenerating || isClearing) && (
            <div className="space-y-2">
              <Progress value={isClearing ? 100 : progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {isClearing ? 'Clearing all mock data...' :
                 progress < 10 ? 'Preparing data structures...' :
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
