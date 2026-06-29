// lib/ml-donor-matching.ts
import * as tf from '@tensorflow/tfjs';
import type { Donor, SearchFilters } from '@/types/donor';

const BLOOD_COMPATIBILITY: Record<string, string[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

class DonorMatchingML {
  private model: tf.LayersModel | null = null;
  private isInitialized: boolean = false;
  private trainingProgress: number = 0;

  private isBloodCompatible(donorBlood: string, requiredBlood: string): boolean {
    return BLOOD_COMPATIBILITY[donorBlood]?.includes(requiredBlood) || false;
  }

  private getDaysSinceLastDonation(lastDonationDate: string): number {
    try {
      const parts = lastDonationDate.split('-');
      const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      const today = new Date();
      return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    } catch {
      return 999;
    }
  }

  private extractFeatures(donor: Donor, filters: SearchFilters, distance: number): number[] {
    const daysSinceDonation = this.getDaysSinceLastDonation(donor.lastDonationDate);
    
    return [
      // Feature 1: Blood compatibility (0 or 1)
      this.isBloodCompatible(donor.bloodGroup, filters.bloodGroup) ? 1 : 0,
      
      // Feature 2: Exact blood match (0 or 1)
      donor.bloodGroup === filters.bloodGroup ? 1 : 0,
      
      // Feature 3: Normalized distance (0-1)
      Math.min(distance / 1000, 1),
      
      // Feature 4: Same city (0 or 1)
      distance === 0 ? 1 : 0,
      
      // Feature 5: Donor age (normalized 18-65)
      (donor.age - 18) / (65 - 18),
      
      // Feature 6: Weight eligibility (0 or 1)
      donor.weight >= 50 ? 1 : 0,
      
      // Feature 7: Hemoglobin level (normalized 12-18)
      (donor.hemoglobin - 12) / (18 - 12),
      
      // Feature 8: Total donations experience (normalized)
      Math.min(donor.totalDonations / 30, 1),
      
      // Feature 9: Days since last donation (normalized, capped at 365)
      Math.min(daysSinceDonation / 365, 1),
      
      // Feature 10: Donation eligibility by date (90+ days)
      daysSinceDonation >= 90 ? 1 : 0,
      
      // 🆕 FIX: Feature 11: Medical condition (0 = none, 1 = has) with safety check
    (donor.medicalCondition && typeof donor.medicalCondition === 'string' && donor.medicalCondition.toLowerCase() === 'none') ? 1 : 0,
      
      // Feature 12: Overall eligibility status
      donor.isEligible ? 1 : 0,
      
      // Feature 13: Urgency factor
      filters.urgency === 'critical' ? 1 : filters.urgency === 'urgent' ? 0.5 : 0,
      
      // Feature 14: Gender (normalized)
      donor.gender.toLowerCase() === 'male' ? 1 : 0,
      
      // Feature 15: Weight normalized (50-100 kg)
      Math.min((donor.weight - 50) / 50, 1)
    ];
  }

  private createModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        // Input layer
        tf.layers.dense({
          inputShape: [15],
          units: 128,
          activation: 'relu',
          kernelInitializer: 'heNormal',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.3 }),
        
        // Hidden layer 1
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.2 }),
        
        // Hidden layer 2
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.1 }),
        
        // Hidden layer 3
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        
        // Output layer (match probability)
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🔍 Checking for saved model...');
      this.model = await tf.loadLayersModel('localstorage://donor-matching-v2');
      console.log('✅ Model loaded from storage');
      
      // Recompile loaded model
      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });
    } catch {
      console.log('📦 Creating new model...');
      this.model = this.createModel();
      console.log('✅ New model created');
    }
    
    this.isInitialized = true;
  }

  generateTrainingData(donors: Donor[], sampleSize: number = 2000) {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const cities = Array.from(new Set(donors.map(d => d.city)));
    const urgencies: Array<'normal' | 'urgent' | 'critical'> = ['normal', 'urgent', 'critical'];
    
    const trainingData = [];
    
    for (let i = 0; i < sampleSize; i++) {
      const donor = donors[Math.floor(Math.random() * donors.length)];
      
      const filters: SearchFilters = {
        bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
        userCity: cities[Math.floor(Math.random() * cities.length)],
        urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
        maxDistance: 500
      };
      
      const distance = Math.random() * 800;
      
      // Calculate success probability based on realistic factors
      let successProb = 0;
      
      // Blood compatibility (most important)
      if (this.isBloodCompatible(donor.bloodGroup, filters.bloodGroup)) {
        successProb += donor.bloodGroup === filters.bloodGroup ? 0.35 : 0.25;
      }
      
      // Distance factor
      if (distance === 0) successProb += 0.15;
      else if (distance < 50) successProb += 0.12;
      else if (distance < 100) successProb += 0.08;
      else if (distance < 200) successProb += 0.04;
      
      // Eligibility
      const daysSince = this.getDaysSinceLastDonation(donor.lastDonationDate);
      if (donor.isEligible && daysSince >= 90) {
        successProb += 0.15;
      }
      
      // 🆕 FIX: Medical condition with safety check
    const medicalCondition = donor.medicalCondition || 'none';
    if (typeof medicalCondition === 'string' && medicalCondition.toLowerCase() === 'none') {
      successProb += 0.1;
    }
      
      // Weight and Hemoglobin - with safety checks
    const weight = donor.weight || 0;
    const hemoglobin = donor.hemoglobin || 0;
    if (weight >= 50 && hemoglobin >= 12.5) {
      successProb += 0.08;
    }
      
      // Experience (total donations) - with safety check
    const totalDonations = donor.totalDonations || 0;
    if (totalDonations >= 10) {
      successProb += 0.07;
    } else if (totalDonations >= 5) {
      successProb += 0.04;
    }
      
      // Urgency factor
      if (filters.urgency === 'critical' && distance < 100) {
        successProb += 0.05;
      }
      
      // Clamp between 0 and 1
      successProb = Math.max(0, Math.min(1, successProb));
      
      // Add some randomness (real-world variability)
      successProb += (Math.random() - 0.5) * 0.1;
      successProb = Math.max(0, Math.min(1, successProb));
      
      const actualMatch = Math.random() < successProb;
      
      trainingData.push({
        features: this.extractFeatures(donor, filters, distance),
        label: actualMatch ? 1 : 0
      });
    }
    
    return trainingData;
  }

  async train(donors: Donor[], epochs: number = 100, onProgress?: (progress: number, logs: any) => void) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('🎓 Starting model training...');
    console.log(`📊 Generating training data from ${donors.length} donors...`);
    
    const trainingData = this.generateTrainingData(donors, 2000);
    const validationData = this.generateTrainingData(donors, 500);
    
    const trainFeatures = trainingData.map(d => d.features);
    const trainLabels = trainingData.map(d => d.label);
    const valFeatures = validationData.map(d => d.features);
    const valLabels = validationData.map(d => d.label);
    
    const xs = tf.tensor2d(trainFeatures);
    const ys = tf.tensor2d(trainLabels, [trainLabels.length, 1]);
    const valXs = tf.tensor2d(valFeatures);
    const valYs = tf.tensor2d(valLabels, [valLabels.length, 1]);

    try {
      await this.model!.fit(xs, ys, {
        epochs,
        batchSize: 64,
        validationData: [valXs, valYs],
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.trainingProgress = ((epoch + 1) / epochs) * 100;
            console.log(
              `Epoch ${epoch + 1}/${epochs} - ` +
              `loss: ${logs?.loss.toFixed(4)}, ` +
              `acc: ${(logs?.acc * 100).toFixed(2)}%, ` +
              `val_acc: ${(logs?.val_acc * 100).toFixed(2)}%`
            );
            if (onProgress) {
              onProgress(this.trainingProgress, logs);
            }
          }
        }
      });

      // Save model
      await this.model!.save('localstorage://donor-matching-v2');
      console.log('✅ Model trained and saved successfully!');
      
      return true;
    } catch (error) {
      console.error('❌ Training failed:', error);
      return false;
    } finally {
      xs.dispose();
      ys.dispose();
      valXs.dispose();
      valYs.dispose();
    }
  }

  async predict(donor: Donor, filters: SearchFilters, distance: number): Promise<number> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const features = this.extractFeatures(donor, filters, distance);
    
    return tf.tidy(() => {
      const inputTensor = tf.tensor2d([features], [1, 15]);
      const prediction = this.model!.predict(inputTensor) as tf.Tensor;
      const probability = prediction.dataSync()[0];
      
      // Convert to 0-100 score
      return Math.round(probability * 100);
    });
  }

  getTrainingProgress(): number {
    return this.trainingProgress;
  }

  async getModelInfo() {
    if (!this.model) return null;
    
    return {
      totalParams: this.model.countParams(),
      layers: this.model.layers.length,
      inputShape: this.model.inputs[0].shape,
      outputShape: this.model.outputs[0].shape
    };
  }
}

// Singleton instance
export const mlMatcher = new DonorMatchingML();

// Convenience functions
export async function initializeMLModel() {
  await mlMatcher.initialize();
}

export async function trainMLModel(donors: Donor[], epochs: number = 100, onProgress?: (progress: number, logs: any) => void) {
  return await mlMatcher.train(donors, epochs, onProgress);
}

export async function predictMatchScore(donor: Donor, filters: SearchFilters, distance: number): Promise<number> {
  return await mlMatcher.predict(donor, filters, distance);
}

export async function getModelInfo() {
  return await mlMatcher.getModelInfo();
}