// lib/donor-matching.ts
import type { Donor, MatchedDonor, SearchFilters, BloodCompatibility } from '@/types/donor';

const BLOOD_COMPATIBILITY: BloodCompatibility = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

export function isBloodCompatible(donorBloodGroup: string, requiredBloodGroup: string): boolean {
  const compatibleWith = BLOOD_COMPATIBILITY[donorBloodGroup];
  return compatibleWith ? compatibleWith.includes(requiredBloodGroup) : false;
}

export function getDaysSinceLastDonation(lastDonationDate: string): number {
  try {
    const parts = lastDonationDate.split('-');
    const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    return 999;
  }
}

export function isDonorEligibleByDate(lastDonationDate: string): boolean {
  const days = getDaysSinceLastDonation(lastDonationDate);
  return days >= 90;
}

export function calculateCityDistance(city1: string, city2: string, state1: string, state2: string): number {
  if (city1.toLowerCase() === city2.toLowerCase()) {
    return 0;
  }
  
  if (state1.toLowerCase() === state2.toLowerCase()) {
    return 75;
  }
  
  const majorCityDistances: Record<string, Record<string, number>> = {
    'delhi': { 'jaipur': 280, 'kolkata': 1400, 'mumbai': 1400, 'bangalore': 2150 },
    'mumbai': { 'pune': 150, 'bangalore': 980, 'delhi': 1400, 'kolkata': 2000 },
    'kolkata': { 'delhi': 1400, 'mumbai': 2000, 'bangalore': 1900 },
    'bangalore': { 'mumbai': 980, 'delhi': 2150, 'kolkata': 1900 },
  };
  
  const c1 = city1.toLowerCase();
  const c2 = city2.toLowerCase();
  
  if (majorCityDistances[c1] && majorCityDistances[c1][c2]) {
    return majorCityDistances[c1][c2];
  }
  
  if (majorCityDistances[c2] && majorCityDistances[c2][c1]) {
    return majorCityDistances[c2][c1];
  }
  
  return 300;
}

export function calculateMatchScore(
  donor: Donor,
  filters: SearchFilters,
  distance: number
): number {
  let score = 100;
  
  if (donor.bloodGroup === filters.bloodGroup) {
    score += 30;
  } else if (isBloodCompatible(donor.bloodGroup, filters.bloodGroup)) {
    score += 15;
  } else {
    return 0;
  }
  
  const maxDistance = filters.maxDistance || 500;
  if (distance > maxDistance) {
    return 0;
  }
  const distancePenalty = (distance / maxDistance) * 25;
  score -= distancePenalty;
  
  if (donor.isEligible && isDonorEligibleByDate(donor.lastDonationDate)) {
    score += 20;
  } else {
    score -= 30;
  }
  
  if (donor.medicalCondition.toLowerCase() === 'none') {
    score += 15;
  } else {
    score -= 20;
  }
  
  if (donor.weight >= 50 && donor.hemoglobin >= 12.5) {
    score += 10;
  } else {
    score -= 15;
  }
  
  if (donor.totalDonations >= 10) {
    score += 5;
  } else if (donor.totalDonations >= 5) {
    score += 3;
  }
  
  if (filters.urgency === 'critical') {
    score -= (distance / 50) * 20;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getEligibilityStatus(donor: Donor): 'eligible' | 'not-eligible' | 'check-required' {
  if (!donor.isEligible) {
    return 'not-eligible';
  }
  
  if (!isDonorEligibleByDate(donor.lastDonationDate)) {
    return 'not-eligible';
  }
  
  if (donor.medicalCondition.toLowerCase() !== 'none') {
    return 'check-required';
  }
  
  if (donor.weight < 50 || donor.hemoglobin < 12.5) {
    return 'check-required';
  }
  
  return 'eligible';
}

export function matchDonors(
  allDonors: Donor[],
  filters: SearchFilters
): MatchedDonor[] {
  const matched: MatchedDonor[] = [];
  
  allDonors.forEach(donor => {
    if (!isBloodCompatible(donor.bloodGroup, filters.bloodGroup)) {
      return;
    }
    
    if (filters.onlyEligible && !donor.isEligible) {
      return;
    }
    
    const distance = calculateCityDistance(
      donor.city,
      filters.userCity,
      donor.state,
      filters.userState || ''
    );
    
    const matchScore = calculateMatchScore(donor, filters, distance);
    
    if (matchScore > 0) {
      matched.push({
        ...donor,
        distance,
        matchScore,
        compatibility: donor.bloodGroup === filters.bloodGroup ? 'exact' : 'compatible',
        eligibilityStatus: getEligibilityStatus(donor),
        daysSinceLastDonation: getDaysSinceLastDonation(donor.lastDonationDate),
      });
    }
  });
  
  matched.sort((a, b) => {
    if (filters.urgency === 'critical') {
      return a.distance - b.distance;
    }
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.distance - b.distance;
  });
  
  return matched;
}