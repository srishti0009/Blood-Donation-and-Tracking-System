"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Search, 
  Phone, 
  Clock, 
  Navigation, 
  Hospital,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Blood Bank Data Type
interface BloodBank {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  latitude: number;
  longitude: number;
  distance?: number;
  availableBloodTypes: string[];
}

// Sample Blood Bank Data (India ke major cities)
const bloodBanksData: BloodBank[] = [
  // Delhi
  {
    id: "BB001",
    name: "AIIMS Blood Bank",
    city: "Delhi",
    address: "All India Institute of Medical Sciences, Ansari Nagar, New Delhi",
    phone: "011-26588500",
    hours: "24/7",
    latitude: 28.5672,
    longitude: 77.2100,
    availableBloodTypes: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  },
  {
    id: "BB002",
    name: "Safdarjung Hospital Blood Bank",
    city: "Delhi",
    address: "Vardhman Mahavir Medical College, New Delhi",
    phone: "011-26165060",
    hours: "24/7",
    latitude: 28.5678,
    longitude: 77.2065,
    availableBloodTypes: ["A+", "B+", "O+", "AB+"]
  },
  {
    id: "BB003",
    name: "Red Cross Blood Bank Delhi",
    city: "Delhi",
    address: "Red Cross Building, Mandir Marg, New Delhi",
    phone: "011-23711551",
    hours: "9:00 AM - 5:00 PM",
    latitude: 28.6289,
    longitude: 77.2065,
    availableBloodTypes: ["A+", "A-", "B+", "O+", "O-"]
  },

  // Mumbai
  {
    id: "BB004",
    name: "KEM Hospital Blood Bank",
    city: "Mumbai",
    address: "Acharya Donde Marg, Parel, Mumbai",
    phone: "022-24107000",
    hours: "24/7",
    latitude: 19.0176,
    longitude: 72.8562,
    availableBloodTypes: ["A+", "A-", "B+", "B-", "AB+", "O+", "O-"]
  },
  {
    id: "BB005",
    name: "Tata Memorial Hospital Blood Bank",
    city: "Mumbai",
    address: "Dr. E Borges Road, Parel, Mumbai",
    phone: "022-24177000",
    hours: "24/7",
    latitude: 19.0090,
    longitude: 72.8426,
    availableBloodTypes: ["A+", "B+", "AB+", "O+"]
  },
  {
    id: "BB006",
    name: "Lilavati Hospital Blood Bank",
    city: "Mumbai",
    address: "A-791, Bandra Reclamation, Mumbai",
    phone: "022-26567891",
    hours: "24/7",
    latitude: 19.0596,
    longitude: 72.8295,
    availableBloodTypes: ["A+", "A-", "B+", "O+", "O-"]
  },

  // Bangalore
  {
    id: "BB007",
    name: "Victoria Hospital Blood Bank",
    city: "Bangalore",
    address: "Fort, Bangalore",
    phone: "080-26700721",
    hours: "24/7",
    latitude: 12.9716,
    longitude: 77.5946,
    availableBloodTypes: ["A+", "B+", "AB+", "O+", "O-"]
  },
  {
    id: "BB008",
    name: "Nimhans Blood Bank",
    city: "Bangalore",
    address: "Hosur Road, Bangalore",
    phone: "080-26995000",
    hours: "9:00 AM - 5:00 PM",
    latitude: 12.9438,
    longitude: 77.5965,
    availableBloodTypes: ["A+", "B+", "O+"]
  },

  // Chennai
  {
    id: "BB009",
    name: "Government General Hospital Blood Bank",
    city: "Chennai",
    address: "EVR Periyar Salai, Park Town, Chennai",
    phone: "044-25305000",
    hours: "24/7",
    latitude: 13.0827,
    longitude: 80.2707,
    availableBloodTypes: ["A+", "A-", "B+", "B-", "AB+", "O+", "O-"]
  },
  {
    id: "BB010",
    name: "Apollo Hospital Blood Bank",
    city: "Chennai",
    address: "Greams Lane, Off Greams Road, Chennai",
    phone: "044-28296000",
    hours: "24/7",
    latitude: 13.0569,
    longitude: 80.2499,
    availableBloodTypes: ["A+", "B+", "AB+", "O+"]
  },

  // Kolkata
  {
    id: "BB011",
    name: "NRS Medical College Blood Bank",
    city: "Kolkata",
    address: "138, AJC Bose Road, Kolkata",
    phone: "033-22651632",
    hours: "24/7",
    latitude: 22.5726,
    longitude: 88.3639,
    availableBloodTypes: ["A+", "B+", "O+", "AB+"]
  },

  // Hyderabad
  {
    id: "BB012",
    name: "Gandhi Hospital Blood Bank",
    city: "Hyderabad",
    address: "Musheerabad, Hyderabad",
    phone: "040-27541111",
    hours: "24/7",
    latitude: 17.4399,
    longitude: 78.4983,
    availableBloodTypes: ["A+", "A-", "B+", "O+", "O-"]
  },

  // Pune
  {
    id: "BB013",
    name: "Sassoon Hospital Blood Bank",
    city: "Pune",
    address: "Near Pune Railway Station, Pune",
    phone: "020-26127301",
    hours: "24/7",
    latitude: 18.5204,
    longitude: 73.8567,
    availableBloodTypes: ["A+", "B+", "AB+", "O+"]
  },

  // Ahmedabad
  {
    id: "BB014",
    name: "Civil Hospital Blood Bank",
    city: "Ahmedabad",
    address: "Asarwa, Ahmedabad",
    phone: "079-22686000",
    hours: "24/7",
    latitude: 23.0225,
    longitude: 72.5714,
    availableBloodTypes: ["A+", "B+", "O+", "AB+"]
  },

  // Jaipur
  {
    id: "BB015",
    name: "SMS Hospital Blood Bank",
    city: "Jaipur",
    address: "JLN Marg, Jaipur",
    phone: "0141-2560291",
    hours: "24/7",
    latitude: 26.9124,
    longitude: 75.7873,
    availableBloodTypes: ["A+", "B+", "O+"]
  }
];

export default function EmergencyBloodBankPage() {
  const [searchCity, setSearchCity] = useState('');
  const [filteredBanks, setFilteredBanks] = useState<BloodBank[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [nearbyBanks, setNearbyBanks] = useState<BloodBank[]>([]);

  // Get user's current location
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    setLoading(true);
    setLocationError('');

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation({ lat: userLat, lng: userLng });
          
          // Calculate distances and get nearby banks
          const banksWithDistance = calculateDistances(userLat, userLng);
          const nearby = banksWithDistance
            .filter(bank => bank.distance! < 50) // Within 50km
            .sort((a, b) => a.distance! - b.distance!)
            .slice(0, 5); // Top 5 nearest
          
          setNearbyBanks(nearby);
          setFilteredBanks(nearby);
          setLoading(false);
        },
        (error) => {
          setLocationError('Unable to get your location. Please search by city.');
          setFilteredBanks(bloodBanksData.slice(0, 5));
          setLoading(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
      setFilteredBanks(bloodBanksData.slice(0, 5));
      setLoading(false);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };

  const calculateDistances = (userLat: number, userLng: number): BloodBank[] => {
    return bloodBanksData.map(bank => ({
      ...bank,
      distance: calculateDistance(userLat, userLng, bank.latitude, bank.longitude)
    }));
  };

  // Search by city
  const handleSearch = () => {
    if (searchCity.trim() === '') {
      if (nearbyBanks.length > 0) {
        setFilteredBanks(nearbyBanks);
      } else {
        setFilteredBanks(bloodBanksData.slice(0, 5));
      }
      return;
    }

    const results = bloodBanksData.filter(bank => 
      bank.city.toLowerCase().includes(searchCity.toLowerCase()) ||
      bank.name.toLowerCase().includes(searchCity.toLowerCase())
    );

    setFilteredBanks(results);
  };

  // Get directions
  const getDirections = (bank: BloodBank) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${bank.latitude},${bank.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-red-600 mb-2 flex items-center gap-2">
          <Hospital className="h-10 w-10" />
          Emergency Blood Banks
        </h1>
        <p className="text-gray-600">
          Find blood banks near you or search by city
        </p>
      </div>

      {/* Location Status */}
      {locationError && (
        <Alert className="mb-6 border-orange-300 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {locationError}
          </AlertDescription>
        </Alert>
      )}

      {userLocation && nearbyBanks.length > 0 && (
        <Alert className="mb-6 border-green-300 bg-green-50">
          <MapPin className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Showing {nearbyBanks.length} blood banks near your location
          </AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by city name (e.g., Delhi, Mumbai, Bangalore)..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-red-600 hover:bg-red-700"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button 
              onClick={getUserLocation}
              variant="outline"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              Near Me
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredBanks.length > 0 ? (
          <p>Found {filteredBanks.length} blood bank{filteredBanks.length > 1 ? 's' : ''}</p>
        ) : (
          <p>No blood banks found. Try a different search.</p>
        )}
      </div>

      {/* Blood Banks List */}
      <div className="grid gap-6">
        {filteredBanks.map((bank) => (
          <Card key={bank.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Hospital className="h-5 w-5 text-red-600" />
                    {bank.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {bank.city}
                    </span>
                    {bank.distance && (
                      <Badge className="ml-2 bg-green-100 text-green-800">
                        {bank.distance.toFixed(1)} km away
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <Badge 
                  variant={bank.hours === '24/7' ? 'default' : 'secondary'}
                  className={bank.hours === '24/7' ? 'bg-green-600' : ''}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {bank.hours}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Address */}
                <div>
                  <p className="text-sm text-gray-600">{bank.address}</p>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <a 
                    href={`tel:${bank.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {bank.phone}
                  </a>
                </div>

                {/* Available Blood Types */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Available Blood Types:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {bank.availableBloodTypes.map((type) => (
                      <Badge 
                        key={type} 
                        variant="outline"
                        className="border-red-300 text-red-700"
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => getDirections(bank)}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`tel:${bank.phone}`)}
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredBanks.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Hospital className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Blood Banks Found
            </h3>
            <p className="text-gray-500 mb-4">
              Try searching for a different city or allow location access
            </p>
            <Button onClick={() => setSearchCity('')} variant="outline">
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
// ```

// ---

// ## ✨ Features

// 1. **🎯 Auto Location Detection** - Jahan aap ho wahan ke paas ke blood banks automatically show honge
// 2. **🔍 City Search** - City naam se search kar sakte ho
// 3. **📍 Distance Calculation** - Aapse kitni door hai ye bhi dikhega
// 4. **📞 Direct Call** - Click karke directly call kar sakte ho
// 5. **🗺️ Google Maps** - Directions ke liye Google Maps open hoga
// 6. **⏰ Opening Hours** - 24/7 ya timing dikhegi
// 7. **🩸 Blood Types** - Kaunse blood type available hain

// ---

// ## 🚀 Kaise Kaam Karta Hai?

// ### **Auto Location (Near Me)**
// ```
// 1. Page load → Browser location permission maangega
// 2. Permission dene par → Aapka lat/lng milega
// 3. Calculation → Sabhi blood banks se distance calculate hoga
// 4. Display → Paas ke 5 blood banks dikhaenge (50km ke andar)
// ```

// ### **City Search**
// ```
// 1. City naam type karein (e.g., "Mumbai")
// 2. Search button click karein
// 3. Us city ke saare blood banks dikhaenge
// ```

// ---

// ## 📊 Data Structure

// Abhi maine **15 cities** ke blood banks add kiye hain:
// - Delhi (3 banks)
// - Mumbai (3 banks)
// - Bangalore (2 banks)
// - Chennai (2 banks)
// - Kolkata, Hyderabad, Pune, Ahmedabad, Jaipur (1 each)

// **Aur blood banks add karne hain?** Bas `bloodBanksData` array mein naye objects add kar dein!

// ---

// ## ✅ Installation

// Koi naya package install karne ki zarurat nahi! Saare UI components pehle se hain.

// Bas ye file create/replace kar dein:
// ```
// app/emergency/page.tsx