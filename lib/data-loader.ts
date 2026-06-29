// lib/data-loader.ts
import Papa from 'papaparse';
import type { DonorCSVRow, Donor } from '@/types/donor';

function parseCSVRowToDonor(row: DonorCSVRow): Donor {
  return {
    id: row.Donor_ID,
    name: row.Full_Name,
    gender: row.Gender,
    age: parseInt(row.Age) || 0,
    bloodGroup: row.Blood_Group.trim(),
    contact: row.Contact_Number,
    email: row.Email,
    city: row.City.trim(),
    state: row.State.trim(),
    country: row.Country.trim(),
    lastDonationDate: row.Last_Donation_Date,
    totalDonations: parseInt(row.Total_Donations) || 0,
    isEligible: row.Eligible_for_Donation.toLowerCase() === 'yes',
    medicalCondition: row.Medical_Condition,
    weight: parseFloat(row.Weight_kg) || 0,
    hemoglobin: parseFloat(row.Hemoglobin_g_dL) || 0,
    donationCenter: row.Donation_Center,
    registrationDate: row.Registration_Date,
  };
}

export async function loadDonorsFromCSV(filePath: string = '/blood_demand.csv'): Promise<Donor[]> {
  try {
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse<DonorCSVRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const donors = results.data
              .filter(row => row.Donor_ID && row.Full_Name)
              .map(parseCSVRowToDonor);
            
            console.log(`✅ Loaded ${donors.length} donors from CSV`);
            resolve(donors);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        },
      });
    });
  } catch (error) {
    console.error('❌ Error loading donors:', error);
    throw error;
  }
}

export function getUniqueCities(donors: Donor[]): string[] {
  const cities = new Set<string>();
  donors.forEach(donor => {
    if (donor.city) {
      cities.add(donor.city);
    }
  });
  return Array.from(cities).sort();
}

export function getUniqueStates(donors: Donor[]): string[] {
  const states = new Set<string>();
  donors.forEach(donor => {
    if (donor.state) {
      states.add(donor.state);
    }
  });
  return Array.from(states).sort();
}

export function getBloodGroupStats(donors: Donor[]): Record<string, number> {
  const stats: Record<string, number> = {};
  donors.forEach(donor => {
    const bg = donor.bloodGroup;
    stats[bg] = (stats[bg] || 0) + 1;
  });
  return stats;
}