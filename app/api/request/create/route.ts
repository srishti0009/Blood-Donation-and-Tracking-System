// app/api/request/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-config';
import { collection, addDoc, Timestamp, getDocs, query, where, updateDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.bloodType || !body.units || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields: bloodType, units, location' },
        { status: 400 }
      );
    }

    // Generate unique request ID
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Prepare request data
    const requestData = {
      id: requestId,
      requestDate: Timestamp.now(),
      bloodType: body.bloodType,
      units: parseInt(body.units),
      urgency: body.urgency || 'medium',
      location: body.location,
      hospital: body.hospital || '',
      fulfilled: false,
      patientAge: body.patientAge || null,
      contactName: body.contactName || '',
      contactPhone: body.contactPhone || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Add to Firebase
    const docRef = await addDoc(collection(db, 'requests'), requestData);

    console.log('✅ New blood request created:', {
      firestoreId: docRef.id,
      requestId: requestId,
      bloodType: body.bloodType,
      units: body.units,
      location: body.location,
      urgency: body.urgency
    });

    // Update blood_demand collection (increase demand)
    await updateBloodDemand(body.location, body.bloodType, parseInt(body.units));

    return NextResponse.json({
      success: true,
      message: 'Blood request created successfully',
      request: {
        id: requestId,
        firestoreId: docRef.id,
        bloodType: body.bloodType,
        units: body.units
      }
    });

  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to update blood demand
async function updateBloodDemand(location: string, bloodType: string, units: number) {
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
      // Create new demand record
      await addDoc(demandRef, {
        date: today,
        location: location,
        bloodType: bloodType,
        demand: units,
        supply: 0,
        shortage: units,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } else {
      // Update existing record
      const demandDoc = snapshot.docs[0];
      const currentData = demandDoc.data();
      const newDemand = (currentData.demand || 0) + units;
      const supply = currentData.supply || 0;
      await updateDoc(demandDoc.ref, {
        demand: newDemand,
        shortage: Math.max(0, newDemand - supply),
        updatedAt: Timestamp.now()
      });
    }
    
    console.log(`✅ Updated blood demand: ${location} - ${bloodType} (+${units} units)`);
  } catch (error) {
    console.error('Error updating blood demand:', error);
  }
}

// GET method to fetch all requests
export async function GET(request: NextRequest) {
  try {
    const requestsRef = collection(db, 'requests');
    const snapshot = await getDocs(requestsRef);
    
    const requests = snapshot.docs.map(doc => ({
      firestoreId: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      count: requests.length,
      requests: requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}