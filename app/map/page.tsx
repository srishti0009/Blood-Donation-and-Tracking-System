"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface MapLocation {
  id: string
  name: string
  type: "donor" | "recipient" | "bloodbank"
  lat: number
  lng: number
  bloodType?: string
  distance?: number
  status?: string
  phone?: string
}

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [filterType, setFilterType] = useState<"all" | "donor" | "recipient" | "bloodbank">("all")
  const [searchRadius, setSearchRadius] = useState(5)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const [offerMessage, setOfferMessage] = useState("")

  // Sample data for demonstration
  const sampleLocations: MapLocation[] = [
    // Donors
    {
      id: "d1",
      name: "Raj Kumar",
      type: "donor",
      lat: 28.6139,
      lng: 77.209,
      bloodType: "O+",
      distance: 1.2,
      status: "Available",
    },
    {
      id: "d2",
      name: "Priya Singh",
      type: "donor",
      lat: 28.615,
      lng: 77.2095,
      bloodType: "A+",
      distance: 2.1,
      status: "Available",
    },
    {
      id: "d3",
      name: "Ahmed Hassan",
      type: "donor",
      lat: 28.612,
      lng: 77.211,
      bloodType: "B+",
      distance: 1.8,
      status: "Available",
    },
    {
      id: "d4",
      name: "Sofia Patel",
      type: "donor",
      lat: 28.619,
      lng: 77.208,
      bloodType: "AB+",
      distance: 3.5,
      status: "Not Available",
    },

    // Recipients/Blood Requests
    {
      id: "r1",
      name: "Emergency - Safdarjung Hospital",
      type: "recipient",
      lat: 28.6128,
      lng: 77.2005,
      bloodType: "O-",
      distance: 2.3,
      status: "Urgent",
    },
    {
      id: "r2",
      name: "Patient at Delhi Hospital",
      type: "recipient",
      lat: 28.618,
      lng: 77.212,
      bloodType: "A+",
      distance: 1.5,
      status: "High Priority",
    },

    // Blood Banks
    {
      id: "b1",
      name: "Red Cross Blood Bank",
      type: "bloodbank",
      lat: 28.6195,
      lng: 77.2097,
      distance: 1.1,
      phone: "+91-98765-12345",
      status: "Open",
    },
    {
      id: "b2",
      name: "Central Blood Bank",
      type: "bloodbank",
      lat: 28.614,
      lng: 77.207,
      distance: 2.8,
      phone: "+91-98765-12346",
      status: "Open",
    },
    {
      id: "b3",
      name: "Apollo Blood Centre",
      type: "bloodbank",
      lat: 28.621,
      lng: 77.214,
      distance: 3.2,
      phone: "+91-98765-12347",
      status: "Closed",
    },
  ]

  useEffect(() => {
    // Simulate getting user location
    setUserLocation({ lat: 28.6125, lng: 77.2097 })
    setLocations(sampleLocations)
  }, [])

  const filteredLocations = locations.filter((loc) => filterType === "all" || loc.type === filterType)

  const getMarkerColor = (type: string) => {
    switch (type) {
      case "donor":
        return "bg-green-500"
      case "recipient":
        return "bg-red-500"
      case "bloodbank":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case "donor":
        return "👨‍⚕️"
      case "recipient":
        return "🏥"
      case "bloodbank":
        return "🩸"
      default:
        return "📍"
    }
  }

  const handleContactDonor = () => {
    setContactMessage("")
    setShowContactModal(true)
  }

  const handleOfferBlood = () => {
    setOfferMessage("")
    setShowOfferModal(true)
  }

  const handleSendContactMessage = () => {
    if (contactMessage.trim()) {
      alert(`Message sent to ${selectedLocation?.name}: "${contactMessage}"`)
      setShowContactModal(false)
      setContactMessage("")
    }
  }

  const handleSendOfferMessage = () => {
    if (offerMessage.trim()) {
      alert(`Offer sent to ${selectedLocation?.name}: "${offerMessage}"`)
      setShowOfferModal(false)
      setOfferMessage("")
    }
  }

  const handleGetDirections = () => {
    if (selectedLocation) {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`
      window.open(googleMapsUrl, "_blank")
    }
  }

  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="container-custom py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Donor & Recipient Map</h1>
          <p className="text-text-muted">Find nearby donors, recipients in need, and blood banks in real-time</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Controls and List */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="card-glass p-4">
              <label className="block text-sm font-semibold mb-2">Filter Type</label>
              <div className="space-y-2">
                {["all", "donor", "recipient", "bloodbank"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={`w-full text-left px-4 py-2 rounded transition-colors ${
                      filterType === type ? "bg-primary/20 text-primary" : "hover:bg-card/50"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="card-glass p-4">
              <label className="block text-sm font-semibold mb-2">Search Radius: {searchRadius} km</label>
              <input
                type="range"
                min="1"
                max="20"
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="w-full"
              />
            </Card>

            <Card className="card-glass p-4 max-h-[600px] overflow-y-auto">
              <h3 className="font-semibold mb-3">Nearby {filterType === "all" ? "Locations" : filterType}s</h3>
              <div className="space-y-2">
                {filteredLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    className={`w-full text-left p-3 rounded transition-colors ${
                      selectedLocation?.id === loc.id ? "bg-primary/20" : "hover:bg-card/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${getMarkerColor(loc.type)}`}></span>
                      <p className="font-semibold text-sm">{loc.name}</p>
                    </div>
                    <p className="text-xs text-text-muted">
                      {loc.distance} km • {loc.bloodType || loc.status}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-3">
            <Card className="card-glass p-6 h-[700px] relative overflow-hidden">
              {/* Simplified Map Grid */}
              <div className="w-full h-full relative bg-background/50 rounded border border-border">
                {/* Map Background with Grid */}
                <svg className="absolute inset-0 w-full h-full opacity-10">
                  <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* User Location */}
                {userLocation && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-primary/30 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-xs font-semibold text-center mt-1 whitespace-nowrap">Your Location</p>
                  </div>
                )}

                {/* Map Markers */}
                {filteredLocations.map((loc, idx) => {
                  const posX = 20 + (idx % 4) * 20
                  const posY = 15 + Math.floor(idx / 4) * 20
                  const isSelected = selectedLocation?.id === loc.id

                  return (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                        isSelected ? "scale-125" : "hover:scale-110"
                      }`}
                      style={{ left: `${posX}%`, top: `${posY}%` }}
                    >
                      <div
                        className={`w-8 h-8 ${getMarkerColor(loc.type)} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <span className="text-lg">{getMarkerIcon(loc.type)}</span>
                      </div>
                    </button>
                  )
                })}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur p-3 rounded border border-border text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Donor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Recipient</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Blood Bank</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Selected Location Details */}
            {selectedLocation && (
              <Card className="card-glass p-6 mt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{selectedLocation.name}</h3>
                    <p className="text-text-muted">
                      {selectedLocation.type === "donor"
                        ? "Blood Donor"
                        : selectedLocation.type === "recipient"
                          ? "Blood Request"
                          : "Blood Bank"}
                    </p>
                  </div>
                  <span className={`w-4 h-4 rounded-full ${getMarkerColor(selectedLocation.type)}`}></span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-text-muted">Distance</p>
                    <p className="text-lg font-semibold">{selectedLocation.distance} km away</p>
                  </div>
                  {selectedLocation.bloodType && (
                    <div>
                      <p className="text-sm text-text-muted">Blood Type</p>
                      <p className="text-lg font-semibold">{selectedLocation.bloodType}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-text-muted">Status</p>
                    <p
                      className={`text-lg font-semibold ${selectedLocation.status?.includes("Urgent") || selectedLocation.status?.includes("Not Available") ? "text-red-400" : "text-green-400"}`}
                    >
                      {selectedLocation.status}
                    </p>
                  </div>
                  {selectedLocation.phone && (
                    <div>
                      <p className="text-sm text-text-muted">Contact</p>
                      <p className="text-lg font-semibold">{selectedLocation.phone}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {selectedLocation.type === "donor" && (
                    <>
                      <Button onClick={handleContactDonor} className="flex-1 bg-primary hover:bg-primary-hover">
                        Contact Donor
                      </Button>
                      <Button onClick={handleGetDirections} variant="outline" className="flex-1 bg-transparent">
                        Get Directions
                      </Button>
                    </>
                  )}
                  {selectedLocation.type === "recipient" && (
                    <>
                      <Button onClick={handleOfferBlood} className="flex-1 bg-primary hover:bg-primary-hover">
                        Offer Blood
                      </Button>
                      <Button onClick={handleGetDirections} variant="outline" className="flex-1 bg-transparent">
                        Get Directions
                      </Button>
                    </>
                  )}
                  {selectedLocation.type === "bloodbank" && (
                    <>
                      <a href={`tel:${selectedLocation.phone}`} className="flex-1">
                        <Button className="w-full bg-primary hover:bg-primary-hover">Call Now</Button>
                      </a>
                      <Button onClick={handleGetDirections} variant="outline" className="flex-1 bg-transparent">
                        Get Directions
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        {showContactModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="card-glass p-6 w-full max-w-md mx-4">
              <h2 className="text-2xl font-bold mb-4">Contact {selectedLocation?.name}</h2>
              <p className="text-text-muted mb-4">Send a message to this donor</p>

              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-3 bg-background border border-border rounded mb-4 resize-none focus:outline-none focus:border-primary"
                rows={4}
              />

              <div className="flex gap-3">
                <Button onClick={() => setShowContactModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSendContactMessage} className="flex-1 bg-primary hover:bg-primary-hover">
                  Send Message
                </Button>
              </div>
            </Card>
          </div>
        )}

        {showOfferModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="card-glass p-6 w-full max-w-md mx-4">
              <h2 className="text-2xl font-bold mb-4">Offer Blood to {selectedLocation?.name}</h2>
              <p className="text-text-muted mb-4">Confirm your blood donation offer</p>

              <div className="bg-background/50 p-3 rounded mb-4">
                <p className="text-sm">
                  <span className="font-semibold">Blood Type Needed:</span> {selectedLocation?.bloodType}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Status:</span> {selectedLocation?.status}
                </p>
              </div>

              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="Type your offer message..."
                className="w-full p-3 bg-background border border-border rounded mb-4 resize-none focus:outline-none focus:border-primary"
                rows={4}
              />

              <div className="flex gap-3">
                <Button onClick={() => setShowOfferModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSendOfferMessage} className="flex-1 bg-primary hover:bg-primary-hover">
                  Send Offer
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
