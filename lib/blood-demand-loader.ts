// lib/blood-demand-loader.ts
import Papa from 'papaparse';
import type { BloodDemandCSVRow, BloodDemandData } from '@/types/blood-demand';

function parseCSVRowToData(row: BloodDemandCSVRow): BloodDemandData {
  return {
    date: new Date(row.Date),
    dayOfWeek: parseInt(row.DayOfWeek),
    month: parseInt(row.Month),
    population: parseInt(row.Population),
    events: parseInt(row.Events),
    historicalUsage: parseInt(row.HistoricalBloodUsage),
    hospitalAdmissions: parseInt(row.HospitalAdmissions),
    donorsAvailable: parseInt(row.BloodDonorsAvailable),
    temperature: parseFloat(row.Temperature),
    actualDemand: parseInt(row.PredictedBloodDemand),
  };
}

export async function loadBloodDemandData(
  filePath: string = '/blood_demand_data.csv'
): Promise<BloodDemandData[]> {
  try {
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse<BloodDemandCSVRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const data = results.data
              .filter(row => row.Date && row.PredictedBloodDemand)
              .map(parseCSVRowToData);
            
            console.log(`✅ Loaded ${data.length} blood demand records`);
            resolve(data);
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
    console.error('❌ Error loading blood demand data:', error);
    throw error;
  }
}

export function getDateRange(data: BloodDemandData[]): { min: Date; max: Date } {
  const dates = data.map(d => d.date.getTime());
  return {
    min: new Date(Math.min(...dates)),
    max: new Date(Math.max(...dates)),
  };
}

export function getStatistics(data: BloodDemandData[]) {
  const demands = data.map(d => d.actualDemand);
  const populations = data.map(d => d.population);
  
  return {
    avgDemand: Math.round(demands.reduce((a, b) => a + b, 0) / demands.length),
    maxDemand: Math.max(...demands),
    minDemand: Math.min(...demands),
    avgPopulation: Math.round(populations.reduce((a, b) => a + b, 0) / populations.length),
    totalRecords: data.length,
  };
}