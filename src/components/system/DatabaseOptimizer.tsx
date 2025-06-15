
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Database, CheckCircle, AlertTriangle, Info, Zap, Clock, Copy, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { connectToDatabase } from '@/lib/mongodb';

interface IndexRecommendation {
  collection: string;
  indexName: string;
  fields: Record<string, number>;
  reason: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedImpact: string;
  implementationCommand: string;
  currentlyMissing: boolean;
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
  missingIndexes: number;
  performanceScore: number;
}

interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  component: string;
  message: string;
  details?: any;
}

export function DatabaseOptimizer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [collectionStats, setCollectionStats] = useState<CollectionStats[]>([]);
  const [recommendations, setRecommendations] = useState<IndexRecommendation[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [implementationScript, setImplementationScript] = useState('');
  const { toast } = useToast();

  const logError = (level: 'error' | 'warning' | 'info', component: string, message: string, details?: any) => {
    const logEntry: ErrorLog = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      details
    };
    
    setErrorLogs(prev => [logEntry, ...prev].slice(0, 100)); // Keep last 100 logs
    console.log(`[${level.toUpperCase()}] ${component}: ${message}`, details);
  };

  const analyzeDatabase = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisComplete(false);
    setErrorLogs([]);
    
    logError('info', 'DatabaseOptimizer', 'Starting comprehensive database analysis');
    
    try {
      const database = await connectToDatabase();
      logError('info', 'DatabaseOptimizer', 'Successfully connected to MongoDB');
      
      // Get list of collections - use our mock MongoDB service pattern
      const collections = await database.listCollections();
      const collectionNames = collections.map(c => c.name);
      
      logError('info', 'DatabaseOptimizer', `Found ${collectionNames.length} collections to analyze`);
      setProgress(20);
      
      const stats: CollectionStats[] = [];
      const recs: IndexRecommendation[] = [];
      
      // Core WarehouseOS collections with their expected indexes
      const expectedIndexes = {
        'products': [
          { fields: { user_id: 1 }, name: 'user_id_1', priority: 'critical' as const },
          { fields: { user_id: 1, sku: 1 }, name: 'user_sku_compound', priority: 'critical' as const },
          { fields: { barcode: 1 }, name: 'barcode_unique', priority: 'high' as const },
          { fields: { status: 1 }, name: 'status_1', priority: 'medium' as const },
          { fields: { category_id: 1 }, name: 'category_id_1', priority: 'medium' as const }
        ],
        'stock_levels': [
          { fields: { user_id: 1 }, name: 'user_id_1', priority: 'critical' as const },
          { fields: { product_id: 1, location_id: 1 }, name: 'product_location_compound', priority: 'critical' as const },
          { fields: { quantity_available: 1 }, name: 'quantity_available_1', priority: 'high' as const },
          { fields: { user_id: 1, quantity_available: 1 }, name: 'user_quantity_compound', priority: 'high' as const }
        ],
        'picking_tasks': [
          { fields: { user_id: 1 }, name: 'user_id_1', priority: 'critical' as const },
          { fields: { user_id: 1, status: 1, priority: -1 }, name: 'user_status_priority_compound', priority: 'critical' as const },
          { fields: { created_at: -1 }, name: 'created_at_desc', priority: 'medium' as const },
          { fields: { assigned_to: 1, status: 1 }, name: 'assigned_status_compound', priority: 'high' as const }
        ],
        'putaway_tasks': [
          { fields: { user_id: 1 }, name: 'user_id_1', priority: 'critical' as const },
          { fields: { user_id: 1, status: 1, priority: -1 }, name: 'user_status_priority_compound', priority: 'critical' as const },
          { fields: { created_at: -1 }, name: 'created_at_desc', priority: 'medium' as const }
        ],
        'stock_move_tasks': [
          { fields: { user_id: 1 }, name: 'user_id_1', priority: 'critical' as const },
          { fields: { user_id: 1, status: 1 }, name: 'user_status_compound', priority: 'critical' as const },
          { fields: { from_location_id: 1 }, name: 'from_location_1', priority: 'medium' as const },
          { fields: { to_location_id: 1 }, name: 'to_location_1', priority: 'medium' as const }
        ],
        'stock_movements': [
          { fields: { user_id: 1 }, name: 'user_id_1', priority: 'critical' as const },
          { fields: { product_id: 1, movement_date: -1 }, name: 'product_date_compound', priority: 'high' as const },
          { fields: { movement_type: 1 }, name: 'movement_type_1', priority: 'medium' as const }
        ],
        'locations': [
          { fields: { user_id: 1 }, name: 'user_id_1', priority: 'critical' as const },
          { fields: { warehouse_id: 1 }, name: 'warehouse_id_1', priority: 'high' as const },
          { fields: { barcode: 1 }, name: 'barcode_unique', priority: 'high' as const }
        ],
        'warehouses': [
          { fields: { user_id: 1 }, name: 'user_id_1', priority: 'critical' as const }
        ],
        'categories': [
          { fields: { user_id: 1 }, name: 'user_id_1', priority: 'critical' as const }
        ]
      };
      
      // Analyze each collection
      for (let i = 0; i < collectionNames.length; i++) {
        const collectionName = collectionNames[i];
        setProgress(20 + (i / collectionNames.length) * 60);
        
        try {
          const collection = database.collection(collectionName);
          
          logError('info', 'DatabaseOptimizer', `Analyzing collection: ${collectionName}`);
          
          // Get collection stats
          const sampleDocs = await collection.find({}).limit(100).toArray();
          const docCount = sampleDocs.length;
          
          // Get existing indexes - use our mock MongoDB service pattern
          const existingIndexesResult = await collection.listIndexes();
          const existingIndexes: any[] = Array.isArray(existingIndexesResult)
            ? existingIndexesResult
            : await (existingIndexesResult as { toArray: () => Promise<any[]> }).toArray();
          
          // Calculate missing indexes
          const expected = expectedIndexes[collectionName as keyof typeof expectedIndexes] || [];
          let missingCount = 0;
          let performanceScore = 100;
          
          expected.forEach(expectedIndex => {
            const exists = existingIndexes.some(existing => 
              JSON.stringify(existing.key) === JSON.stringify(expectedIndex.fields)
            );
            
            if (!exists) {
              missingCount++;
              const impact = expectedIndex.priority === 'critical' ? 40 : 
                           expectedIndex.priority === 'high' ? 20 : 10;
              performanceScore -= impact;
              
              recs.push({
                collection: collectionName,
                indexName: expectedIndex.name,
                fields: expectedIndex.fields,
                reason: getIndexReason(collectionName, expectedIndex.name),
                priority: expectedIndex.priority,
                estimatedImpact: getEstimatedImpact(expectedIndex.priority),
                implementationCommand: `db.${collectionName}.createIndex(${JSON.stringify(expectedIndex.fields)})`,
                currentlyMissing: true
              });
            }
          });
          
          stats.push({
            name: collectionName,
            documentCount: docCount,
            averageObjectSize: docCount > 0 ? JSON.stringify(sampleDocs[0] || {}).length : 0,
            totalIndexSize: existingIndexes.reduce((sum, idx) => sum + (idx.size || 1024), 0),
            indexes: existingIndexes.map(idx => ({
              name: idx.name,
              key: idx.key,
              size: idx.size || 1024
            })),
            missingIndexes: missingCount,
            performanceScore: Math.max(0, performanceScore)
          });
          
          logError('info', 'DatabaseOptimizer', 
            `Collection ${collectionName}: ${docCount} docs, ${existingIndexes.length} indexes, ${missingCount} missing`);
          
        } catch (error) {
          logError('error', 'DatabaseOptimizer', 
            `Error analyzing collection ${collectionName}`, error);
        }
      }
      
      setProgress(90);
      setCollectionStats(stats);
      setRecommendations(recs);
      
      // Generate implementation script
      const script = recs
        .sort((a, b) => getPriorityWeight(a.priority) - getPriorityWeight(b.priority))
        .map(rec => `// ${rec.priority.toUpperCase()} Priority: ${rec.reason}\n${rec.implementationCommand};`)
        .join('\n\n');
      
      setImplementationScript(script);
      
      setProgress(100);
      setAnalysisComplete(true);
      
      const criticalIssues = recs.filter(r => r.priority === 'critical').length;
      const highIssues = recs.filter(r => r.priority === 'high').length;
      
      logError('info', 'DatabaseOptimizer', 
        `Analysis complete: ${criticalIssues} critical, ${highIssues} high priority recommendations`);
      
      toast({
        title: "Database Analysis Complete",
        description: `Found ${recs.length} optimization opportunities (${criticalIssues} critical)`,
        variant: criticalIssues > 0 ? "destructive" : "default"
      });
      
    } catch (error) {
      logError('error', 'DatabaseOptimizer', 'Database analysis failed', error);
      
      toast({
        title: "Analysis Error",
        description: "Error analyzing database. Check error logs for details.",
        variant: "destructive"
      });
      
      // Provide sample recommendations even if analysis fails
      setRecommendations(getSampleRecommendations());
      setAnalysisComplete(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getIndexReason = (collection: string, indexName: string): string => {
    const reasons: Record<string, Record<string, string>> = {
      'products': {
        'user_id_1': 'Required for Row Level Security (RLS) filtering by user',
        'user_sku_compound': 'Critical for product lookups by user and SKU',
        'barcode_unique': 'Essential for fast barcode scanning operations',
        'status_1': 'Filtering products by status (active/inactive)',
        'category_id_1': 'Product categorization queries'
      },
      'stock_levels': {
        'user_id_1': 'Required for Row Level Security (RLS) filtering',
        'product_location_compound': 'Critical for stock queries by product and location',
        'quantity_available_1': 'Finding products with available stock',
        'user_quantity_compound': 'User-specific stock availability queries'
      },
      'picking_tasks': {
        'user_id_1': 'Required for Row Level Security (RLS) filtering',
        'user_status_priority_compound': 'Task assignment and prioritization queries',
        'created_at_desc': 'Task history and timeline queries',
        'assigned_status_compound': 'Operator task management'
      }
    };
    
    return reasons[collection]?.[indexName] || 'Improves query performance for this collection';
  };

  const getEstimatedImpact = (priority: string): string => {
    switch (priority) {
      case 'critical': return '70-90% performance improvement';
      case 'high': return '40-70% performance improvement';
      case 'medium': return '20-40% performance improvement';
      case 'low': return '10-20% performance improvement';
      default: return 'Performance improvement';
    }
  };

  const getPriorityWeight = (priority: string): number => {
    switch (priority) {
      case 'critical': return 1;
      case 'high': return 2;
      case 'medium': return 3;
      case 'low': return 4;
      default: return 5;
    }
  };

  const getSampleRecommendations = (): IndexRecommendation[] => {
    return [
      {
        collection: 'products',
        indexName: 'user_sku_compound',
        fields: { user_id: 1, sku: 1 },
        reason: 'Critical for product lookups by user and SKU',
        priority: 'critical',
        estimatedImpact: '70-90% performance improvement',
        implementationCommand: 'db.products.createIndex({"user_id":1,"sku":1})',
        currentlyMissing: true
      },
      {
        collection: 'stock_levels',
        indexName: 'product_location_compound',
        fields: { product_id: 1, location_id: 1 },
        reason: 'Critical for stock queries by product and location',
        priority: 'critical',
        estimatedImpact: '70-90% performance improvement',
        implementationCommand: 'db.stock_levels.createIndex({"product_id":1,"location_id":1})',
        currentlyMissing: true
      }
    ];
  };

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(implementationScript);
    toast({
      title: "Script Copied",
      description: "Implementation script copied to clipboard",
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Info className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: 'destructive',
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

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Advanced Database Performance Optimizer
        </CardTitle>
        <CardDescription>
          Comprehensive database analysis with detailed index recommendations and error logging
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
            {isAnalyzing ? 'Analyzing...' : 'Run Comprehensive Analysis'}
          </Button>
          
          {isAnalyzing && (
            <div className="flex-1">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-1">
                {progress < 20 ? 'Connecting to database...' :
                 progress < 80 ? 'Analyzing collections and indexes...' :
                 progress < 100 ? 'Generating recommendations...' :
                 'Complete!'}
              </p>
            </div>
          )}
        </div>

        {analysisComplete && (
          <>
            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {recommendations.filter(r => r.priority === 'critical').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Critical Issues</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {recommendations.filter(r => r.priority === 'high').length}
                  </p>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {collectionStats.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Collections</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(collectionStats.reduce((sum, stat) => sum + stat.performanceScore, 0) / Math.max(collectionStats.length, 1))}%
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Performance</p>
                </CardContent>
              </Card>
            </div>

            {/* Collection Performance Details */}
            {collectionStats.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Collection Performance Analysis</h3>
                <div className="space-y-2">
                  {collectionStats.map((stat) => (
                    <Card key={stat.name}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{stat.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={stat.performanceScore >= 80 ? 'default' : stat.performanceScore >= 60 ? 'secondary' : 'destructive'}>
                              {stat.performanceScore}% Performance
                            </Badge>
                            {stat.missingIndexes > 0 && (
                              <Badge variant="destructive">
                                {stat.missingIndexes} Missing Indexes
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>Documents: {stat.documentCount}</div>
                          <div>Indexes: {stat.indexes.length}</div>
                          <div>Avg Size: {stat.averageObjectSize} bytes</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Index Recommendations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Critical Index Recommendations</h3>
                <div className="flex items-center gap-2">
                  {implementationScript && (
                    <Button onClick={copyScriptToClipboard} variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Script
                    </Button>
                  )}
                  <Badge variant="outline">
                    {recommendations.length} recommendations
                  </Badge>
                </div>
              </div>

              {recommendations.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Excellent! Your database indexes are well-optimized. No critical recommendations at this time.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {recommendations
                    .sort((a, b) => getPriorityWeight(a.priority) - getPriorityWeight(b.priority))
                    .map((rec, index) => (
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
                            {rec.implementationCommand}
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

            {/* Error Logs */}
            {errorLogs.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Analysis Logs
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {errorLogs.slice(0, 20).map((log, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded text-sm">
                      {getLogLevelIcon(log.level)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.component}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p>{log.message}</p>
                        {log.details && (
                          <pre className="text-xs text-muted-foreground mt-1 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Implementation Guide */}
            {recommendations.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Implementation Priority:</strong> Address critical issues first for maximum impact. 
                  Copy the implementation script and run it in your MongoDB shell. Monitor query performance after implementation.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
