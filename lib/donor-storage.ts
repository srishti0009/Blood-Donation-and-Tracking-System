// lib/donor-storage.ts

export interface RegisteredDonor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bloodGroup: string;
  weight: string;
  hemoglobin: string;
  lastDonationDate: string;
  totalDonations: string;
  medicalCondition: string;
  medications: string;
  allergies: string;
  chronicDiseases: string;
  emergencyContact: string;
  emergencyPhone: string;
  donationCenter: string;
  registrationDate: string;
  isVerified: boolean;
  status: 'active' | 'inactive';
}

/**
 * Load all registered donors from localStorage
 */
export function loadRegisteredDonors(): RegisteredDonor[] {
  try {
    if (typeof window === 'undefined') {
      return []; // SSR safety
    }

    // Get list of donor IDs
    const donorListStr = localStorage.getItem('donor-list');
    
    if (!donorListStr) {
      console.log('No registered donors found');
      return [];
    }

    const donorIds: string[] = JSON.parse(donorListStr);
    const donors: RegisteredDonor[] = [];

    // Load each donor's data
    for (const id of donorIds) {
      try {
        const donorStr = localStorage.getItem(`donor:${id}`);
        if (donorStr) {
          donors.push(JSON.parse(donorStr));
        }
      } catch (error) {
        console.warn(`Failed to load donor ${id}:`, error);
      }
    }

    console.log(`✅ Loaded ${donors.length} registered donors from localStorage`);
    return donors;
  } catch (error) {
    console.error('❌ Error loading registered donors:', error);
    return [];
  }
}

/**
 * Convert registered donor to Donor type (for matching)
 */
export function convertToDonor(registered: RegisteredDonor): any {
  return {
    id: registered.id,
    name: registered.fullName,
    gender: registered.gender,
    age: calculateAge(registered.dateOfBirth),
    bloodGroup: registered.bloodGroup,
    contact: registered.phone,
    email: registered.email,
    city: registered.city,
    state: registered.state,
    country: 'India',
    lastDonationDate: registered.lastDonationDate || '01-01-2020',
    totalDonations: parseInt(registered.totalDonations) || 0,
    isEligible: registered.status === 'active',
    medicalCondition: registered.medicalCondition || 'None',
    weight: parseFloat(registered.weight) || 50,
    hemoglobin: parseFloat(registered.hemoglobin) || 12.5,
    donationCenter: registered.donationCenter || 'Local Blood Bank',
    registrationDate: registered.registrationDate,
  };
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get current user's donor profile
 */
export function getCurrentDonorProfile(): RegisteredDonor | null {
  try {
    if (typeof window === 'undefined') {
      return null; // SSR safety
    }

    const donorListStr = localStorage.getItem('donor-list');
    
    if (!donorListStr) return null;

    const donorIds: string[] = JSON.parse(donorListStr);
    if (donorIds.length === 0) return null;

    // Get last registered donor
    const lastId = donorIds[donorIds.length - 1];
    const donorStr = localStorage.getItem(`donor:${lastId}`);
    
    return donorStr ? JSON.parse(donorStr) : null;
  } catch (error) {
    console.error('Error getting current donor profile:', error);
    return null;
  }
}

/**
 * Update donor profile
 */
export function updateDonorProfile(donorId: string, updates: Partial<RegisteredDonor>): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }

    const donorStr = localStorage.getItem(`donor:${donorId}`);
    if (!donorStr) return false;

    const donor = JSON.parse(donorStr);
    const updated = { ...donor, ...updates };
    
    localStorage.setItem(`donor:${donorId}`, JSON.stringify(updated));
    console.log(`✅ Donor ${donorId} updated`);
    return true;
  } catch (error) {
    console.error('Error updating donor:', error);
    return false;
  }
}