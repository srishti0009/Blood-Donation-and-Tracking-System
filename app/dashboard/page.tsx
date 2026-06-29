"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Users, 
  Droplet, 
  Edit,
  CheckCircle2,
  Brain,
} from "lucide-react"
import { getCurrentDonorProfile } from "@/lib/donor-storage"
import type { RegisteredDonor } from "@/lib/donor-storage"

export default function DashboardPage() {
  const [profile, setProfile] = useState<RegisteredDonor | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'overview' | 'activity'>('overview')

  useEffect(() => {
    async function loadProfile() {
      try {
        const donorProfile = await getCurrentDonorProfile()
        setProfile(donorProfile)
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [])

  const stats = [
    { 
      label: "Donations Made", 
      value: profile?.totalDonations || "0", 
      change: "+1 this year", 
      icon: Droplet, 
      color: "text-primary" 
    },
    { 
      label: "Lives Impacted", 
      value: profile ? (parseInt(profile.totalDonations) * 3).toString() : "0", 
      change: "people helped", 
      icon: Users, 
      color: "text-accent" 
    },
    { 
      label: "Blood Group", 
      value: profile?.bloodGroup || "N/A", 
      change: "registered type", 
      icon: Droplet, 
      color: "text-success" 
    },
  ]

  const upcomingMatches = [
    { id: 1, patient: "John Smith", blood: "B+", urgency: "high", distance: 3.2, time: "2h ago" },
    { id: 2, patient: "Sarah Johnson", blood: "O+", urgency: "medium", distance: 5.8, time: "1d ago" },
  ]

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-20">
        <div className="container-custom py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-text-muted">Loading dashboard...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="container-custom py-12">
        {/* Header */}
           <div className="flex items-center justify-between mb-12">
            <div>
            <h1 className="text-4xl font-bold mb-2">Donor Dashboard</h1>
            <p className="text-text-muted">
             Welcome back, {profile?.fullName || "Guest"}
            </p>
           </div>
           <div className="flex gap-4">
    {/* NEW: ML Training Button */}
    <Link href="/ml-training">
      <Button className="bg-purple-600 hover:bg-purple-700">
        <Brain className="w-4 h-4 mr-2" />
        Train ML
      </Button>
    </Link>
    
    {!profile && (
      <Link href="/donors/register">
        <Button className="bg-primary">Register as Donor</Button>
      </Link>
    )}
    
    <Link href="/">
      <Button variant="outline">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Home
      </Button>
    </Link>
  </div>
</div>

        {/* View Toggle Buttons */}
        <div className="flex gap-3 mb-8 border-b pb-2">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-6 py-2 rounded-t-lg font-medium transition-all ${
              activeView === 'overview' 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('activity')}
            className={`px-6 py-2 rounded-t-lg font-medium transition-all ${
              activeView === 'activity' 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Overview View */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Profile Card */}
            {profile && (
              <Card className="card-glass p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-text-muted">Email:</span>
                        <span className="ml-2 font-medium">{profile.email}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Phone:</span>
                        <span className="ml-2 font-medium">{profile.phone}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Location:</span>
                        <span className="ml-2 font-medium">{profile.city}, {profile.state}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Weight:</span>
                        <span className="ml-2 font-medium">{profile.weight} kg</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <Card key={i} className="card-glass p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-text-muted text-sm">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                      <p className="text-xs text-text-muted mt-2">{stat.change}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </Card>
              ))}
            </div>

            {/* Recent Matches */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Matching Opportunities</h2>
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <Card
                    key={match.id}
                    className="card-glass p-6 flex items-center justify-between hover:bg-card/60 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                          {match.blood}
                        </span>
                        <p className="font-semibold">{match.patient}</p>
                        <span className={`text-xs font-semibold ${match.urgency === "high" ? "text-primary" : "text-accent"}`}>
                          {match.urgency.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted">
                        {match.distance} km away • {match.time}
                      </p>
                    </div>
                    <Button className="bg-primary hover:bg-primary-hover">View Details</Button>
                  </Card>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Your Impact</h2>
              <Card className="card-glass p-8">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {profile ? (parseInt(profile.totalDonations) * 3) : 0}
                    </div>
                    <p className="text-text-muted">Lives Saved</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-accent mb-2">
                      {profile?.totalDonations || 0}
                    </div>
                    <p className="text-text-muted">Total Donations</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-success mb-2">
                      {profile ? "100%" : "0%"}
                    </div>
                    <p className="text-text-muted">Response Rate</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Activity View */}
        {activeView === 'activity' && (
          <Card className="card-glass p-6">
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Droplet className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Donation Completed</p>
                  <p className="text-sm text-text-muted">You donated {profile?.bloodGroup} blood</p>
                  <p className="text-xs text-text-muted mt-1">2 days ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Profile Verified</p>
                  <p className="text-sm text-text-muted">Your donor profile has been verified</p>
                  <p className="text-xs text-text-muted mt-1">1 week ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Registration Complete</p>
                  <p className="text-sm text-text-muted">Welcome to BloodLink donor network</p>
                  <p className="text-xs text-text-muted mt-1">2 weeks ago</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}