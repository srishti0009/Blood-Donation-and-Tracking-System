"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  RefreshCw
} from 'lucide-react';

export default function AccuracyDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ml/validation');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateNow = async () => {
    setValidating(true);
    try {
      await fetch('/api/ml/validate', { method: 'POST' });
      await fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error validating:', error);
    } finally {
      setValidating(false);
    }
  };

  // Helper function to format Firebase Timestamp
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle Firebase Timestamp object
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      // Handle ISO string or Date object
      if (typeof timestamp === 'string' || timestamp instanceof Date) {
        return new Date(timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      return 'Invalid Date';
    } catch (error) {
      console.error('Date formatting error:', error, timestamp);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading accuracy data...</p>
        </div>
      </div>
    );
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 bg-green-100';
    if (accuracy >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-red-600 mb-2 flex items-center gap-2">
            <Target className="h-10 w-10" />
            ML Accuracy Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time validation of prediction accuracy
          </p>
        </div>
        <Button 
          onClick={validateNow}
          disabled={validating}
          className="bg-red-600 hover:bg-red-700"
        >
          {validating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Validate Now
            </>
          )}
        </Button>
      </div>

      {stats && stats.totalPredictions > 0 ? (
        <>
          {/* Overview Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.totalPredictions}
                </div>
                <p className="text-xs text-gray-500 mt-1">Validated predictions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Average Accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${
                  stats.avgAccuracy >= 80 ? 'text-green-600' : 
                  stats.avgAccuracy >= 60 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {stats.avgAccuracy.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Prediction accuracy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Best Accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.bestAccuracy.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Highest achieved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Average Error</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  ±{stats.avgError.toFixed(1)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Units difference</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Predictions */}
          <Card>
            <CardHeader>
              <CardTitle>Prediction History</CardTitle>
              <CardDescription>
                Showing validated predictions with actual results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.predictions.map((pred: any, idx: number) => (
                  <div 
                    key={pred.id || idx} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {pred.location} - {pred.bloodType}
                        </h3>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Predicted on:</span> {formatDate(pred.predictionDate)}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Target date:</span> {formatDate(pred.targetDate)}
                        </p>
                      </div>
                      <Badge className={getAccuracyColor(pred.accuracy || 0)}>
                        {pred.accuracy ? `${pred.accuracy.toFixed(1)}% Accurate` : 'Pending'}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mt-3">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-xs text-gray-600 mb-1">Predicted Demand</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {pred.predictedDemand} units
                        </p>
                      </div>

                      {pred.actualDemand !== undefined && pred.actualDemand !== null ? (
                        <>
                          <div className="bg-green-50 p-3 rounded">
                            <p className="text-xs text-gray-600 mb-1">Actual Demand</p>
                            <p className="text-2xl font-bold text-green-600">
                              {pred.actualDemand} units
                            </p>
                          </div>

                          <div className={`p-3 rounded ${
                            pred.error <= 2 ? 'bg-green-50' : 
                            pred.error <= 5 ? 'bg-yellow-50' : 
                            'bg-red-50'
                          }`}>
                            <p className="text-xs text-gray-600 mb-1">Error Margin</p>
                            <p className={`text-2xl font-bold ${
                              pred.error <= 2 ? 'text-green-600' : 
                              pred.error <= 5 ? 'text-yellow-600' : 
                              'text-red-600'
                            }`}>
                              ±{pred.error} units
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="col-span-2 bg-gray-50 p-3 rounded flex items-center justify-center">
                          <p className="text-sm text-gray-500">
                            Waiting for validation...
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="outline">
                        Confidence: {((pred.confidence || 0.78) * 100).toFixed(0)}%
                      </Badge>
                      {pred.actualDemand !== undefined && pred.accuracy >= 80 && (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          High Accuracy
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Validation Data Yet
            </h3>
            <p className="text-gray-500 mb-4">
              Predictions will be validated automatically after their target dates
            </p>
            <Button onClick={validateNow} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for Validations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}