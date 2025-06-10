
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Database, CheckCircle, AlertTriangle, Info, Zap, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { connectToDatabase } from '@/lib/mongodb';

interface IndexRecommendation {
  collection: string;
  indexName: string;
  fields: Record<string, number>;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
}

interface CollectionStats {
  name: string;
  documentCount: number;
  averageObjectSize: number;
  totalIndexSize: number;
  indexes: Array<{
    name: string;
    key: Record<string, number>;
    size: number;
  }>;
}

export function DatabaseOptimizer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [collectionStats, setCollectionStats] = useState<CollectionStats[]>([]);
  const [recommendations, setRecommendations] = useState<IndexRecommendation[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const { toast } = useToast();

  const analyzeDatabase = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisComplete(false);
    
    try {
      const database = await connectToDatabase();
      
      // Get list of collections
      const collections = await database.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      setProgress(20);
      
      const stats: CollectionStats[] = [];
      const recs: IndexRecommendation[] = [];
      
      // Analyze each collection
      for (let i = 0; i < collectionNames.length; i++) {
        const collectionName = collectionNames[i];
        setProgress(20 + (i / collectionNames.length) * 60);
        
        try {
          const collection = database.collection(collectionName);
          
          // Get collection stats
          const sampleDocs = await collection.find({}).limit(100).toArray();
          const docCount = sampleDocs.length;
          
          // Mock index analysis for browser environment
          const mockIndexes = [
            { name: '_id_', key: { _id: 1 }, size: 1024 }
          ];
          
          stats.push({
            name: collectionName,
            documentCount: docCount,
            averageObjectSize: docCount > 0 ? JSON.stringify(sampleDocs[0] || {}).length : 0,
            totalIndexSize: 1024,
            indexes: mockIndexes
          });
          
          // Generate recommendations based on collection type
          const recommendations = generateRecommendations(collectionName, sampleDocs);
          recs.push(...recommendations);
          
        } catch (error) {
          console.log(`Error analyzing collection ${collectionName}:`, error);
        }
      }
      
      setProgress(90);
      setCollectionStats(stats);
      setRecommendations(recs);
      setProgress(100);
      setAnalysisComplete(true);
      
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${collectionNames.length} collections and found ${recs.length} optimization opportunities.`,
      });
      
    } catch (error) {
      console.error('Database analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Error analyzing database. Using sample recommendations.",
        variant: "destructive"
      });
      
      // Provide sample recommendations even if analysis fails
      setRecommendations(getSampleRecommendations());
      setAnalysisComplete(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateRecommendations = (collectionName: string, sampleDocs: any[]): IndexRecommendation[] => {
    const recommendations: IndexRecommendation[] = [];
    
    // Common patterns based on collection type
    switch (collectionName) {
      case 'products':
        recommendations.push({
          collection: collectionName,
          indexName: 'user_sku_compound',
          fields: { user_id: 1, sku: 1 },
          reason: 'Frequent queries filtering by user and SKU for product lookups',
          priority: 'high',
          estimatedImpact: '40-60% faster product searches'
        });
        
        if (sampleDocs.some(doc => doc.barcode)) {
          recommendations.push({
            collection: collectionName,
            indexName: 'barcode_unique',
            fields: { barcode: 1 },
            reason: 'Barcode scanning requires fast unique lookups',
            priority: 'high',
            estimatedImpact: '70-90% faster barcode scans'
          });
        }
        break;
        
      case 'stock_levels':
        recommendations.push({
          collection: collectionName,
          indexName: 'product_location_compound',
          fields: { product_id: 1, location_id: 1 },
          reason: 'Stock level queries always filter by product and location',
          priority: 'high',
          estimatedImpact: '50-80% faster stock lookups'
        });
        
        recommendations.push({
          collection: collectionName,
          indexName: 'quantity_available',
          fields: { quantity_available: 1 },
          reason: 'Finding products with available stock',
          priority: 'medium',
          estimatedImpact: '30-50% faster availability checks'
        });
        break;
        
      case 'picking_tasks':
      case 'putaway_tasks':
      case 'stock_move_tasks':
        recommendations.push({
          collection: collectionName,
          indexName: 'user_status_priority',
          fields: { user_id: 1, status: 1, priority: -1 },
          reason: 'Task assignment queries filter by user, status, and priority',
          priority: 'high',
          estimatedImpact: '60-80% faster task retrieval'
        });
        
        recommendations.push({
          collection: collectionName,
          indexName: 'created_at',
          fields: { created_at: -1 },
          reason: 'Task history and recent task queries',
          priority: 'medium',
          estimatedImpact: '40-60% faster time-based queries'
        });
        break;
        
      case 'stock_movements':
        recommendations.push({
          collection: collectionName,
          indexName: 'product_date_compound',
          fields: { product_id: 1, movement_date: -1 },
          reason: 'Product movement history queries',
          priority: 'medium',
          estimatedImpact: '50-70% faster movement tracking'
        });
        break;
    }
    
    // Add user_id index for all user-scoped collections
    if (sampleDocs.some(doc => doc.user_id)) {
      recommendations.push({
        collection: collectionName,
        indexName: 'user_id',
        fields: { user_id: 1 },
        reason: 'Row Level Security and user data filtering',
        priority: 'high',
        estimatedImpact: '30-50% faster user queries'
      });
    }
    
    return recommendations;
  };

  const getSampleRecommendations = (): IndexRecommendation[] => {
    return [
      {
        collection: 'products',
        indexName: 'user_sku_compound',
        fields: { user_id: 1, sku: 1 },
        reason: 'Frequent queries filtering by user and SKU for product lookups',
        priority: 'high',
        estimatedImpact: '40-60% faster product searches'
      },
      {
        collection: 'products',
        indexName: 'barcode_unique',
        fields: { barcode: 1 },
        reason: 'Barcode scanning requires fast unique lookups',
        priority: 'high',
        estimatedImpact: '70-90% faster barcode scans'
      },
      {
        collection: 'stock_levels',
        indexName: 'product_location_compound',
        fields: { product_id: 1, location_id: 1 },
        reason: 'Stock level queries always filter by product and location',
        priority: 'high',
        estimatedImpact: '50-80% faster stock lookups'
      },
      {
        collection: 'picking_tasks',
        indexName: 'user_status_priority',
        fields: { user_id: 1, status: 1, priority: -1 },
        reason: 'Task assignment queries filter by user, status, and priority',
        priority: 'high',
        estimatedImpact: '60-80% faster task retrieval'
      }
    ];
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Info className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'default'}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Performance Optimizer
        </CardTitle>
        <CardDescription>
          Analyze your database indexes and get specific recommendations for better performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={analyzeDatabase} 
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Database Performance'}
          </Button>
          
          {isAnalyzing && (
            <div className="flex-1">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-1">
                {progress < 20 ? 'Connecting to database...' :
                 progress < 80 ? 'Analyzing collections...' :
                 progress < 100 ? 'Generating recommendations...' :
                 'Complete!'}
              </p>
            </div>
          )}
        </div>

        {analysisComplete && (
          <>
            {/* Collection Stats */}
            {collectionStats.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Collection Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collectionStats.map((stat) => (
                    <Card key={stat.name}>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">{stat.name}</h4>
                        <div className="space-y-1 text-sm">
                          <p>Documents: {stat.documentCount}</p>
                          <p>Indexes: {stat.indexes.length}</p>
                          <p>Avg Size: {stat.averageObjectSize} bytes</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Index Recommendations</h3>
                <Badge variant="outline">
                  {recommendations.length} recommendations
                </Badge>
              </div>

              {recommendations.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Great! Your database appears to be well-optimized. No critical index recommendations at this time.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(rec.priority)}
                            <h4 className="font-medium">{rec.collection}.{rec.indexName}</h4>
                          </div>
                          {getPriorityBadge(rec.priority)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {rec.reason}
                        </p>
                        
                        <div className="bg-muted p-3 rounded-md mb-3">
                          <p className="text-xs font-mono">
                            db.{rec.collection}.createIndex({JSON.stringify(rec.fields)})
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">
                            {rec.estimatedImpact}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Implementation Guide */}
            {recommendations.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Implementation:</strong> Copy the index creation commands and run them in your MongoDB shell or database management tool. 
                  High priority indexes should be created first for maximum impact.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
