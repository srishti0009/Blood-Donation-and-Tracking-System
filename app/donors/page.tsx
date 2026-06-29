"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Droplet, MapPin, Heart, ArrowLeft, X, Phone, Mail, 
  Calendar, Activity, CheckCircle, AlertCircle, Search, 
  Filter, Brain, Zap, TrendingUp, Users
} from "lucide-react"

interface Donor {
  id: string
  firestoreId?: string
  name: string
  bloodType: string
  age: number
  location: string
  phone: string
  email: string
  eligibility: boolean
  weight?: number
  lastDonation?: any
  registrationDate?: any
  gender?: string
  totalDonations?: number
}

interface MatchedDonor extends Donor {
  matchScore: number
  matchType: 'exact' | 'compatible' | 'nearby'
  distance?: number
}

export default function DonorsPage() {
  const [allDonors, setAllDonors] = useState<Donor[]>([])
  const [matchedDonors, setMatchedDonors] = useState<MatchedDonor[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  
  const [filters, setFilters] = useState({
    bloodType: 'O+',
    location: '',
  })
  
  const [selectedDonor, setSelectedDonor] = useState<MatchedDonor | null>(null)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [nameSearch, setNameSearch] = useState("")

  // Load all donors from Firebase on mount
  useEffect(() => {
    loadDonorsFromFirebase()
  }, [])

  const loadDonorsFromFirebase = async () => {
    try {
      setLoading(true)
      
      // Direct Firebase import - bypasses API completely
      const { getDocs, collection } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase-config')
      
      console.log('📥 Loading donors directly from Firebase (no API)...')
      
      const donorsRef = collection(db, 'donors')
      const snapshot = await getDocs(donorsRef)
      
      const donors: Donor[] = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          firestoreId: doc.id,
          id: data.id || doc.id,
          name: data.name || 'Unknown',
          bloodType: data.bloodType || 'O+',
          age: data.age || 25,
          location: data.location || 'Unknown',
          phone: data.phone || '',
          email: data.email || '',
          eligibility: data.eligibility !== false,
          weight: data.weight,
          lastDonation: data.lastDonation,
          registrationDate: data.registrationDate,
          gender: data.gender,
          totalDonations: data.totalDonations
        }
      })

      console.log(`✅ Loaded ${donors.length} donors directly from Firebase`)
      setAllDonors(donors)
      
    } catch (error) {
      console.error('❌ Firebase error:', error)
      setAllDonors([])
      alert('Failed to load donors. Check Firebase connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!filters.location) {
      alert('Please enter a location')
      return
    }
    
    setSearching(true)
    
    try {
      console.log('🔍 Searching donors...', filters)

      // DIRECT FIREBASE - NO API CALL
      const { getDocs, collection, query, where } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase-config')
      
      const donorsRef = collection(db, 'donors')
      
      // Query Firebase directly
      const q = query(
        donorsRef,
        where('bloodType', '==', filters.bloodType),
        where('location', '==', filters.location),
        where('eligibility', '==', true)
      )
      
      const snapshot = await getDocs(q)
      
      // Map results
      const matched: MatchedDonor[] = snapshot.docs.map(doc => {
        const data = doc.data()
        const donor: Donor = {
          firestoreId: doc.id,
          id: data.id || doc.id,
          name: data.name || 'Unknown',
          bloodType: data.bloodType || 'O+',
          age: data.age || 25,
          location: data.location || 'Unknown',
          phone: data.phone || '',
          email: data.email || '',
          eligibility: data.eligibility !== false,
          weight: data.weight,
          lastDonation: data.lastDonation,
          registrationDate: data.registrationDate
        }
        
        return {
          ...donor,
          matchScore: calculateMatchScore(donor, filters),
          matchType: 'exact' as const,
          distance: 0
        }
      })
      
      // Sort by match score
      matched.sort((a, b) => b.matchScore - a.matchScore)
      
      console.log(`✅ Found ${matched.length} matching donors`)
      setMatchedDonors(matched)
      
    } catch (error) {
      console.error('Search error:', error)
      alert('Search failed. Check console.')
    } finally {
      setSearching(false)
    }
  }

  const calculateMatchScore = (donor: any, filters: any): number => {
    let score = 50 // Base score

    // Exact blood type match
    if (donor.bloodType === filters.bloodType) {
      score += 30
    }

    // Same location
    if (donor.location.toLowerCase() === filters.location.toLowerCase()) {
      score += 20
    }

    // Eligibility
    if (donor.eligibility) {
      score += 10
    }

    // Age factor (prefer 18-50)
    if (donor.age >= 18 && donor.age <= 50) {
      score += 5
    }

    return Math.min(100, score)
  }

  const displayedDonors = nameSearch
    ? matchedDonors.filter(d => 
        d.name.toLowerCase().includes(nameSearch.toLowerCase())
      )
    : matchedDonors

  const getMatchTypeBadge = (matchType: string) => {
    switch (matchType) {
      case 'exact':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Exact Match</span>
      case 'compatible':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Compatible</span>
      case 'nearby':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Nearby</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-text-muted">Loading donors from Firebase...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="container mx-auto py-12 px-4">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back Home
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold">Find Blood Donors</h1>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
              <CheckCircle size={16} />
              Firebase Live
            </span>
          </div>
          <p className="text-text-muted text-lg">
            Search from {allDonors.length} registered donors in real-time
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="card-glass p-4">
            <div className="text-2xl font-bold text-primary">{allDonors.length}</div>
            <div className="text-sm text-text-muted">Total Donors</div>
          </Card>
          <Card className="card-glass p-4">
            <div className="text-2xl font-bold text-green-600">
              {allDonors.filter(d => d.eligibility).length}
            </div>
            <div className="text-sm text-text-muted">Eligible</div>
          </Card>
          <Card className="card-glass p-4">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(allDonors.map(d => d.location)).size}
            </div>
            <div className="text-sm text-text-muted">Cities</div>
          </Card>
          <Card className="card-glass p-4">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(allDonors.map(d => d.bloodType)).size}
            </div>
            <div className="text-sm text-text-muted">Blood Types</div>
          </Card>
        </div>

        {/* Search Filters */}
        <Card className="card-glass p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Search Filters</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Blood Type *</label>
              <select
                value={filters.bloodType}
                onChange={(e) => setFilters({...filters, bloodType: e.target.value})}
                className="w-full px-4 py-2 rounded bg-background border border-border text-foreground"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <Input
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                placeholder="Enter city name (e.g., Mumbai)"
                className="bg-background"
              />
            </div>
          </div>

          <Button 
            className="w-full md:w-auto bg-primary hover:bg-primary-hover"
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching Firebase...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Donors
              </>
            )}
          </Button>
        </Card>

        {/* Name Filter */}
        {matchedDonors.length > 0 && (
          <Card className="card-glass p-4 mb-6">
            <Input
              placeholder="Filter by donor name..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="bg-background/50"
            />
          </Card>
        )}

        {/* Results Stats */}
        {matchedDonors.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">
              Found {displayedDonors.length} Donor{displayedDonors.length !== 1 ? 's' : ''}
            </h2>
          </div>
        )}

        {/* Donors Grid */}
        {matchedDonors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedDonors.map((donor) => (
              <Card key={donor.id} className="card-glass p-6 hover:shadow-lg transition-shadow relative overflow-hidden">
                {/* Match Score Badge */}
                {donor.matchScore >= 80 && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                      {donor.matchScore}% Match
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{donor.name[0]}</span>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                      {donor.bloodType}
                    </span>
                    {getMatchTypeBadge(donor.matchType)}
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-1">{donor.name}</h3>
                <p className="text-sm text-text-muted mb-4">{donor.age} years</p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-text-muted">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{donor.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span>{donor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted">
                    <Mail className="w-4 h-4 text-green-500" />
                    <span className="truncate">{donor.email}</span>
                  </div>
                  {donor.eligibility && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Eligible to Donate</span>
                    </div>
                  )}
                </div>

                {/* Match Score Bar */}
                <div className="w-full bg-border rounded-full h-2 mb-4">
                  <div 
                    className={`h-full rounded-full ${
                      donor.matchScore >= 80 ? 'bg-green-500' :
                      donor.matchScore >= 60 ? 'bg-blue-500' :
                      'bg-orange-500'
                    }`}
                    style={{ width: `${donor.matchScore}%` }} 
                  />
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary-hover"
                  onClick={() => {
                    setSelectedDonor(donor)
                    setContactModalOpen(true)
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Donor
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-glass p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-text-muted mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {matchedDonors.length === 0 && !searching
                ? 'Ready to Search'
                : 'No Donors Found'}
            </h3>
            <p className="text-text-muted">
              {matchedDonors.length === 0 && !searching
                ? 'Use the filters above and click "Search Donors"'
                : 'Try different blood type or location'}
            </p>
          </Card>
        )}

        {/* Contact Modal */}
        {selectedDonor && contactModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="card-glass w-full max-w-md p-6 relative">
              <button
                onClick={() => setContactModalOpen(false)}
                className="absolute top-4 right-4"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Droplet className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-1">{selectedDonor.name}</h2>
                <p className="text-text-muted">{selectedDonor.bloodType} • {selectedDonor.location}</p>
              </div>

              <div className="space-y-3">
                <a
                  href={`tel:${selectedDonor.phone}`}
                  className="flex items-center gap-3 p-4 bg-background/50 rounded hover:bg-background/70 transition-colors"
                >
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Call</p>
                    <p className="text-xs text-text-muted">{selectedDonor.phone}</p>
                  </div>
                </a>
                
                <a
                  href={`mailto:${selectedDonor.email}`}
                  className="flex items-center gap-3 p-4 bg-background/50 rounded hover:bg-background/70 transition-colors"
                >
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Email</p>
                    <p className="text-xs text-text-muted truncate">{selectedDonor.email}</p>
                  </div>
                </a>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}