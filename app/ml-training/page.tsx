"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Zap, TrendingUp, Target, Activity, Users, Droplet, Database } from 'lucide-react';
import { trainBloodDemandModel, getBloodDemandModelInfo } from '@/lib/ml-blood-demand';
import { trainMLModel as trainDonorModel, getModelInfo as getDonorModelInfo } from '@/lib/ml-donor-matching';
import { db } from '@/lib/firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import type { BloodDemandData } from '@/types/blood_demand';
import type { Donor } from '@/types/donors';

export default function MLTrainingPage() {
  const [activeTab, setActiveTab] = useState<'demand' | 'matching'>('demand');
  
  // Demand Training State
  const [demandTraining, setDemandTraining] = useState(false);
  const [demandProgress, setDemandProgress] = useState(0);
  const [demandLogs, setDemandLogs] = useState<string[]>([]);
  const [demandStats, setDemandStats] = useState<any>(null);
  
  // Donor Matching Training State
  const [matchingTraining, setMatchingTraining] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [matchingLogs, setMatchingLogs] = useState<string[]>([]);
  const [matchingStats, setMatchingStats] = useState<any>(null);

  // Data availability
  const [firebaseDataCount, setFirebaseDataCount] = useState({ demand: 0, donors: 0 });

  useEffect(() => {
    checkFirebaseData();
  }, []);

  // Check Firebase data availability
  const checkFirebaseData = async () => {
    try {
      const demandSnapshot = await getDocs(collection(db, 'blood_demand'));
      const donorsSnapshot = await getDocs(collection(db, 'donors'));
      
      setFirebaseDataCount({
        demand: demandSnapshot.size,
        donors: donorsSnapshot.size
      });
    } catch (error) {
      console.error('Error checking Firebase data:', error);
    }
  };

  const addDemandLog = (msg: string) => {
    setDemandLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const addMatchingLog = (msg: string) => {
    setMatchingLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Fetch REAL blood demand data from Firebase
  const fetchBloodDemandData = async (): Promise<BloodDemandData[]> => {
    try {
      addDemandLog('📥 Fetching blood demand data from Firebase...');
      
      const demandCollection = collection(db, 'blood_demand');
      const snapshot = await getDocs(demandCollection);
      
      const data: BloodDemandData[] = [];
      
      snapshot.docs.forEach(doc => {
        const d = doc.data();
        
        // Extract date features
        const date = new Date(d.date || new Date());
        const dayOfWeek = date.getDay(); // 0-6
        const month = date.getMonth(); // 0-11
        
        data.push({
          population: 150000, // Default population
          events: checkForEvents(date) ? 1 : 0,
          historicalUsage: d.supply || 50,
          hospitalAdmissions: d.demand || 0,
          donorsAvailable: d.eligible_donors || 20,
          temperature: 25, // Default temperature
          dayOfWeek,
          month,
          actualDemand: d.demand || 0
        });
      });
      
      addDemandLog(`✅ Fetched ${data.length} real records from Firebase`);
      return data;
      
    } catch (error: any) {
      addDemandLog(`❌ Error fetching Firebase data: ${error.message}`);
      throw error;
    }
  };

  // Fetch REAL donors from Firebase
  const fetchDonorsFromFirebase = async (): Promise<Donor[]> => {
    try {
      addMatchingLog('📥 Fetching donors from Firebase...');
      
      const donorsCollection = collection(db, 'donors');
      const snapshot = await getDocs(donorsCollection);
      
      const donors: Donor[] = [];
      
      snapshot.docs.forEach(doc => {
        const d = doc.data();
        
        donors.push({
          id: doc.id,
          name: d.fullName || d.name || 'Anonymous',
          bloodGroup: d.bloodGroup || 'O+',
          city: d.city || 'Unknown',
          state: d.state || 'Unknown',
          age: calculateAge(d.dateOfBirth) || d.age || 25,
          weight: d.weight || 60,
          hemoglobin: d.hemoglobin || 13.5,
          gender: d.gender || 'male',
          contact: d.phone || '0000000000',
          email: d.email || 'donor@example.com',
          lastDonationDate: formatDate(d.lastDonation),
          totalDonations: parseInt(d.totalDonations) || 0,
          medicalCondition: d.medicalConditions || 'none',
          isEligible: d.eligibility || false
        });
      });
      
      addMatchingLog(`✅ Fetched ${donors.length} real donors from Firebase`);
      return donors;
      
    } catch (error: any) {
      addMatchingLog(`❌ Error fetching donors: ${error.message}`);
      throw error;
    }
  };

  // Train Blood Demand Model with REAL Firebase data
  const handleTrainDemandModel = async () => {
    setDemandTraining(true);
    setDemandLogs([]);
    setDemandProgress(0);
    
    try {
      addDemandLog('🎓 Starting blood demand model training...');
      
      // Fetch REAL data from Firebase
      const trainingData = await fetchBloodDemandData();
      
      // Check if enough data
      if (trainingData.length < 10) {
        addDemandLog('⚠️ WARNING: Not enough training data!');
        addDemandLog(`Current samples: ${trainingData.length}`);
        addDemandLog('Minimum required: 10 samples');
        addDemandLog('💡 Recommendation: Add more blood demand records to Firebase');
        addDemandLog('');
        addDemandLog('📊 Generating additional synthetic data for demo...');
        
        // Generate additional synthetic data to reach minimum
        const syntheticData = generateSampleDemandData(Math.max(10 - trainingData.length, 50));
        trainingData.push(...syntheticData);
        addDemandLog(`✅ Combined with ${syntheticData.length} synthetic samples`);
      }
      
      addDemandLog(`📊 Total training samples: ${trainingData.length}`);
      addDemandLog('🔄 Starting neural network training...');
      
      // Train model
      const result = await trainBloodDemandModel(trainingData, 50, (progress, logs) => {
        setDemandProgress(progress);
        
        if (Math.floor(progress) % 20 === 0) {
          addDemandLog(`Epoch ${Math.floor(progress / 2)}/50: loss=${logs?.loss?.toFixed(4)}, val_loss=${logs?.val_loss?.toFixed(4)}`);
        }
      });
      
      if (result.success) {
        addDemandLog('✅ Training completed successfully!');
        addDemandLog(`📊 Final Loss: ${result.finalLoss?.toFixed(4)}`);
        addDemandLog(`📊 Validation Loss: ${result.finalValLoss?.toFixed(4)}`);
        addDemandLog('💾 Model saved to localStorage');
        
        // Get model info
        const info = await getBloodDemandModelInfo();
        setDemandStats(info);
      } else {
        addDemandLog('❌ Training failed');
      }
      
    } catch (error: any) {
      addDemandLog(`❌ Error: ${error.message}`);
      console.error('Training error:', error);
    } finally {
      setDemandTraining(false);
    }
  };

  // Train Donor Matching Model with REAL Firebase data
  const handleTrainMatchingModel = async () => {
    setMatchingTraining(true);
    setMatchingLogs([]);
    setMatchingProgress(0);
    
    try {
      addMatchingLog('🎓 Starting donor matching model training...');
      
      // Fetch REAL donors from Firebase
      let donors = await fetchDonorsFromFirebase();
      
      // Check if enough donors
      if (donors.length < 5) {
        addMatchingLog('⚠️ WARNING: Not enough donors in database!');
        addMatchingLog(`Current donors: ${donors.length}`);
        addMatchingLog('Minimum required: 5 donors');
        addMatchingLog('💡 Recommendation: Register more donors first');
        addMatchingLog('');
        addMatchingLog('📊 Generating additional synthetic donors for demo...');
        
        // Generate additional synthetic donors
        const syntheticDonors = generateSampleDonors(Math.max(5 - donors.length, 50));
        donors = [...donors, ...syntheticDonors];
        addMatchingLog(`✅ Combined with ${syntheticDonors.length} synthetic donors`);
      }
      
      addMatchingLog(`📊 Total donors: ${donors.length}`);
      addMatchingLog('🔄 Starting neural network training...');
      
      // Train model
      const success = await trainDonorModel(donors, 50, (progress, logs) => {
        setMatchingProgress(progress);
        
        if (Math.floor(progress) % 20 === 0) {
          addMatchingLog(`Epoch ${Math.floor(progress / 2)}/50: loss=${logs?.loss?.toFixed(4)}, accuracy=${(logs?.acc * 100)?.toFixed(2)}%`);
        }
      });
      
      if (success) {
        addMatchingLog('✅ Training completed successfully!');
        addMatchingLog('💾 Model saved to localStorage');
        
        // Get model info
        const info = await getDonorModelInfo();
        setMatchingStats(info);
      } else {
        addMatchingLog('❌ Training failed');
      }
      
    } catch (error: any) {
      addMatchingLog(`❌ Error: ${error.message}`);
      console.error('Training error:', error);
    } finally {
      setMatchingTraining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-600" />
            ML Model Training Center
          </h1>
          <p className="text-gray-600">
            Train neural networks with TensorFlow.js using real Firebase data
          </p>
        </div>

        {/* Firebase Data Stats */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blood Demand Records</p>
                <p className="text-2xl font-bold text-blue-600">{firebaseDataCount.demand}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {firebaseDataCount.demand >= 10 ? '✅ Ready for training' : '⚠️ Need at least 10 records'}
            </p>
          </Card>

          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Registered Donors</p>
                <p className="text-2xl font-bold text-green-600">{firebaseDataCount.donors}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {firebaseDataCount.donors >= 5 ? '✅ Ready for training' : '⚠️ Need at least 5 donors'}
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 border-b pb-2">
          <button
            onClick={() => setActiveTab('demand')}
            className={`px-6 py-2 rounded-t-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'demand'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Droplet className="w-5 h-5" />
            Blood Demand Prediction
          </button>
          <button
            onClick={() => setActiveTab('matching')}
            className={`px-6 py-2 rounded-t-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'matching'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-5 h-5" />
            Donor Matching
          </button>
        </div>

        {/* Blood Demand Training */}
        {activeTab === 'demand' && (
          <div className="space-y-6">
            {/* Training Controls */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Training Controls
                </h2>
                
                <div className="space-y-4">
                  <Button
                    onClick={handleTrainDemandModel}
                    disabled={demandTraining}
                    className="w-full bg-red-600 hover:bg-red-700"
                    size="lg"
                  >
                    {demandTraining ? (
                      <>
                        <Activity className="w-5 h-5 mr-2 animate-pulse" />
                        Training... {demandProgress.toFixed(0)}%
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Train with Firebase Data (50 epochs)
                      </>
                    )}
                  </Button>

                  {demandTraining && (
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-red-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${demandProgress}%` }}
                      />
                    </div>
                  )}

                  {firebaseDataCount.demand < 10 && !demandTraining && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Only {firebaseDataCount.demand} records in Firebase. Training will use synthetic data to supplement.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Model Stats */}
              {demandStats && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Model Architecture
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                      <span className="text-sm font-medium">Total Parameters</span>
                      <span className="text-xl font-bold text-purple-600">
                        {demandStats.totalParams?.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                      <span className="text-sm font-medium">Network Layers</span>
                      <span className="text-xl font-bold text-blue-600">{demandStats.layers}</span>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-sm font-medium mb-1">Input Shape</p>
                      <p className="text-xs text-gray-600">{JSON.stringify(demandStats.inputShape)}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Training Logs */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">📝 Training Logs</h2>
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                {demandLogs.length === 0 ? (
                  <p className="text-gray-500">No logs yet. Click "Train with Firebase Data" to start.</p>
                ) : (
                  demandLogs.map((log, i) => (
                    <div key={i} className="mb-1">{log}</div>
                  ))
                )}
              </div>
            </Card>

            {/* Model Info */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">🏗️ Neural Network Architecture</h2>
              <div className="space-y-2 font-mono text-sm">
                <div className="p-3 bg-gray-100 rounded">
                  <span className="font-bold">Input Layer:</span> 8 features (population, events, usage, admissions, donors, temp, day, month)
                </div>
                <div className="p-3 bg-red-100 rounded">
                  <span className="font-bold">Hidden Layer 1:</span> 64 neurons + ReLU + Dropout(0.2)
                </div>
                <div className="p-3 bg-red-100 rounded">
                  <span className="font-bold">Hidden Layer 2:</span> 32 neurons + ReLU + Dropout(0.1)
                </div>
                <div className="p-3 bg-red-100 rounded">
                  <span className="font-bold">Hidden Layer 3:</span> 16 neurons + ReLU
                </div>
                <div className="p-3 bg-blue-100 rounded">
                  <span className="font-bold">Output Layer:</span> 1 neuron (predicted demand)
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Donor Matching Training */}
        {activeTab === 'matching' && (
          <div className="space-y-6">
            {/* Training Controls */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Training Controls
                </h2>
                
                <div className="space-y-4">
                  <Button
                    onClick={handleTrainMatchingModel}
                    disabled={matchingTraining}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {matchingTraining ? (
                      <>
                        <Activity className="w-5 h-5 mr-2 animate-pulse" />
                        Training... {matchingProgress.toFixed(0)}%
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Train with Firebase Data (50 epochs)
                      </>
                    )}
                  </Button>

                  {matchingTraining && (
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${matchingProgress}%` }}
                      />
                    </div>
                  )}

                  {firebaseDataCount.donors < 5 && !matchingTraining && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Only {firebaseDataCount.donors} donors in Firebase. Training will use synthetic data to supplement.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Model Stats */}
              {matchingStats && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Model Architecture
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                      <span className="text-sm font-medium">Total Parameters</span>
                      <span className="text-xl font-bold text-purple-600">
                        {matchingStats.totalParams?.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                      <span className="text-sm font-medium">Network Layers</span>
                      <span className="text-xl font-bold text-blue-600">{matchingStats.layers}</span>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-sm font-medium mb-1">Input Shape</p>
                      <p className="text-xs text-gray-600">{JSON.stringify(matchingStats.inputShape)}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Training Logs */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">📝 Training Logs</h2>
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                {matchingLogs.length === 0 ? (
                  <p className="text-gray-500">No logs yet. Click "Train with Firebase Data" to start.</p>
                ) : (
                  matchingLogs.map((log, i) => (
                    <div key={i} className="mb-1">{log}</div>
                  ))
                )}
              </div>
            </Card>

            {/* Model Info */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">🏗️ Neural Network Architecture</h2>
              <div className="space-y-2 font-mono text-sm">
                <div className="p-3 bg-gray-100 rounded">
                  <span className="font-bold">Input Layer:</span> 15 features (blood compatibility, distance, age, weight, etc.)
                </div>
                <div className="p-3 bg-blue-100 rounded">
                  <span className="font-bold">Hidden Layer 1:</span> 128 neurons + ReLU + Dropout(0.3)
                </div>
                <div className="p-3 bg-blue-100 rounded">
                  <span className="font-bold">Hidden Layer 2:</span> 64 neurons + ReLU + BatchNorm + Dropout(0.2)
                </div>
                <div className="p-3 bg-blue-100 rounded">
                  <span className="font-bold">Hidden Layer 3:</span> 32 neurons + ReLU + Dropout(0.1)
                </div>
                <div className="p-3 bg-blue-100 rounded">
                  <span className="font-bold">Hidden Layer 4:</span> 16 neurons + ReLU
                </div>
                <div className="p-3 bg-green-100 rounded">
                  <span className="font-bold">Output Layer:</span> 1 neuron (match probability)
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper: Check for events/festivals
function checkForEvents(date: Date): boolean {
  const month = date.getMonth();
  const day = date.getDate();
  
  // Major festivals in India
  const festivals = [
    { month: 10, day: 1 },  // Diwali (approx)
    { month: 2, day: 8 },   // Holi (approx)
    { month: 7, day: 15 },  // Independence Day
    { month: 0, day: 26 },  // Republic Day
  ];
  
  return festivals.some(f => f.month === month && Math.abs(f.day - day) < 3);
}

// Helper: Calculate age from date of birth
function calculateAge(dob: any): number {
  if (!dob) return 0;
  
  try {
    let birthDate: Date;
    
    if (dob.seconds) {
      birthDate = new Date(dob.seconds * 1000);
    } else {
      birthDate = new Date(dob);
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch {
    return 0;
  }
}

// Helper: Format date for lastDonationDate
function formatDate(timestamp: any): string {
  if (!timestamp) return '01-01-2023';
  
  try {
    let date: Date;
    
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch {
    return '01-01-2023';
  }
}

// FALLBACK: Generate sample training data (used if not enough Firebase data)
function generateSampleDemandData(count: number): BloodDemandData[] {
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
    actualDemand += (temperature > 30 ? 20 : 0);
    actualDemand += (dayOfWeek === 0 || dayOfWeek === 6 ? -10 : 0);
    
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

// FALLBACK: Generate sample donors (used if not enough Firebase donors)
function generateSampleDonors(count: number): Donor[] {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
  const genders = ['male', 'female'];
  const conditions = ['none', 'diabetes', 'hypertension'];
  
  const donors: Donor[] = [];
  
  for (let i = 0; i < count; i++) {
    const lastDonationDays = Math.floor(Math.random() * 365);
    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - lastDonationDays);
    
    donors.push({
      id: `SYNTHETIC-${i}`,
      name: `Synthetic Donor ${i}`,
      bloodGroup: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      state: 'State',
      age: 18 + Math.floor(Math.random() * 47),
      weight: 50 + Math.floor(Math.random() * 50),
      hemoglobin: 12 + Math.random() * 6,
      gender: genders[Math.floor(Math.random() * genders.length)],
      contact: '9876543210',
      email: `synthetic${i}@example.com`,
      lastDonationDate: `${lastDate.getDate().toString().padStart(2, '0')}-${(lastDate.getMonth() + 1).toString().padStart(2, '0')}-${lastDate.getFullYear()}`,
      totalDonations: Math.floor(Math.random() * 30),
      medicalCondition: conditions[Math.floor(Math.random() * conditions.length)],
      isEligible: Math.random() > 0.3
    });
  }
  
  return donors;
}