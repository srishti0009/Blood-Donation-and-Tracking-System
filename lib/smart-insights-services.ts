import { db } from '@/lib/firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import { trainBloodDemandModel, predictBloodDemand, isModelTraining } from '@/lib/ml-blood-demand';

interface BloodDemandData {
  population: number;
  events: number;
  historicalUsage: number;
  hospitalAdmissions: number;
  donorsAvailable: number;
  temperature: number;
  dayOfWeek: number;
  month: number;
  actualDemand: number;
}

interface SmartInsight {
  type: 'daily' | 'weekly' | 'blood_group' | 'location' | 'time';
  title: string;
  prediction: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  details: any;
}

class SmartInsightsService {
  private isModelTrained = false;
  private lastTrainingDate: Date | null = null;
  private trainingPromise: Promise<boolean> | null = null; // 🆕 Store training promise
  private isCurrentlyTraining = false; // 🆕 Simple lock

  // Auto-train model from Firebase
  async autoTrainModel(): Promise<boolean> {
    // 🆕 CHECK: If training is in progress, wait for it
    if (this.trainingPromise) {
      console.log('⚠️ Training already in progress, waiting...');
      return await this.trainingPromise;
    }

    // 🆕 CHECK: If model already trained recently (within 5 minutes)
    if (this.isModelTrained && this.lastTrainingDate) {
      const minutesSinceTraining = (new Date().getTime() - this.lastTrainingDate.getTime()) / 1000 / 60;
      if (minutesSinceTraining < 5) {
        console.log('✅ Model already trained recently, skipping...');
        return true;
      }
    }

    // 🆕 If already training, skip
    if (this.isCurrentlyTraining) {
      console.log('⚠️ Training in progress, skipping...');
      return this.isModelTrained;
    }

    this.isCurrentlyTraining = true;

    // 🆕 CREATE: Training promise
    this.trainingPromise = this._doTraining();
    
    try {
      const result = await this.trainingPromise;
      return result;
    } finally {
      this.trainingPromise = null; // 🆕 Clear promise after completion
      this.isCurrentlyTraining = false; // 🆕 Always release lock
    }
  }

  // 🆕 PRIVATE: Actual training logic
  private async _doTraining(): Promise<boolean> {
    try {
      console.log('🎓 Auto-training ML model from Firebase...');
      
      // Fetch real data from Firebase
      const trainingData = await this.fetchTrainingData();
      
      if (trainingData.length < 10) {
        console.log(`⚠️ Only ${trainingData.length} records, adding synthetic data`);
        const syntheticData = this.generateSyntheticData(50);
        trainingData.push(...syntheticData);
      }
      
      console.log(`📊 Training with ${trainingData.length} samples`);
      
      // Train model
      const result = await trainBloodDemandModel(trainingData, 50);
      
      if (result.success) {
        this.isModelTrained = true;
        this.lastTrainingDate = new Date();
        console.log('✅ Model trained successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Training failed:', error);
      return false;
    }
  }

  // Fetch training data from Firebase
  private async fetchTrainingData(): Promise<BloodDemandData[]> {
    try {
      const demandCollection = collection(db, 'blood_demand');
      const snapshot = await getDocs(demandCollection);
      
      const data: BloodDemandData[] = [];
      
      snapshot.docs.forEach(doc => {
        const d = doc.data();
        const date = new Date(d.date || new Date());
        
        data.push({
          population: 150000,
          events: this.checkForEvents(date) ? 1 : 0,
          historicalUsage: d.supply || 50,
          hospitalAdmissions: d.demand || 0,
          donorsAvailable: d.eligible_donors || 20,
          temperature: 25,
          dayOfWeek: date.getDay(),
          month: date.getMonth(),
          actualDemand: d.demand || 0
        });
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching training data:', error);
      return [];
    }
  }

  // Generate all smart insights
  async generateInsights(): Promise<SmartInsight[]> {
    // Auto-train if not trained
    if (!this.isModelTrained) {
      await this.autoTrainModel();
    }
    
    const insights: SmartInsight[] = [];
    
    // 1. Daily Request Prediction
    insights.push(await this.predictDailyRequests());
    
    // 2. Weekly Request Prediction
    insights.push(await this.predictWeeklyRequests());
    
    // 3. Blood Group Demand
    insights.push(...await this.predictBloodGroupDemand());
    
    // 4. Location-wise Demand
    insights.push(...await this.predictLocationDemand());
    
    // 5. Time-based Patterns
    insights.push(await this.predictTimePatterns());
    
    return insights;
  }

  // Predict daily requests
  private async predictDailyRequests(): Promise<SmartInsight> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const prediction = await predictBloodDemand({
      population: 150000,
      events: this.checkForEvents(tomorrow) ? 1 : 0,
      historicalUsage: 150,
      hospitalAdmissions: 70,
      donorsAvailable: 60,
      temperature: 25,
      dayOfWeek: tomorrow.getDay(),
      month: tomorrow.getMonth()
    });
    
    return {
      type: 'daily',
      title: 'Tomorrow\'s Demand',
      prediction: prediction.predictedDemand,
      confidence: prediction.confidence,
      trend: this.calculateTrend(prediction.predictedDemand, 150),
      details: {
        date: tomorrow.toLocaleDateString(),
        factors: prediction.factors
      }
    };
  }

  // Predict weekly requests
  private async predictWeeklyRequests(): Promise<SmartInsight> {
    let totalPrediction = 0;
    
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      
      const prediction = await predictBloodDemand({
        population: 150000,
        events: this.checkForEvents(futureDate) ? 1 : 0,
        historicalUsage: 150,
        hospitalAdmissions: 70,
        donorsAvailable: 60,
        temperature: 25,
        dayOfWeek: futureDate.getDay(),
        month: futureDate.getMonth()
      });
      
      totalPrediction += prediction.predictedDemand;
    }
    
    return {
      type: 'weekly',
      title: 'Next 7 Days Demand',
      prediction: Math.round(totalPrediction),
      confidence: 82,
      trend: 'up',
      details: {
        dailyAverage: Math.round(totalPrediction / 7)
      }
    };
  }

  // Predict blood group demand
  private async predictBloodGroupDemand(): Promise<SmartInsight[]> {
    const insights: SmartInsight[] = [];
    
    try {
      // Get actual blood group distribution from Firebase
      const requestsSnapshot = await getDocs(collection(db, 'requests'));
      const bloodGroupCounts: Record<string, number> = {};
      
      requestsSnapshot.docs.forEach(doc => {
        const bg = doc.data().bloodType;
        if (bg) {
          bloodGroupCounts[bg] = (bloodGroupCounts[bg] || 0) + 1;
        }
      });
      
      // Predict for top 3 blood groups
      const topGroups = Object.entries(bloodGroupCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);
      
      for (const [bloodGroup, count] of topGroups) {
        const prediction = await predictBloodDemand({
          population: 150000,
          events: 0,
          historicalUsage: count * 2,
          hospitalAdmissions: 70,
          donorsAvailable: 60,
          temperature: 25,
          dayOfWeek: new Date().getDay(),
          month: new Date().getMonth()
        });
        
        insights.push({
          type: 'blood_group',
          title: `${bloodGroup} Demand`,
          prediction: prediction.predictedDemand,
          confidence: prediction.confidence,
          trend: this.calculateTrend(prediction.predictedDemand, count),
          details: {
            bloodGroup,
            currentRequests: count
          }
        });
      }
    } catch (error) {
      console.error('Error predicting blood group demand:', error);
    }
    
    return insights;
  }

  // Predict location-wise demand
  private async predictLocationDemand(): Promise<SmartInsight[]> {
    const insights: SmartInsight[] = [];
    
    try {
      // Get location distribution from Firebase
      const requestsSnapshot = await getDocs(collection(db, 'requests'));
      const locationCounts: Record<string, number> = {};
      
      requestsSnapshot.docs.forEach(doc => {
        const loc = doc.data().location;
        if (loc) {
          locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        }
      });
      
      // Predict for top 3 locations
      const topLocations = Object.entries(locationCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);
      
      for (const [location, count] of topLocations) {
        const prediction = await predictBloodDemand({
          population: 150000,
          events: 0,
          historicalUsage: count * 2,
          hospitalAdmissions: 70,
          donorsAvailable: 60,
          temperature: 25,
          dayOfWeek: new Date().getDay(),
          month: new Date().getMonth()
        });
        
        insights.push({
          type: 'location',
          title: `${location} Demand`,
          prediction: prediction.predictedDemand,
          confidence: prediction.confidence,
          trend: this.calculateTrend(prediction.predictedDemand, count),
          details: {
            location,
            currentRequests: count
          }
        });
      }
    } catch (error) {
      console.error('Error predicting location demand:', error);
    }
    
    return insights;
  }

  // Predict time-based patterns
  private async predictTimePatterns(): Promise<SmartInsight> {
    try {
      // Analyze request times from Firebase
      const requestsSnapshot = await getDocs(collection(db, 'requests'));
      const hourCounts: Record<number, number> = {};
      
      requestsSnapshot.docs.forEach(doc => {
        const timestamp = doc.data().requestDate;
        if (timestamp) {
          const date = new Date(timestamp);
          const hour = date.getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      });
      
      // Find peak hour
      const peakHour = Object.entries(hourCounts)
        .sort(([, a], [, b]) => b - a)[0];
      
      const peakCount = peakHour ? parseInt(peakHour[1] as any) : 0;
      
      return {
        type: 'time',
        title: 'Peak Request Time',
        prediction: peakHour ? parseInt(peakHour[0]) : 14,
        confidence: 85,
        trend: 'stable',
        details: {
          peakHour: peakHour ? `${peakHour[0]}:00` : '14:00',
          requestCount: peakCount,
          pattern: 'Afternoon spike'
        }
      };
    } catch (error) {
      console.error('Error predicting time patterns:', error);
      return {
        type: 'time',
        title: 'Peak Request Time',
        prediction: 14,
        confidence: 70,
        trend: 'stable',
        details: {
          peakHour: '14:00',
          requestCount: 0,
          pattern: 'No data yet'
        }
      };
    }
  }

  // Helper functions
  private checkForEvents(date: Date): boolean {
    const month = date.getMonth();
    const day = date.getDate();
    
    const festivals = [
      { month: 10, day: 1 },
      { month: 2, day: 8 },
      { month: 7, day: 15 },
    ];
    
    return festivals.some(f => f.month === month && Math.abs(f.day - day) < 3);
  }

  private calculateTrend(predicted: number, current: number): 'up' | 'down' | 'stable' {
    if (current === 0) return 'stable';
    const diff = ((predicted - current) / current) * 100;
    if (diff > 10) return 'up';
    if (diff < -10) return 'down';
    return 'stable';
  }

  private generateSyntheticData(count: number): BloodDemandData[] {
    const data: BloodDemandData[] = [];
    
    for (let i = 0; i < count; i++) {
      const population = 100000 + Math.random() * 100000;
      const events = Math.random() > 0.7 ? 1 : 0;
      const historicalUsage = 50 + Math.random() * 200;
      const hospitalAdmissions = 30 + Math.random() * 70;
      const donorsAvailable = 20 + Math.random() * 90;
      const temperature = 15 + Math.random() * 25;
      const dayOfWeek = Math.floor(Math.random() * 7);
      const month = Math.floor(Math.random() * 12);
      
      let actualDemand = historicalUsage * 0.8;
      actualDemand += hospitalAdmissions * 1.5;
      actualDemand += events * 50;
      
      data.push({
        population,
        events,
        historicalUsage,
        hospitalAdmissions,
        donorsAvailable,
        temperature,
        dayOfWeek,
        month,
        actualDemand: Math.max(50, Math.round(actualDemand))
      });
    }
    
    return data;
  }
}

export const smartInsightsService = new SmartInsightsService();