
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Database, ArrowRight } from 'lucide-react';

interface RelationshipCheck {
  from: string;
  to: string;
  relationship: string;
  status: 'valid' | 'invalid' | 'warning';
  message: string;
  sampleData?: any;
}

export function ModelRelationshipValidator() {
  const { t } = useTranslation(['common']);
  const [relationships, setRelationships] = useState<RelationshipCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const validateRelationships = async () => {
    setIsChecking(true);

    try {
      const { connectToDatabase } = await import('@/lib/mongodb');
      const db = await connectToDatabase();

      const checks: RelationshipCheck[] = [];

      // Product -> Category relationship
      try {
        const products = await db.collection('products').find({}).limit(5).toArray();
        const categories = await db.collection('categories').find({}).toArray();
        
        let validProductCategories = 0;
        let invalidProductCategories = 0;

        for (const product of products) {
          if (product.category_id) {
            const categoryExists = categories.some(cat => cat.id === product.category_id || cat._id?.toString() === product.category_id);
            if (categoryExists) {
              validProductCategories++;
            } else {
              invalidProductCategories++;
            }
          }
        }

        checks.push({
          from: 'Product',
          to: 'Category',
          relationship: 'belongs_to',
          status: invalidProductCategories === 0 ? 'valid' : 'warning',
          message: `${validProductCategories} valid references, ${invalidProductCategories} broken references`,
          sampleData: products.slice(0, 2)
        });
      } catch (error) {
        checks.push({
          from: 'Product',
          to: 'Category',
          relationship: 'belongs_to',
          status: 'invalid',
          message: 'Unable to validate relationship: ' + (error instanceof Error ? error.message : 'Unknown error')
        });
      }

      // StockLevel -> Product relationship
      try {
        const stockLevels = await db.collection('stock_levels').find({}).limit(5).toArray();
        const products = await db.collection('products').find({}).toArray();
        
        let validStockProducts = 0;
        let invalidStockProducts = 0;

        for (const stock of stockLevels) {
          if (stock.product_id) {
            const productExists = products.some(prod => prod.id === stock.product_id || prod._id?.toString() === stock.product_id);
            if (productExists) {
              validStockProducts++;
            } else {
              invalidStockProducts++;
            }
          }
        }

        checks.push({
          from: 'StockLevel',
          to: 'Product',
          relationship: 'belongs_to',
          status: invalidStockProducts === 0 ? 'valid' : 'warning',
          message: `${validStockProducts} valid references, ${invalidStockProducts} broken references`,
          sampleData: stockLevels.slice(0, 2)
        });
      } catch (error) {
        checks.push({
          from: 'StockLevel',
          to: 'Product',
          relationship: 'belongs_to',
          status: 'invalid',
          message: 'Unable to validate relationship: ' + (error instanceof Error ? error.message : 'Unknown error')
        });
      }

      // StockLevel -> Location relationship
      try {
        const stockLevels = await db.collection('stock_levels').find({}).limit(5).toArray();
        const locations = await db.collection('locations').find({}).toArray();
        
        let validStockLocations = 0;
        let invalidStockLocations = 0;

        for (const stock of stockLevels) {
          if (stock.location_id) {
            const locationExists = locations.some(loc => loc.id === stock.location_id || loc._id?.toString() === stock.location_id);
            if (locationExists) {
              validStockLocations++;
            } else {
              invalidStockLocations++;
            }
          }
        }

        checks.push({
          from: 'StockLevel',
          to: 'Location',
          relationship: 'belongs_to',
          status: invalidStockLocations === 0 ? 'valid' : 'warning',
          message: `${validStockLocations} valid references, ${invalidStockLocations} broken references`,
          sampleData: stockLevels.slice(0, 2)
        });
      } catch (error) {
        checks.push({
          from: 'StockLevel',
          to: 'Location',
          relationship: 'belongs_to',
          status: 'invalid',
          message: 'Unable to validate relationship: ' + (error instanceof Error ? error.message : 'Unknown error')
        });
      }

      // Location -> Warehouse relationship
      try {
        const locations = await db.collection('locations').find({}).limit(5).toArray();
        const warehouses = await db.collection('warehouses').find({}).toArray();
        
        let validLocationWarehouses = 0;
        let invalidLocationWarehouses = 0;

        for (const location of locations) {
          if (location.warehouse_id) {
            const warehouseExists = warehouses.some(wh => wh.id === location.warehouse_id || wh._id?.toString() === location.warehouse_id);
            if (warehouseExists) {
              validLocationWarehouses++;
            } else {
              invalidLocationWarehouses++;
            }
          }
        }

        checks.push({
          from: 'Location',
          to: 'Warehouse',
          relationship: 'belongs_to',
          status: invalidLocationWarehouses === 0 ? 'valid' : 'warning',
          message: `${validLocationWarehouses} valid references, ${invalidLocationWarehouses} broken references`,
          sampleData: locations.slice(0, 2)
        });
      } catch (error) {
        checks.push({
          from: 'Location',
          to: 'Warehouse',
          relationship: 'belongs_to',
          status: 'invalid',
          message: 'Unable to validate relationship: ' + (error instanceof Error ? error.message : 'Unknown error')
        });
      }

      setRelationships(checks);
    } catch (error) {
      console.error('Error validating relationships:', error);
      setRelationships([{
        from: 'System',
        to: 'Database',
        relationship: 'connection',
        status: 'invalid',
        message: 'Unable to connect to database for validation'
      }]);
    }

    setIsChecking(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      valid: 'default',
      invalid: 'destructive',
      warning: 'secondary'
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
          <Database className="w-5 h-5" />
          Model Relationship Validation
        </CardTitle>
        <CardDescription>
          Validate data integrity and relationships between models
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={validateRelationships} 
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? 'Validating Relationships...' : 'Validate Model Relationships'}
        </Button>

        {relationships.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Relationship Validation Results</h3>
            {relationships.map((rel, index) => (
              <div key={index} className="p-4 border rounded space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(rel.status)}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rel.from}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{rel.to}</span>
                      <Badge variant="outline" className="text-xs">
                        {rel.relationship}
                      </Badge>
                    </div>
                  </div>
                  {getStatusBadge(rel.status)}
                </div>
                
                <p className="text-sm text-muted-foreground">{rel.message}</p>
                
                {rel.sampleData && rel.sampleData.length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View sample data
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                      {JSON.stringify(rel.sampleData, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {relationships.length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded">
            <h4 className="font-semibold mb-2">Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {relationships.filter(r => r.status === 'valid').length}
                </p>
                <p className="text-sm text-muted-foreground">Valid</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {relationships.filter(r => r.status === 'warning').length}
                </p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {relationships.filter(r => r.status === 'invalid').length}
                </p>
                <p className="text-sm text-muted-foreground">Invalid</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
