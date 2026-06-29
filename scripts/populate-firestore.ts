// scripts/populate-firestore.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Firebase config (same as your app)
const firebaseConfig = {
  apiKey: "AIzaSyBnnHvZvWexgXA_GdhUOIsO0R1pHN5pqxg",
  authDomain: "bloodlink-dcef0.firebaseapp.com",
  projectId: "bloodlink-dcef0",
  storageBucket: "bloodlink-dcef0.firebasestorage.app",
  messagingSenderId: "329729742439",
  appId: "1:329729742439:web:00b28d0677bfd6bd3866c2",
  measurementId: "G-TWTTEPX7QG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to create dates
const today = new Date();
const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

// Sample Predictions
const predictions = [
  {
    id: 'PRED-001',
    location: 'Mumbai',
    bloodType: 'O+',
    predictedDemand: 35,
    predictedShortage: 17,
    confidence: 0.75,
    actualDemand: 32,
    actualShortage: 15,
    accuracy: 91.4,
    error: 3,
    predictionDate: Timestamp.fromDate(sevenDaysAgo),
    targetDate: Timestamp.fromDate(today),
    createdAt: Timestamp.fromDate(sevenDaysAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'PRED-002',
    location: 'Delhi',
    bloodType: 'A+',
    predictedDemand: 20,
    predictedShortage: 8,
    confidence: 0.68,
    actualDemand: 25,
    actualShortage: 10,
    accuracy: 80.0,
    error: 5,
    predictionDate: Timestamp.fromDate(sevenDaysAgo),
    targetDate: Timestamp.fromDate(today),
    createdAt: Timestamp.fromDate(sevenDaysAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'PRED-003',
    location: 'Bangalore',
    bloodType: 'B+',
    predictedDemand: 28,
    predictedShortage: 12,
    confidence: 0.82,
    actualDemand: 27,
    actualShortage: 11,
    accuracy: 96.4,
    error: 1,
    predictionDate: Timestamp.fromDate(sevenDaysAgo),
    targetDate: Timestamp.fromDate(today),
    createdAt: Timestamp.fromDate(sevenDaysAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'PRED-004',
    location: 'Chennai',
    bloodType: 'AB+',
    predictedDemand: 15,
    predictedShortage: 5,
    confidence: 0.65,
    actualDemand: 18,
    actualShortage: 7,
    accuracy: 83.3,
    error: 3,
    predictionDate: Timestamp.fromDate(sevenDaysAgo),
    targetDate: Timestamp.fromDate(today),
    createdAt: Timestamp.fromDate(sevenDaysAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'PRED-005',
    location: 'Kolkata',
    bloodType: 'O-',
    predictedDemand: 12,
    predictedShortage: 4,
    confidence: 0.70,
    actualDemand: 14,
    actualShortage: 5,
    accuracy: 85.7,
    error: 2,
    predictionDate: Timestamp.fromDate(sevenDaysAgo),
    targetDate: Timestamp.fromDate(today),
    createdAt: Timestamp.fromDate(sevenDaysAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'PRED-006',
    location: 'Hyderabad',
    bloodType: 'A-',
    predictedDemand: 22,
    predictedShortage: 9,
    confidence: 0.60,
    actualDemand: 30,
    actualShortage: 15,
    accuracy: 73.3,
    error: 8,
    predictionDate: Timestamp.fromDate(sevenDaysAgo),
    targetDate: Timestamp.fromDate(today),
    createdAt: Timestamp.fromDate(sevenDaysAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'PRED-007',
    location: 'Pune',
    bloodType: 'B-',
    predictedDemand: 18,
    predictedShortage: 6,
    confidence: 0.78,
    actualDemand: 17,
    actualShortage: 5,
    accuracy: 94.4,
    error: 1,
    predictionDate: Timestamp.fromDate(sevenDaysAgo),
    targetDate: Timestamp.fromDate(today),
    createdAt: Timestamp.fromDate(sevenDaysAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'PRED-008',
    location: 'Ahmedabad',
    bloodType: 'AB-',
    predictedDemand: 10,
    predictedShortage: 3,
    confidence: 0.55,
    actualDemand: 16,
    actualShortage: 8,
    accuracy: 62.5,
    error: 6,
    predictionDate: Timestamp.fromDate(sevenDaysAgo),
    targetDate: Timestamp.fromDate(today),
    createdAt: Timestamp.fromDate(sevenDaysAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'PRED-009',
    location: 'Jaipur',
    bloodType: 'O+',
    predictedDemand: 25,
    predictedShortage: 10,
    confidence: 0.80,
    actualDemand: 24,
    actualShortage: 9,
    accuracy: 96.0,
    error: 1,
    predictionDate: Timestamp.fromDate(sevenDaysAgo),
    targetDate: Timestamp.fromDate(today),
    createdAt: Timestamp.fromDate(sevenDaysAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'PRED-010',
    location: 'Lucknow',
    bloodType: 'A+',
    predictedDemand: 30,
    predictedShortage: 12,
    confidence: 0.77,
    actualDemand: 28,
    actualShortage: 10,
    accuracy: 93.3,
    error: 2,
    predictionDate: Timestamp.fromDate(sevenDaysAgo),
    targetDate: Timestamp.fromDate(today),
    createdAt: Timestamp.fromDate(sevenDaysAgo),
    updatedAt: Timestamp.fromDate(today)
  }
];

// Sample Donors
const donors = [
  {
    id: 'DONOR-001',
    name: 'Rahul Sharma',
    bloodType: 'O+',
    age: 25,
    location: 'Mumbai',
    eligibility: true,
    lastDonation: Timestamp.fromDate(threeMonthsAgo),
    registrationDate: Timestamp.fromDate(threeMonthsAgo),
    phone: '9876543210',
    email: 'rahul.sharma@example.com',
    createdAt: Timestamp.fromDate(threeMonthsAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'DONOR-002',
    name: 'Priya Patel',
    bloodType: 'A+',
    age: 28,
    location: 'Mumbai',
    eligibility: true,
    lastDonation: Timestamp.fromDate(threeMonthsAgo),
    registrationDate: Timestamp.fromDate(threeMonthsAgo),
    phone: '9876543211',
    email: 'priya.patel@example.com',
    createdAt: Timestamp.fromDate(threeMonthsAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'DONOR-003',
    name: 'Amit Kumar',
    bloodType: 'B+',
    age: 32,
    location: 'Delhi',
    eligibility: true,
    lastDonation: Timestamp.fromDate(threeMonthsAgo),
    registrationDate: Timestamp.fromDate(threeMonthsAgo),
    phone: '9876543212',
    email: 'amit.kumar@example.com',
    createdAt: Timestamp.fromDate(threeMonthsAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'DONOR-004',
    name: 'Sneha Singh',
    bloodType: 'O+',
    age: 26,
    location: 'Bangalore',
    eligibility: true,
    lastDonation: Timestamp.fromDate(threeMonthsAgo),
    registrationDate: Timestamp.fromDate(threeMonthsAgo),
    phone: '9876543213',
    email: 'sneha.singh@example.com',
    createdAt: Timestamp.fromDate(threeMonthsAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'DONOR-005',
    name: 'Vikram Reddy',
    bloodType: 'AB+',
    age: 30,
    location: 'Chennai',
    eligibility: true,
    lastDonation: Timestamp.fromDate(threeMonthsAgo),
    registrationDate: Timestamp.fromDate(threeMonthsAgo),
    phone: '9876543214',
    email: 'vikram.reddy@example.com',
    createdAt: Timestamp.fromDate(threeMonthsAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'DONOR-006',
    name: 'Anjali Mehta',
    bloodType: 'A+',
    age: 24,
    location: 'Mumbai',
    eligibility: true,
    lastDonation: Timestamp.fromDate(threeMonthsAgo),
    registrationDate: Timestamp.fromDate(threeMonthsAgo),
    phone: '9876543215',
    email: 'anjali.mehta@example.com',
    createdAt: Timestamp.fromDate(threeMonthsAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'DONOR-007',
    name: 'Rajesh Gupta',
    bloodType: 'O-',
    age: 35,
    location: 'Kolkata',
    eligibility: true,
    lastDonation: Timestamp.fromDate(threeMonthsAgo),
    registrationDate: Timestamp.fromDate(threeMonthsAgo),
    phone: '9876543216',
    email: 'rajesh.gupta@example.com',
    createdAt: Timestamp.fromDate(threeMonthsAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'DONOR-008',
    name: 'Kavita Joshi',
    bloodType: 'B+',
    age: 27,
    location: 'Pune',
    eligibility: true,
    lastDonation: Timestamp.fromDate(threeMonthsAgo),
    registrationDate: Timestamp.fromDate(threeMonthsAgo),
    phone: '9876543217',
    email: 'kavita.joshi@example.com',
    createdAt: Timestamp.fromDate(threeMonthsAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'DONOR-009',
    name: 'Arjun Nair',
    bloodType: 'A-',
    age: 29,
    location: 'Hyderabad',
    eligibility: true,
    lastDonation: Timestamp.fromDate(threeMonthsAgo),
    registrationDate: Timestamp.fromDate(threeMonthsAgo),
    phone: '9876543218',
    email: 'arjun.nair@example.com',
    createdAt: Timestamp.fromDate(threeMonthsAgo),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'DONOR-010',
    name: 'Meera Shah',
    bloodType: 'O+',
    age: 31,
    location: 'Ahmedabad',
    eligibility: true,
    lastDonation: Timestamp.fromDate(threeMonthsAgo),
    registrationDate: Timestamp.fromDate(threeMonthsAgo),
    phone: '9876543219',
    email: 'meera.shah@example.com',
    createdAt: Timestamp.fromDate(threeMonthsAgo),
    updatedAt: Timestamp.fromDate(today)
  }
];

// Sample Blood Requests
const requests = [
  {
    id: 'REQ-001',
    requestDate: Timestamp.fromDate(today),
    bloodType: 'O+',
    units: 10,
    urgency: 'high',
    location: 'Mumbai',
    hospital: 'Apollo Hospital',
    fulfilled: false,
    patientAge: 45,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'REQ-002',
    requestDate: Timestamp.fromDate(today),
    bloodType: 'A+',
    units: 5,
    urgency: 'medium',
    location: 'Delhi',
    hospital: 'Max Hospital',
    fulfilled: false,
    patientAge: 38,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'REQ-003',
    requestDate: Timestamp.fromDate(today),
    bloodType: 'O+',
    units: 12,
    urgency: 'critical',
    location: 'Mumbai',
    hospital: 'Lilavati Hospital',
    fulfilled: false,
    patientAge: 52,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'REQ-004',
    requestDate: Timestamp.fromDate(today),
    bloodType: 'B+',
    units: 8,
    urgency: 'high',
    location: 'Bangalore',
    hospital: 'Manipal Hospital',
    fulfilled: false,
    patientAge: 41,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'REQ-005',
    requestDate: Timestamp.fromDate(today),
    bloodType: 'AB+',
    units: 6,
    urgency: 'medium',
    location: 'Chennai',
    hospital: 'MIOT Hospital',
    fulfilled: false,
    patientAge: 35,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'REQ-006',
    requestDate: Timestamp.fromDate(today),
    bloodType: 'O-',
    units: 4,
    urgency: 'critical',
    location: 'Kolkata',
    hospital: 'AMRI Hospital',
    fulfilled: false,
    patientAge: 28,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'REQ-007',
    requestDate: Timestamp.fromDate(today),
    bloodType: 'A+',
    units: 7,
    urgency: 'high',
    location: 'Mumbai',
    hospital: 'Fortis Hospital',
    fulfilled: false,
    patientAge: 49,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    id: 'REQ-008',
    requestDate: Timestamp.fromDate(today),
    bloodType: 'B-',
    units: 3,
    urgency: 'medium',
    location: 'Pune',
    hospital: 'Ruby Hall Clinic',
    fulfilled: false,
    patientAge: 33,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  }
];

// Sample Blood Demand Data
const bloodDemand = [
  {
    date: '2026-03-12',
    location: 'Mumbai',
    bloodType: 'O+',
    demand: 35,
    supply: 18,
    shortage: 17,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    date: '2026-03-12',
    location: 'Mumbai',
    bloodType: 'A+',
    demand: 25,
    supply: 15,
    shortage: 10,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    date: '2026-03-12',
    location: 'Delhi',
    bloodType: 'O+',
    demand: 30,
    supply: 12,
    shortage: 18,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    date: '2026-03-12',
    location: 'Delhi',
    bloodType: 'A+',
    demand: 20,
    supply: 10,
    shortage: 10,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    date: '2026-03-12',
    location: 'Bangalore',
    bloodType: 'B+',
    demand: 28,
    supply: 16,
    shortage: 12,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    date: '2026-03-12',
    location: 'Chennai',
    bloodType: 'AB+',
    demand: 15,
    supply: 8,
    shortage: 7,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  },
  {
    date: '2026-03-12',
    location: 'Kolkata',
    bloodType: 'O-',
    demand: 12,
    supply: 7,
    shortage: 5,
    createdAt: Timestamp.fromDate(today),
    updatedAt: Timestamp.fromDate(today)
  }
];

// Main function to populate Firestore
async function populateFirestore() {
  console.log('🚀 Starting Firestore population...\n');

  try {
    // Add Predictions
    console.log('📊 Adding Predictions...');
    for (const pred of predictions) {
      await addDoc(collection(db, 'prediction_history'), pred);
      console.log(`  ✅ Added: ${pred.id} (${pred.location} - ${pred.bloodType})`);
    }
    console.log(`✅ Added ${predictions.length} predictions\n`);

    // Add Donors
    console.log('👤 Adding Donors...');
    for (const donor of donors) {
      await addDoc(collection(db, 'donors'), donor);
      console.log(`  ✅ Added: ${donor.id} (${donor.name} - ${donor.bloodType})`);
    }
    console.log(`✅ Added ${donors.length} donors\n`);

    // Add Requests
    console.log('🩸 Adding Blood Requests...');
    for (const req of requests) {
      await addDoc(collection(db, 'requests'), req);
      console.log(`  ✅ Added: ${req.id} (${req.location} - ${req.units} units ${req.bloodType})`);
    }
    console.log(`✅ Added ${requests.length} requests\n`);

    // Add Blood Demand
    console.log('📈 Adding Blood Demand Data...');
    for (const demand of bloodDemand) {
      await addDoc(collection(db, 'blood_demand'), demand);
      console.log(`  ✅ Added: ${demand.location} - ${demand.bloodType} (${demand.demand} units)`);
    }
    console.log(`✅ Added ${bloodDemand.length} demand records\n`);

    console.log('🎉 SUCCESS! All data uploaded to Firestore!');
    console.log('\n📋 Summary:');
    console.log(`   • Predictions: ${predictions.length}`);
    console.log(`   • Donors: ${donors.length}`);
    console.log(`   • Requests: ${requests.length}`);
    console.log(`   • Demand Records: ${bloodDemand.length}`);
    console.log('\n✅ You can now view this data in Firebase Console');
    console.log('✅ Your ML Accuracy page will show real data!');

  } catch (error) {
    console.error('❌ Error populating Firestore:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Run the script
populateFirestore();