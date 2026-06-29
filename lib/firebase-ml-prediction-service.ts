// lib/firebase-ml-prediction-service.ts
// Firebase-based ML Prediction Service with Real-time Data

import { firebaseDataManager } from './firebase-data-manager';

interface PredictionInput {
  location: string;
  bloodType: string;
  days?: number;
  savePrediction?: boolean; // 🆕 NEW: Option to save prediction for validation
}

interface PredictionResult {
  location: string;
  bloodType: string;
  predictedDemand: number;
  currentSupply: number;
  predictedShortage: number;
  confidence: number;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  recommendations: string[];
  lastUpdated: string;
  predictionId?: string; // 🆕 NEW: ID of saved prediction
}

class FirebaseMLPredictionService {
  private static instance: FirebaseMLPredictionService;

  private constructor() {}

  public static getInstance(): FirebaseMLPredictionService {
    if (!FirebaseMLPredictionService.instance) {
      FirebaseMLPredictionService.instance = new FirebaseMLPredictionService();
    }
    return FirebaseMLPredictionService.instance;
  }

  // Predict blood demand using Firebase real-time data
  async predictDemand(input: PredictionInput): Promise<PredictionResult> {
    try {
      const dataset = await firebaseDataManager.getAggregatedStats();
      
      const locationData = dataset.filter(
        d => d.location === input.location && d.bloodType === input.bloodType
      );

      if (locationData.length === 0) {
        return this.baselinePrediction(input);
      }

      const data = locationData[0];
      const predictions = this.calculatePrediction(data, input.days || 7);
      
      const result: PredictionResult = {
        location: input.location,
        bloodType: input.bloodType,
        predictedDemand: predictions.demand,
        currentSupply: data.currentSupply,
        predictedShortage: predictions.shortage,
        confidence: predictions.confidence,
        urgencyLevel: this.calculateUrgency(predictions.shortage, data.currentSupply),
        recommendations: this.generateRecommendations(predictions, data),
        lastUpdated: new Date().toISOString()
      };

      // 🆕 NEW: Save prediction for accuracy validation
      if (input.savePrediction !== false) { // Default: save unless explicitly disabled
        const predictionId = await this.savePredictionForValidation(input, result);
        result.predictionId = predictionId;
      }

      return result;
    } catch (error) {
      console.error('Error predicting demand:', error);
      throw error;
    }
  }

  // 🆕 NEW: Save prediction to Firebase for later validation
  private async savePredictionForValidation(
    input: PredictionInput, 
    result: PredictionResult
  ): Promise<string> {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (input.days || 7));
      
      const predictionId = `PRED-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      await firebaseDataManager.savePrediction({
        id: predictionId,
        predictionDate: new Date().toISOString(),
        targetDate: targetDate.toISOString(),
        location: input.location,
        bloodType: input.bloodType,
        predictedDemand: result.predictedDemand,
        predictedShortage: result.predictedShortage,
        confidence: result.confidence
      });

      console.log(`✅ Prediction saved for validation: ${predictionId}`);
      return predictionId;
    } catch (error) {
      console.error('Error saving prediction:', error);
      // Don't throw - prediction can still work without saving
      return '';
    }
  }

  // Calculate prediction based on historical trends
  private calculatePrediction(data: any, daysAhead: number) {
    let baseDemand = data.currentDemand || 5;
    const criticalRatio = data.totalRequests > 0 ? data.criticalRequests / data.totalRequests : 0;
    const supplyDemandRatio = data.currentSupply > 0 ? data.currentDemand / data.currentSupply : data.currentDemand;
    
    const criticalFactor = 1 + (criticalRatio * 0.5);
    const supplyFactor = supplyDemandRatio > 1.5 ? 1.2 : 1.0;
    const donorFactor = data.eligibleDonors < 10 ? 1.3 : 1.0;
    const timeFactor = 1 + (daysAhead * 0.02);
    
    const predictedDemand = baseDemand * criticalFactor * supplyFactor * donorFactor * timeFactor;
    const predictedShortage = Math.max(0, predictedDemand - data.currentSupply);
    const confidence = this.calculateConfidence(data);
    
    return {
      demand: Math.round(predictedDemand),
      shortage: Math.round(predictedShortage),
      confidence
    };
  }

  // Calculate prediction confidence
  private calculateConfidence(data: any): number {
    let confidence = 0.5;
    
    if (data.totalDonors > 20) confidence += 0.15;
    else if (data.totalDonors > 10) confidence += 0.1;
    else if (data.totalDonors > 5) confidence += 0.05;
    
    if (data.totalRequests > 15) confidence += 0.15;
    else if (data.totalRequests > 8) confidence += 0.1;
    else if (data.totalRequests > 3) confidence += 0.05;
    
    if (data.currentSupply > 0) confidence += 0.1;
    if (data.currentDemand > 0) confidence += 0.1;
    
    return Math.min(1.0, confidence);
  }

  // Calculate urgency level
  private calculateUrgency(shortage: number, supply: number): 'critical' | 'high' | 'medium' | 'low' {
    const shortageRatio = supply > 0 ? shortage / supply : shortage;
    
    if (shortage > 10 || shortageRatio > 2) return 'critical';
    if (shortage > 5 || shortageRatio > 1) return 'high';
    if (shortage > 2 || shortageRatio > 0.5) return 'medium';
    return 'low';
  }

  // Generate recommendations
  private generateRecommendations(predictions: any, data: any): string[] {
    const recommendations: string[] = [];
    
    if (predictions.shortage > 10) {
      recommendations.push('URGENT: Launch immediate donor recruitment campaign');
      recommendations.push('Contact existing eligible donors for emergency donation');
    } else if (predictions.shortage > 5) {
      recommendations.push('Increase donor outreach efforts');
      recommendations.push('Schedule donation camps in the area');
    }
    
    const criticalRatio = data.totalRequests > 0 ? data.criticalRequests / data.totalRequests : 0;
    if (criticalRatio > 0.3) {
      recommendations.push('High number of critical requests - prioritize emergency inventory');
    }
    
    if (data.eligibleDonors < 10) {
      recommendations.push('Low donor pool - expand recruitment to nearby areas');
    }
    
    const supplyDemandRatio = data.currentSupply > 0 ? data.currentDemand / data.currentSupply : data.currentDemand;
    if (supplyDemandRatio > 1.5) {
      recommendations.push('Demand significantly exceeds supply - consider emergency protocols');
    }
    
    if (data.totalDonors < 5) {
      recommendations.push('Insufficient data - continue monitoring and data collection');
    }
    
    if (predictions.shortage === 0) {
      recommendations.push('Supply adequate - maintain current donor engagement');
    }
    
    return recommendations;
  }

  // Baseline prediction
  private baselinePrediction(input: PredictionInput): PredictionResult {
    return {
      location: input.location,
      bloodType: input.bloodType,
      predictedDemand: 5,
      currentSupply: 0,
      predictedShortage: 5,
      confidence: 0.3,
      urgencyLevel: 'medium',
      recommendations: [
        'No historical data available',
        'Start collecting donor and request data for this location and blood type',
        'Use regional averages as interim guidance'
      ],
      lastUpdated: new Date().toISOString()
    };
  }

  // Get predictions for all blood types
  async predictAllBloodTypes(location: string, savePredictions: boolean = true): Promise<PredictionResult[]> {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    const predictions = await Promise.all(
      bloodTypes.map(bloodType => 
        this.predictDemand({ 
          location, 
          bloodType,
          savePrediction: savePredictions 
        })
      )
    );
    
    return predictions;
  }

  // Get high-priority predictions
  async getHighPriorityPredictions(savePredictions: boolean = false): Promise<PredictionResult[]> {
    const dataset = await firebaseDataManager.getAggregatedStats();
    
    const predictions = await Promise.all(
      dataset.map(data => 
        this.predictDemand({ 
          location: data.location, 
          bloodType: data.bloodType,
          savePrediction: savePredictions
        })
      )
    );
    
    return predictions
      .filter(p => p.urgencyLevel === 'critical' || p.urgencyLevel === 'high')
      .sort((a, b) => {
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
      });
  }

  // Get location summary
  async getLocationSummary(location: string, savePredictions: boolean = false) {
    const predictions = await this.predictAllBloodTypes(location, savePredictions);
    const locationData = await firebaseDataManager.getLocationData(location);
    
    const totalShortage = predictions.reduce((sum, p) => sum + p.predictedShortage, 0);
    const criticalTypes = predictions.filter(p => p.urgencyLevel === 'critical');
    
    return {
      location,
      totalDonors: locationData.donors.length,
      eligibleDonors: locationData.donors.filter(d => d.eligibility).length,
      totalRequests: locationData.requests.length,
      unfulfilledRequests: locationData.requests.filter(r => !r.fulfilled).length,
      totalPredictedShortage: totalShortage,
      criticalBloodTypes: criticalTypes.map(p => p.bloodType),
      predictions,
      lastUpdated: new Date().toISOString()
    };
  }

  // Refresh predictions
  async refreshPredictions(): Promise<void> {
    console.log('Predictions refreshed with latest Firebase data');
  }

  // 🆕 NEW: Get accuracy statistics
  async getAccuracyStatistics(location?: string, bloodType?: string) {
    try {
      const stats = await firebaseDataManager.getAccuracyStats(location, bloodType);
      return stats;
    } catch (error) {
      console.error('Error getting accuracy statistics:', error);
      return null;
    }
  }

  // 🆕 NEW: Get accuracy trend
  async getAccuracyTrend(days: number = 30) {
    try {
      const trend = await firebaseDataManager.getAccuracyTrend(days);
      return trend;
    } catch (error) {
      console.error('Error getting accuracy trend:', error);
      return [];
    }
  }

  // 🆕 NEW: Validate specific prediction manually
  async validatePrediction(predictionId: string): Promise<boolean> {
    try {
      const prediction = await firebaseDataManager.getPredictionById(predictionId);
      
      if (!prediction) {
        console.error('Prediction not found:', predictionId);
        return false;
      }

      const targetDate = prediction.targetDate.split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      if (targetDate > today) {
        console.log('Target date not reached yet:', targetDate);
        return false;
      }

      // Calculate actual demand from requests
      const allRequests = await firebaseDataManager.getAllRequests();
      
      const relevantRequests = allRequests.filter(req => {
        const reqDate = req.requestDate.split('T')[0];
        return reqDate === targetDate && 
               req.location === prediction.location && 
               req.bloodType === prediction.bloodType;
      });

      const actualDemand = relevantRequests.reduce((sum, req) => sum + req.units, 0);

      // Get actual supply
      const donors = await firebaseDataManager.getEligibleDonors(
        prediction.location, 
        prediction.bloodType
      );
      const actualSupply = donors.length;
      const actualShortage = Math.max(0, actualDemand - actualSupply);

      // Update prediction with actual results
      await firebaseDataManager.updatePredictionWithActual(
        predictionId,
        actualDemand,
        actualShortage
      );

      console.log(`✅ Validated prediction ${predictionId}: ${actualDemand} units (predicted: ${prediction.predictedDemand})`);
      return true;
    } catch (error) {
      console.error('Error validating prediction:', error);
      return false;
    }
  }

  // 🆕 NEW: Validate all pending predictions
  async validateAllPendingPredictions(): Promise<number> {
    try {
      const pendingPredictions = await firebaseDataManager.getPendingValidations();
      
      console.log(`Found ${pendingPredictions.length} pending validations`);

      let validatedCount = 0;

      for (const prediction of pendingPredictions) {
        const success = await this.validatePrediction(prediction.id);
        if (success) validatedCount++;
      }

      console.log(`✅ Validated ${validatedCount} predictions`);
      return validatedCount;
    } catch (error) {
      console.error('Error validating pending predictions:', error);
      return 0;
    }
  }
}

export const firebaseMLPredictionService = FirebaseMLPredictionService.getInstance();
export type { PredictionInput, PredictionResult };