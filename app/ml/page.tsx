"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw, 
  ArrowLeft,
  Droplet,
  MapPin,
  Clock,
  Calendar
} from 'lucide-react';
import { smartInsightsService } from '@/lib/smart-insights-services';

export default function SmartInsightsPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [trained, setTrained] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    // 🆕 Prevent multiple simultaneous calls
    if (loading) {
      console.log('⚠️ Already loading insights, skipping...');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Loading smart insights...');
      const data = await smartInsightsService.generateInsights();
      setInsights(data);
      setTrained(true);
      console.log('✅ Insights loaded:', data);
    } catch (error) {
      console.error('❌ Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-gray-500';
  };
  // Add a button to clear and retrain
const clearAndRetrain = async () => {
  try {
    // Clear localStorage model
    localStorage.removeItem('tensorflowjs_models/blood-demand-model-v1/info');
    localStorage.removeItem('tensorflowjs_models/blood-demand-model-v1/model_topology');
    localStorage.removeItem('tensorflowjs_models/blood-demand-model-v1/weight_specs');
    localStorage.removeItem('tensorflowjs_models/blood-demand-model-v1/weight_data');
    
    console.log('🗑️ Cleared old model');
    
    // Reload page to force retrain
    window.location.reload();
  } catch (error) {
    console.error('Error clearing model:', error);
  }
};

// Add this button in your UI:
<Button onClick={clearAndRetrain} variant="outline" className="bg-red-600 text-white">
  Clear Model & Retrain
</Button>

  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Brain className="w-10 h-10 text-purple-600" />
                Smart Insights
                {trained && (
                  <span className="text-sm bg-green-600 text-white px-3 py-1 rounded-full">
                    AI Active
                  </span>
                )}
              </h1>
            </div>
            <p className="text-gray-600 ml-12">
              ML-powered predictions trained on real Firebase data
            </p>
          </div>
          
          <Button
            onClick={loadInsights}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Insights
              </>
            )}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <RefreshCw className="w-16 h-16 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-xl font-semibold mb-2">Training ML Model...</p>
            <p className="text-gray-600">Analyzing Firebase data and generating predictions</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Daily & Weekly Predictions */}
            <div className="grid md:grid-cols-2 gap-6">
              {insights
                .filter(i => i.type === 'daily' || i.type === 'weekly')
                .map((insight, idx) => (
                  <Card key={idx} className="p-6 border-l-4 border-l-purple-600 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {insight.type === 'daily' ? (
                            <Calendar className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-blue-600" />
                          )}
                          <h3 className="text-xl font-bold">{insight.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          {insight.type === 'daily' ? 'Next 24 hours forecast' : 'Next 7 days forecast'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(insight.trend)}
                        <span className={`text-sm font-semibold ${getTrendColor(insight.trend)}`}>
                          {insight.trend.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-5xl font-bold text-purple-600">
                        {insight.prediction}
                        <span className="text-2xl text-gray-600 ml-2">units</span>
                      </p>
                      {insight.details.dailyAverage && (
                        <p className="text-sm text-gray-600 mt-1">
                          ≈ {insight.details.dailyAverage} units per day
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {insight.confidence}% Confidence
                      </div>
                      <div className="text-xs text-gray-500">
                        Powered by TensorFlow.js
                      </div>
                    </div>
                  </Card>
                ))}
            </div>

            {/* Blood Group Demand */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Droplet className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold">Blood Group Demand Forecast</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {insights
                  .filter(i => i.type === 'blood_group')
                  .map((insight, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-red-50 to-pink-50 p-5 rounded-lg border border-red-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-3xl font-bold text-red-600">
                          {insight.details.bloodGroup}
                        </span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(insight.trend)}
                        </div>
                      </div>
                      
                      <p className="text-4xl font-bold text-gray-900 mb-2">
                        {insight.prediction}
                        <span className="text-lg text-gray-600 ml-1">units</span>
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Current: {insight.details.currentRequests} requests
                        </span>
                        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          {insight.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              
              {insights.filter(i => i.type === 'blood_group').length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No blood group data available yet. More data needed for predictions.
                </p>
              )}
            </Card>

            {/* Location-wise Demand */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Location Demand Forecast</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {insights
                  .filter(i => i.type === 'location')
                  .map((insight, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <span className="font-bold text-lg text-blue-900">
                            {insight.details.location}
                          </span>
                        </div>
                        {getTrendIcon(insight.trend)}
                      </div>
                      
                      <p className="text-4xl font-bold text-gray-900 mb-2">
                        {insight.prediction}
                        <span className="text-lg text-gray-600 ml-1">units</span>
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Current: {insight.details.currentRequests} requests
                        </span>
                        <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          {insight.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              
              {insights.filter(i => i.type === 'location').length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No location data available yet. More data needed for predictions.
                </p>
              )}
            </Card>

            {/* Time Pattern Analysis */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-6 h-6 text-yellow-600" />
                <h2 className="text-2xl font-bold">Peak Request Time Analysis</h2>
              </div>
              
              {insights
                .filter(i => i.type === 'time')
                .map((insight, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-700 mb-2 font-medium">Most requests received at</p>
                        <p className="text-6xl font-bold text-yellow-600 mb-3">
                          {insight.details.peakHour}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">
                            📊 {insight.details.requestCount} requests during peak
                          </span>
                          <span className="bg-yellow-600 text-white px-3 py-1 rounded-full font-semibold">
                            {insight.confidence}% Confidence
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg mb-2">
                          <p className="text-sm font-medium">Pattern Detected</p>
                          <p className="text-lg font-bold">{insight.details.pattern}</p>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          Based on historical request data
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </Card>

            {/* ML Info Card */}
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-start gap-4">
                <Brain className="w-12 h-12 text-purple-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">How It Works</h3>
                  <p className="text-gray-700 mb-3">
                    These predictions are generated using a TensorFlow.js neural network trained on real Firebase data including:
                  </p>
                  <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <li>✅ Historical blood demand patterns</li>
                    <li>✅ Blood type distribution</li>
                    <li>✅ Location-based requests</li>
                    <li>✅ Time-based trends</li>
                    <li>✅ Seasonal variations</li>
                    <li>✅ Event-based spikes</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">
                    Model retrains automatically when new data is available. Predictions update in real-time.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}