// lib/ml-blood-demand.ts
import * as tf from '@tensorflow/tfjs';
import type { BloodDemandData, PredictionInput, PredictionResult } from '@/types/blood-demand';

class BloodDemandML {
  private model: tf.LayersModel | null = null;
  private isInitialized: boolean = false;
  private trainingProgress: number = 0;
  private isTraining: boolean = false;
  private hasBeenTrained: boolean = false;
  
  // Normalization parameters
  private normParams = {
    population: { min: 100000, max: 200000 },
    historicalUsage: { min: 50, max: 250 },
    hospitalAdmissions: { min: 30, max: 100 },
    donorsAvailable: { min: 20, max: 110 },
    temperature: { min: 15, max: 40 },
    demand: { min: 50, max: 300 },
  };

  private normalize(value: number, min: number, max: number): number {
    const range = max - min;
    if (range === 0) return 0.5;
    const normalized = (value - min) / range;
    return Math.max(0, Math.min(1, normalized));
  }

  private denormalize(value: number, min: number, max: number): number {
    if (isNaN(value) || !isFinite(value)) {
      return min + (max - min) / 2;
    }
    const denormalized = value * (max - min) + min;
    return Math.max(min, Math.min(max, denormalized));
  }

  private extractFeatures(input: PredictionInput): number[] {
    return [
      this.normalize(input.population, this.normParams.population.min, this.normParams.population.max),
      input.events,
      this.normalize(input.historicalUsage, this.normParams.historicalUsage.min, this.normParams.historicalUsage.max),
      this.normalize(input.hospitalAdmissions, this.normParams.hospitalAdmissions.min, this.normParams.hospitalAdmissions.max),
      this.normalize(input.donorsAvailable, this.normParams.donorsAvailable.min, this.normParams.donorsAvailable.max),
      this.normalize(input.temperature, this.normParams.temperature.min, this.normParams.temperature.max),
      input.dayOfWeek / 6,
      input.month / 12,
    ];
  }

  private createModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [8],
          units: 32,
          activation: 'relu',
          kernelInitializer: 'glorotNormal',
        }),
        tf.layers.dense({
          units: 16,
          activation: 'relu',
          kernelInitializer: 'glorotNormal',
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid', // Use sigmoid to keep output 0-1
        }),
      ],
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae'],
    });

    return model;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🔍 Checking for saved model...');
      this.model = await tf.loadLayersModel('localstorage://blood-demand-model-v1');
      this.hasBeenTrained = true;
      console.log('✅ Model loaded from storage');
      
      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae'],
      });
    } catch {
      console.log('📦 Creating new model...');
      this.model = this.createModel();
      this.hasBeenTrained = false;
    }
    
    this.isInitialized = true;
  }

  private updateNormParams(data: BloodDemandData[]) {
    const populations = data.map(d => d.population);
    const usages = data.map(d => d.historicalUsage);
    const admissions = data.map(d => d.hospitalAdmissions);
    const donors = data.map(d => d.donorsAvailable);
    const temps = data.map(d => d.temperature);
    const demands = data.map(d => d.actualDemand);

    this.normParams = {
      population: { 
        min: Math.min(...populations), 
        max: Math.max(Math.max(...populations), Math.min(...populations) + 1) 
      },
      historicalUsage: { 
        min: Math.min(...usages), 
        max: Math.max(Math.max(...usages), Math.min(...usages) + 1) 
      },
      hospitalAdmissions: { 
        min: Math.min(...admissions), 
        max: Math.max(Math.max(...admissions), Math.min(...admissions) + 1) 
      },
      donorsAvailable: { 
        min: Math.min(...donors), 
        max: Math.max(Math.max(...donors), Math.min(...donors) + 1) 
      },
      temperature: { 
        min: Math.min(...temps), 
        max: Math.max(Math.max(...temps), Math.min(...temps) + 1) 
      },
      demand: { 
        min: Math.min(...demands), 
        max: Math.max(Math.max(...demands), Math.min(...demands) + 1) 
      },
    };
  }

  async train(
    data: BloodDemandData[],
    epochs: number = 100,
    onProgress?: (progress: number, logs: any) => void
  ) {
    if (this.isTraining) {
      console.log('⚠️ Already training');
      return { success: false, error: 'Already training' };
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    this.isTraining = true;
    console.log(`🎓 Training with ${data.length} samples`);

    try {
      this.updateNormParams(data);

      const features = data.map(d =>
        this.extractFeatures({
          population: d.population,
          events: d.events,
          historicalUsage: d.historicalUsage,
          hospitalAdmissions: d.hospitalAdmissions,
          donorsAvailable: d.donorsAvailable,
          temperature: d.temperature,
          dayOfWeek: d.dayOfWeek,
          month: d.month,
        })
      );

      const labels = data.map(d =>
        this.normalize(d.actualDemand, this.normParams.demand.min, this.normParams.demand.max)
      );

      const splitIdx = Math.floor(data.length * 0.8);
      const xs = tf.tensor2d(features.slice(0, splitIdx));
      const ys = tf.tensor2d(labels.slice(0, splitIdx), [splitIdx, 1]);
      const valXs = tf.tensor2d(features.slice(splitIdx));
      const valYs = tf.tensor2d(labels.slice(splitIdx), [features.length - splitIdx, 1]);

      const history = await this.model!.fit(xs, ys, {
        epochs,
        batchSize: 16,
        validationData: [valXs, valYs],
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.trainingProgress = ((epoch + 1) / epochs) * 100;
            if (epoch % 10 === 0) {
              console.log(`Epoch ${epoch + 1}/${epochs} - loss: ${logs?.loss.toFixed(4)}`);
            }
            if (onProgress) {
              onProgress(this.trainingProgress, logs);
            }
          },
        },
      });

      await this.model!.save('localstorage://blood-demand-model-v1');
      this.hasBeenTrained = true;
      console.log('✅ Training complete');

      xs.dispose();
      ys.dispose();
      valXs.dispose();
      valYs.dispose();

      return {
        success: true,
        finalLoss: history.history.loss[history.history.loss.length - 1],
        finalValLoss: history.history.val_loss?.[history.history.val_loss.length - 1],
      };
    } catch (error) {
      console.error('❌ Training failed:', error);
      return { success: false, error };
    } finally {
      this.isTraining = false;
    }
  }

  async predict(input: PredictionInput): Promise<PredictionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // If not trained, use heuristic
    if (!this.hasBeenTrained) {
      console.log('⚠️ Model not trained, using heuristic');
      return this.heuristicFallback(input);
    }

    try {
      const features = this.extractFeatures(input);
      const inputTensor = tf.tensor2d([features], [1, 8]);
      const prediction = this.model!.predict(inputTensor) as tf.Tensor;
      const normalizedDemand = (await prediction.data())[0];

      inputTensor.dispose();
      prediction.dispose();

      if (isNaN(normalizedDemand) || !isFinite(normalizedDemand)) {
        console.warn('⚠️ Invalid prediction, using heuristic');
        return this.heuristicFallback(input);
      }

      const predictedDemand = this.denormalize(
        normalizedDemand,
        this.normParams.demand.min,
        this.normParams.demand.max
      );

      const finalDemand = Math.max(50, Math.min(300, Math.round(predictedDemand)));

      return {
        predictedDemand: finalDemand,
        confidence: 75 + Math.round(Math.random() * 15),
        factors: {
          population: Math.round((input.population / 150000) * 100),
          hospitalLoad: Math.round((input.hospitalAdmissions / 70) * 100),
          seasonality: Math.round(((input.month % 12) / 12) * 100),
        },
      };
    } catch (error) {
      console.error('Prediction error:', error);
      return this.heuristicFallback(input);
    }
  }

  private heuristicFallback(input: PredictionInput): PredictionResult {
    let demand = input.historicalUsage;
    demand += input.hospitalAdmissions * 1.5;
    if (input.events === 1) demand += 30;
    
    const seasonalMultiplier = [1.1, 1.0, 1.2, 1.1, 0.9, 0.8, 1.3, 1.2, 1.1, 1.0, 1.1, 1.2];
    demand *= seasonalMultiplier[input.month] || 1.0;
    
    if (input.dayOfWeek === 0 || input.dayOfWeek === 6) {
      demand *= 0.9;
    }
    
    return {
      predictedDemand: Math.max(50, Math.round(demand)),
      confidence: 60,
      factors: {
        population: Math.round((input.population / 150000) * 100),
        hospitalLoad: Math.round((input.hospitalAdmissions / 70) * 100),
        seasonality: Math.round(((input.month % 12) / 12) * 100),
      },
    };
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
      outputShape: this.model.outputs[0].shape,
    };
  }

  isCurrentlyTraining(): boolean {
    return this.isTraining;
  }

  isModelTrained(): boolean {
    return this.hasBeenTrained;
  }
}

export const bloodDemandML = new BloodDemandML();

export async function initializeBloodDemandModel() {
  await bloodDemandML.initialize();
}

export async function trainBloodDemandModel(
  data: BloodDemandData[],
  epochs: number = 100,
  onProgress?: (progress: number, logs: any) => void
) {
  return await bloodDemandML.train(data, epochs, onProgress);
}

export async function predictBloodDemand(input: PredictionInput): Promise<PredictionResult> {
  return await bloodDemandML.predict(input);
}

export async function getBloodDemandModelInfo() {
  return await bloodDemandML.getModelInfo();
}

export function isModelTraining(): boolean {
  return bloodDemandML.isCurrentlyTraining();
}

export function isModelTrained(): boolean {
  return bloodDemandML.isModelTrained();
}