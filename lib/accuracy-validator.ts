// lib/accuracy-validator.ts
import { firebaseDataManager } from './firebase-data-manager';

class AccuracyValidator {
  private static instance: AccuracyValidator;

  private constructor() {}

  public static getInstance(): AccuracyValidator {
    if (!AccuracyValidator.instance) {
      AccuracyValidator.instance = new AccuracyValidator();
    }
    return AccuracyValidator.instance;
  }

  // Validate predictions that have reached their target date
  async validatePredictions(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get all predictions where target date is today
      const allPredictions = await firebaseDataManager.getAccuracyStats();
      
      if (!allPredictions || allPredictions.predictions.length === 0) {
        console.log('No predictions to validate');
        return;
      }

      for (const prediction of allPredictions.predictions) {
        const targetDate = prediction.targetDate.split('T')[0];
        
        // If target date is today or past, and no actual data yet
        if (targetDate <= today && !prediction.actualDemand) {
          await this.calculateActualDemand(prediction);
        }
      }
    } catch (error) {
      console.error('Error validating predictions:', error);
    }
  }

  // Calculate actual demand from database
  private async calculateActualDemand(prediction: any): Promise<void> {
    try {
      const targetDate = prediction.targetDate.split('T')[0];
      const location = prediction.location;
      const bloodType = prediction.bloodType;

      // Get all requests for that date, location, and blood type
      const allRequests = await firebaseDataManager.getAllRequests();
      
      const relevantRequests = allRequests.filter(req => {
        const reqDate = req.requestDate.split('T')[0];
        return reqDate === targetDate && 
               req.location === location && 
               req.bloodType === bloodType;
      });

      // Calculate actual demand
      const actualDemand = relevantRequests.reduce(
        (sum, req) => sum + req.units, 
        0
      );

      // Get actual supply
      const donors = await firebaseDataManager.getEligibleDonors(location, bloodType);
      const actualSupply = donors.length;
      const actualShortage = Math.max(0, actualDemand - actualSupply);

      // Update prediction with actual results
      await firebaseDataManager.updatePredictionWithActual(
        prediction.id,
        actualDemand,
        actualShortage
      );

      console.log(`✅ Validated prediction ${prediction.id}: ${actualDemand} units`);
    } catch (error) {
      console.error('Error calculating actual demand:', error);
    }
  }
}

export const accuracyValidator = AccuracyValidator.getInstance();