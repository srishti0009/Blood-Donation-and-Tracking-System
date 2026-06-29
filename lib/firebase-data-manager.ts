// lib/firebase-data-manager.ts
// Firebase Firestore Data Management System

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase-config';

// Types
export interface DonorData {
  id: string;
  name: string;
  bloodType: string;
  age: number;
  location: string;
  lastDonation?: string;
  eligibility: boolean;
  registrationDate: string;
  phone?: string;
  email?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface BloodRequest {
  id: string;
  requestDate: string;
  bloodType: string;
  units: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  hospital?: string;
  fulfilled: boolean;
  patientAge?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface BloodDemand {
  id?: string;
  date: string;
  location: string;
  bloodType: string;
  demand: number;
  supply: number;
  shortage: number;
  createdAt?: any;
  updatedAt?: any;
}

// 🆕 NEW: Prediction History Interface
export interface PredictionHistory {
  id: string;
  predictionDate: string;
  targetDate: string;
  location: string;
  bloodType: string;
  predictedDemand: number;
  predictedShortage: number;
  actualDemand?: number;
  actualShortage?: number;
  accuracy?: number;
  error?: number;
  confidence: number;
  createdAt?: any;
  updatedAt?: any;
}

class FirebaseDataManager {
  private static instance: FirebaseDataManager;

  // Collection names
  private readonly DONORS_COLLECTION = 'donors';
  private readonly REQUESTS_COLLECTION = 'requests';
  private readonly DEMAND_COLLECTION = 'blood_demand';
  private readonly PREDICTIONS_COLLECTION = 'prediction_history'; // 🆕 NEW

  private constructor() {}

  public static getInstance(): FirebaseDataManager {
    if (!FirebaseDataManager.instance) {
      FirebaseDataManager.instance = new FirebaseDataManager();
    }
    return FirebaseDataManager.instance;
  }

  // ==================== DONORS ====================

  // Add new donor
  async addDonor(donor: DonorData): Promise<string> {
    try {
      const donorRef = doc(db, this.DONORS_COLLECTION, donor.id);
      const donorData = {
        ...donor,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(donorRef, donorData);
      
      // Update demand data
      await this.updateDemandFromDonor(donor);
      
      return donor.id;
    } catch (error) {
      console.error('Error adding donor:', error);
      throw error;
    }
  }

  // Get all donors
  async getAllDonors(): Promise<DonorData[]> {
    try {
      const donorsRef = collection(db, this.DONORS_COLLECTION);
      const snapshot = await getDocs(donorsRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DonorData));
    } catch (error) {
      console.error('Error getting donors:', error);
      return [];
    }
  }

  // Get donors by location
  async getDonorsByLocation(location: string): Promise<DonorData[]> {
    try {
      const donorsRef = collection(db, this.DONORS_COLLECTION);
      const q = query(donorsRef, where('location', '==', location));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DonorData));
    } catch (error) {
      console.error('Error getting donors by location:', error);
      return [];
    }
  }

  // Get eligible donors by location and blood type
  async getEligibleDonors(location: string, bloodType: string): Promise<DonorData[]> {
    try {
      const donorsRef = collection(db, this.DONORS_COLLECTION);
      const q = query(
        donorsRef,
        where('location', '==', location),
        where('bloodType', '==', bloodType),
        where('eligibility', '==', true)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DonorData));
    } catch (error) {
      console.error('Error getting eligible donors:', error);
      return [];
    }
  }

  // ==================== REQUESTS ====================

  // Add new request
  async addRequest(request: BloodRequest): Promise<string> {
    try {
      const requestRef = doc(db, this.REQUESTS_COLLECTION, request.id);
      const requestData = {
        ...request,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(requestRef, requestData);
      
      // Update demand data
      await this.updateDemandFromRequest(request);
      
      return request.id;
    } catch (error) {
      console.error('Error adding request:', error);
      throw error;
    }
  }

  // Get all requests
  async getAllRequests(): Promise<BloodRequest[]> {
    try {
      const requestsRef = collection(db, this.REQUESTS_COLLECTION);
      const snapshot = await getDocs(requestsRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BloodRequest));
    } catch (error) {
      console.error('Error getting requests:', error);
      return [];
    }
  }

  // Update request status
  async updateRequestStatus(requestId: string, fulfilled: boolean): Promise<void> {
    try {
      const requestRef = doc(db, this.REQUESTS_COLLECTION, requestId);
      await updateDoc(requestRef, {
        fulfilled,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }

  // ==================== DEMAND ====================

  // Get all demand data
  async getAllDemand(): Promise<BloodDemand[]> {
    try {
      const demandRef = collection(db, this.DEMAND_COLLECTION);
      const snapshot = await getDocs(demandRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BloodDemand));
    } catch (error) {
      console.error('Error getting demand data:', error);
      return [];
    }
  }

  // Get demand by location
  async getDemandByLocation(location: string): Promise<BloodDemand[]> {
    try {
      const demandRef = collection(db, this.DEMAND_COLLECTION);
      const q = query(demandRef, where('location', '==', location));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BloodDemand));
    } catch (error) {
      console.error('Error getting demand by location:', error);
      return [];
    }
  }

  // Update demand from new donor
  private async updateDemandFromDonor(donor: DonorData): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const demandId = `${today}_${donor.location}_${donor.bloodType}`;
      const demandRef = doc(db, this.DEMAND_COLLECTION, demandId);
      
      const demandDoc = await getDoc(demandRef);
      
      if (demandDoc.exists()) {
        const data = demandDoc.data() as BloodDemand;
        await updateDoc(demandRef, {
          supply: data.supply + 1,
          shortage: Math.max(0, data.demand - (data.supply + 1)),
          updatedAt: Timestamp.now()
        });
      } else {
        await setDoc(demandRef, {
          date: today,
          location: donor.location,
          bloodType: donor.bloodType,
          demand: 0,
          supply: 1,
          shortage: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error updating demand from donor:', error);
    }
  }

  // Update demand from new request
  private async updateDemandFromRequest(request: BloodRequest): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const demandId = `${today}_${request.location}_${request.bloodType}`;
      const demandRef = doc(db, this.DEMAND_COLLECTION, demandId);
      
      const demandDoc = await getDoc(demandRef);
      
      if (demandDoc.exists()) {
        const data = demandDoc.data() as BloodDemand;
        await updateDoc(demandRef, {
          demand: data.demand + request.units,
          shortage: Math.max(0, (data.demand + request.units) - data.supply),
          updatedAt: Timestamp.now()
        });
      } else {
        await setDoc(demandRef, {
          date: today,
          location: request.location,
          bloodType: request.bloodType,
          demand: request.units,
          supply: 0,
          shortage: request.units,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error updating demand from request:', error);
    }
  }

  // ==================== AGGREGATED STATS ====================

  // Get aggregated statistics for ML predictions
  async getAggregatedStats() {
    try {
      const [donors, requests, demands] = await Promise.all([
        this.getAllDonors(),
        this.getAllRequests(),
        this.getAllDemand()
      ]);

      const stats = new Map<string, any>();

      // Process donors
      donors.forEach(donor => {
        const key = `${donor.location}_${donor.bloodType}`;
        if (!stats.has(key)) {
          stats.set(key, {
            location: donor.location,
            bloodType: donor.bloodType,
            totalDonors: 0,
            eligibleDonors: 0,
            totalRequests: 0,
            criticalRequests: 0,
            currentSupply: 0,
            currentDemand: 0,
            avgDonorAge: 0,
            ageSum: 0
          });
        }
        const stat = stats.get(key);
        stat.totalDonors++;
        if (donor.eligibility) stat.eligibleDonors++;
        stat.ageSum += donor.age;
      });

      // Process requests
      requests.forEach(request => {
        const key = `${request.location}_${request.bloodType}`;
        if (!stats.has(key)) {
          stats.set(key, {
            location: request.location,
            bloodType: request.bloodType,
            totalDonors: 0,
            eligibleDonors: 0,
            totalRequests: 0,
            criticalRequests: 0,
            currentSupply: 0,
            currentDemand: 0,
            avgDonorAge: 0,
            ageSum: 0
          });
        }
        const stat = stats.get(key);
        stat.totalRequests++;
        if (request.urgency === 'critical') stat.criticalRequests++;
        stat.currentDemand += request.units;
      });

      // Process demand data
      demands.forEach(demand => {
        const key = `${demand.location}_${demand.bloodType}`;
        if (stats.has(key)) {
          const stat = stats.get(key);
          stat.currentSupply += demand.supply;
        }
      });

      // Calculate averages
      stats.forEach(stat => {
        if (stat.totalDonors > 0) {
          stat.avgDonorAge = stat.ageSum / stat.totalDonors;
        }
        delete stat.ageSum;
      });

      return Array.from(stats.values());
    } catch (error) {
      console.error('Error getting aggregated stats:', error);
      return [];
    }
  }

  // Get location data
  async getLocationData(location: string) {
    try {
      const [donors, requests, demands] = await Promise.all([
        this.getDonorsByLocation(location),
        this.getAllRequests(),
        this.getDemandByLocation(location)
      ]);

      const filteredRequests = requests.filter(r => r.location === location);

      return { 
        donors, 
        requests: filteredRequests, 
        demands 
      };
    } catch (error) {
      console.error('Error getting location data:', error);
      return { donors: [], requests: [], demands: [] };
    }
  }

  // ==================== 🆕 PREDICTION HISTORY (ACCURACY TRACKING) ====================

  // Save prediction for later validation
  async savePrediction(prediction: PredictionHistory): Promise<string> {
    try {
      const predRef = doc(db, this.PREDICTIONS_COLLECTION, prediction.id);
      const predictionData = {
        ...prediction,
        createdAt: Timestamp.now()
      };

      await setDoc(predRef, predictionData);
      
      console.log(`✅ Prediction saved: ${prediction.id}`);
      return prediction.id;
    } catch (error) {
      console.error('Error saving prediction:', error);
      throw error;
    }
  }

  // Get all predictions
  async getAllPredictions(): Promise<PredictionHistory[]> {
    try {
      const predsRef = collection(db, this.PREDICTIONS_COLLECTION);
      const snapshot = await getDocs(predsRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PredictionHistory));
    } catch (error) {
      console.error('Error getting predictions:', error);
      return [];
    }
  }

  // Get prediction by ID
  async getPredictionById(predictionId: string): Promise<PredictionHistory | null> {
    try {
      const predRef = doc(db, this.PREDICTIONS_COLLECTION, predictionId);
      const predDoc = await getDoc(predRef);
      
      if (predDoc.exists()) {
        return { id: predDoc.id, ...predDoc.data() } as PredictionHistory;
      }
      return null;
    } catch (error) {
      console.error('Error getting prediction by ID:', error);
      return null;
    }
  }

  // Update prediction with actual results
  async updatePredictionWithActual(
    predictionId: string, 
    actualDemand: number, 
    actualShortage: number
  ): Promise<void> {
    try {
      const predRef = doc(db, this.PREDICTIONS_COLLECTION, predictionId);
      const predDoc = await getDoc(predRef);
      
      if (predDoc.exists()) {
        const data = predDoc.data() as PredictionHistory;
        
        // Calculate accuracy
        const error = Math.abs(data.predictedDemand - actualDemand);
        const accuracyPercent = actualDemand > 0 
          ? ((1 - (error / actualDemand)) * 100)
          : 100;
        
        await updateDoc(predRef, {
          actualDemand,
          actualShortage,
          accuracy: Math.max(0, Math.min(100, accuracyPercent)),
          error,
          updatedAt: Timestamp.now()
        });

        console.log(`✅ Updated prediction ${predictionId}: Accuracy ${accuracyPercent.toFixed(1)}%`);
      } else {
        console.error(`Prediction ${predictionId} not found`);
      }
    } catch (error) {
      console.error('Error updating prediction with actual:', error);
      throw error;
    }
  }

  // Get predictions that need validation (target date reached but no actual data)
  async getPendingValidations(): Promise<PredictionHistory[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const predsRef = collection(db, this.PREDICTIONS_COLLECTION);
      const snapshot = await getDocs(predsRef);
      
      const predictions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PredictionHistory));

      // Filter: target date <= today AND no actual data yet
      return predictions.filter(pred => {
        const targetDate = pred.targetDate.split('T')[0];
        return targetDate <= today && pred.actualDemand === undefined;
      });
    } catch (error) {
      console.error('Error getting pending validations:', error);
      return [];
    }
  }

  // Get accuracy statistics
  async getAccuracyStats(location?: string, bloodType?: string) {
    try {
      const predsRef = collection(db, this.PREDICTIONS_COLLECTION);
      const snapshot = await getDocs(predsRef);
      
      let predictions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PredictionHistory));

      // Filter by location if provided
      if (location) {
        predictions = predictions.filter(p => p.location === location);
      }

      // Filter by blood type if provided
      if (bloodType) {
        predictions = predictions.filter(p => p.bloodType === bloodType);
      }

      // Only include predictions with actual data
      const validatedPredictions = predictions.filter(
        p => p.actualDemand !== undefined && p.accuracy !== undefined
      );

      if (validatedPredictions.length === 0) {
        return {
          totalPredictions: 0,
          validatedPredictions: 0,
          avgAccuracy: 0,
          avgError: 0,
          bestAccuracy: 0,
          worstAccuracy: 0,
          predictions: []
        };
      }

      const accuracies = validatedPredictions.map(p => p.accuracy!);
      const errors = validatedPredictions.map(p => p.error!);

      return {
        totalPredictions: predictions.length,
        validatedPredictions: validatedPredictions.length,
        avgAccuracy: accuracies.reduce((a, b) => a + b, 0) / accuracies.length,
        avgError: errors.reduce((a, b) => a + b, 0) / errors.length,
        bestAccuracy: Math.max(...accuracies),
        worstAccuracy: Math.min(...accuracies),
        predictions: validatedPredictions.sort((a, b) => 
          new Date(b.predictionDate).getTime() - new Date(a.predictionDate).getTime()
        )
      };
    } catch (error) {
      console.error('Error getting accuracy stats:', error);
      return null;
    }
  }

  // Get accuracy trend over time
  async getAccuracyTrend(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const predsRef = collection(db, this.PREDICTIONS_COLLECTION);
      const snapshot = await getDocs(predsRef);
      
      const predictions = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as PredictionHistory))
        .filter(p => {
          const predDate = p.predictionDate.split('T')[0];
          return predDate >= startDateStr && p.actualDemand !== undefined;
        });

      // Group by date
      const trendMap = new Map<string, { accuracies: number[], count: number }>();

      predictions.forEach(pred => {
        const date = pred.predictionDate.split('T')[0];
        if (!trendMap.has(date)) {
          trendMap.set(date, { accuracies: [], count: 0 });
        }
        const trend = trendMap.get(date)!;
        trend.accuracies.push(pred.accuracy!);
        trend.count++;
      });

      // Calculate daily averages
      const trend = Array.from(trendMap.entries()).map(([date, data]) => ({
        date,
        avgAccuracy: data.accuracies.reduce((a, b) => a + b, 0) / data.count,
        count: data.count
      })).sort((a, b) => a.date.localeCompare(b.date));

      return trend;
    } catch (error) {
      console.error('Error getting accuracy trend:', error);
      return [];
    }
  }
}

export const firebaseDataManager = FirebaseDataManager.getInstance();