import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-config';
import { collection, addDoc, Timestamp, getDocs, query, where, updateDoc } from 'firebase/firestore';

// POST - Register new donor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.bloodType || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields: name, bloodType, location' },
        { status: 400 }
      );
    }

    const donorId = `DONOR-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const age = body.age || 25;
    const weight = body.weight || 50;
    const lastDonation = body.lastDonation ? new Date(body.lastDonation) : null;
    
    let eligibility = true;
    
    // Age check (18-65)
    if (age < 18 || age > 65) {
      eligibility = false;
    }
    
    // Weight check (>= 50kg)
    if (weight < 50) {
      eligibility = false;
    }
    
    // Last donation check (3 months gap)
    if (lastDonation) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      if (lastDonation > threeMonthsAgo) {
        eligibility = false;
      }
    }

    const donorData = {
      id: donorId,
      name: body.name,
      bloodType: body.bloodType,
      age: age,
      location: body.location,
      eligibility: eligibility,
      lastDonation: lastDonation ? Timestamp.fromDate(lastDonation) : null,
      registrationDate: Timestamp.now(),
      phone: body.phone || '',
      email: body.email || '',
      weight: weight,
      medicalConditions: body.medicalConditions || [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'donors'), donorData);

    console.log('✅ New donor registered:', {
      firestoreId: docRef.id,
      donorId: donorId,
      name: body.name,
      bloodType: body.bloodType,
      location: body.location,
      eligibility: eligibility
    });

    await updateBloodSupply(body.location, body.bloodType, 1);

    return NextResponse.json({
      success: true,
      message: 'Donor registered successfully',
      donor: {
        id: donorId,
        firestoreId: docRef.id,
        name: body.name,
        bloodType: body.bloodType,
        eligibility: eligibility,
        age: age,
        location: body.location,
        phone: body.phone || '',
        email: body.email || ''
      }
    });

  } catch (error) {
    console.error('Error registering donor:', error);
    return NextResponse.json(
      { 
        error: 'Failed to register donor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to update blood supply
async function updateBloodSupply(location: string, bloodType: string, increment: number) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const demandRef = collection(db, 'blood_demand');
    const q = query(
      demandRef,
      where('date', '==', today),
      where('location', '==', location),
      where('bloodType', '==', bloodType)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      await addDoc(demandRef, {
        date: today,
        location: location,
        bloodType: bloodType,
        demand: 0,
        supply: increment,
        shortage: 0 - increment,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } else {
      const demandDoc = snapshot.docs[0];
      const currentData = demandDoc.data();
      await updateDoc(demandDoc.ref, {
        supply: (currentData.supply || 0) + increment,
        shortage: Math.max(0, (currentData.demand || 0) - ((currentData.supply || 0) + increment)),
        updatedAt: Timestamp.now()
      });
    }
    
    console.log(`✅ Updated blood supply: ${location} - ${bloodType} (+${increment})`);
  } catch (error) {
    console.error('Error updating blood supply:', error);
  }
}

// GET - Fetch all donors
export async function GET(request: NextRequest) {
  try {
    const donorsRef = collection(db, 'donors');
    const snapshot = await getDocs(donorsRef);
    
    const donors = snapshot.docs.map(doc => ({
      firestoreId: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      count: donors.length,
      donors: donors
    });
  } catch (error) {
    console.error('Error fetching donors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donors' },
      { status: 500 }
    );
  }
}