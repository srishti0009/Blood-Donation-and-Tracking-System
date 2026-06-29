import { db } from '@/lib/firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import type { BloodDemandData } from '@/types/blood-demand';
import type { Donor } from '@/types/donor';

// Fetch real blood demand data from Firebase
export async function fetchBloodDemandDataFromFirebase(): Promise<BloodDemandData[]> {
  try {
    console.log('📥 Fetching real data from Firebase...');
    
    const demandCollection = collection(db, 'blood_demand');
    const snapshot = await getDocs(demandCollection);
    
    const data: BloodDemandData[] = [];
    
    snapshot.docs.forEach(doc => {
      const d = doc.data();
      
      // Extract date features
      const date = new Date(d.date);
      const dayOfWeek = date.getDay(); // 0-6
      const month = date.getMonth(); // 0-11
      
      // Get location data
      const locationHash = hashLocation(d.location);
      
      data.push({
        population: 150000, // Default or from location mapping
        events: checkForEvents(date) ? 1 : 0,
        historicalUsage: d.supply || 0,
        hospitalAdmissions: d.demand || 0,
        donorsAvailable: d.eligible_donors || 0,
        temperature: 25, // Default or from weather API
        dayOfWeek,
        month,
        actualDemand: d.demand || 0
      });
    });
    
    console.log(`✅ Fetched ${data.length} real samples from Firebase`);
    
    return data;
    
  } catch (error) {
    console.error('❌ Error fetching Firebase data:', error);
    throw error;
  }
}

// Fetch real donor data from Firebase
export async function fetchDonorsFromFirebase(): Promise<Donor[]> {
  try {
    console.log('📥 Fetching donors from Firebase...');
    
    const donorsCollection = collection(db, 'donors');
    const snapshot = await getDocs(donorsCollection);
    
    const donors: Donor[] = [];
    
    snapshot.docs.forEach(doc => {
      const d = doc.data();
      
      donors.push({
        id: doc.id,
        name: d.fullName || d.name,
        bloodGroup: d.bloodGroup,
        city: d.city,
        state: d.state,
        age: calculateAge(d.dateOfBirth) || d.age,
        weight: d.weight,
        hemoglobin: d.hemoglobin || 13.5,
        gender: d.gender,
        contact: d.phone,
        email: d.email,
        lastDonationDate: formatDate(d.lastDonation),
        totalDonations: parseInt(d.totalDonations) || 0,
        medicalCondition: d.medicalConditions || 'none',
        isEligible: d.eligibility || false
      });
    });
    
    console.log(`✅ Fetched ${donors.length} real donors from Firebase`);
    
    return donors;
    
  } catch (error) {
    console.error('❌ Error fetching donors:', error);
    throw error;
  }
}

// Helper: Hash location to number
function hashLocation(location: string): number {
  let hash = 0;
  for (let i = 0; i < location.length; i++) {
    hash = ((hash << 5) - hash) + location.charCodeAt(i);
  }
  return Math.abs(hash) % 100;
}

// Helper: Check for events/festivals
function checkForEvents(date: Date): boolean {
  const month = date.getMonth();
  const day = date.getDate();
  
  // Major festivals
  const festivals = [
    { month: 10, day: 1 },  // Diwali (approx)
    { month: 2, day: 8 },   // Holi (approx)
    { month: 7, day: 15 },  // Independence Day
  ];
  
  return festivals.some(f => f.month === month && Math.abs(f.day - day) < 3);
}

// Helper: Calculate age from date of birth
function calculateAge(dob: string): number {
  if (!dob) return 25;
  
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Helper: Format date for lastDonationDate
function formatDate(timestamp: any): string {
  if (!timestamp) return '01-01-2023';
  
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
}