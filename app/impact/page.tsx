"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Droplet, TrendingUp, Award, AlertCircle, Heart, Users, X } from "lucide-react"

interface LiveDonation {
  id: string
  donor: string
  bloodType: string
  location: string
  timestamp: number
  livesImpacted: number
}

interface LeaderboardUser {
  rank: number
  name: string
  donations: number
  streak: number
  impact: number
}

interface PredictiveAlert {
  bloodType: string
  urgency: "critical" | "high" | "medium"
  location: string
  unitsNeeded: number
  estimatedTime: string
}

interface ImpactStory {
  id: string
  title: string
  donorName: string
  recipientInitial: string
  bloodType: string
  story: string
  outcome: string
  date: string
  donationsUsed: number
}

interface Modal {
  type: "profile" | "help" | null
  data?: LeaderboardUser | PredictiveAlert
}

export default function ImpactPage() {
  const [liveDonations, setLiveDonations] = useState<LiveDonation[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([])
  const [totalLivesSaved, setTotalLivesSaved] = useState(124856)
  const [todaysDonations, setTodaysDonations] = useState(342)
  const [stories, setStories] = useState<ImpactStory[]>([])
  const [modal, setModal] = useState<Modal>({ type: null })

  useEffect(() => {
    // Simulate live donations stream
    const donationInterval = setInterval(() => {
      const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]
      const locations = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Toronto"]
      const names = ["Sarah M.", "James K.", "Maria G.", "Ahmed H.", "Chen W.", "Priya S."]

      const newDonation: LiveDonation = {
        id: Date.now().toString(),
        donor: names[Math.floor(Math.random() * names.length)],
        bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        timestamp: Date.now(),
        livesImpacted: Math.floor(Math.random() * 3) + 1,
      }

      setLiveDonations((prev) => [newDonation, ...prev.slice(0, 9)])
      setTotalLivesSaved((prev) => prev + newDonation.livesImpacted / 10)
      setTodaysDonations((prev) => prev + 1)
    }, 3000)

    // Simulate leaderboard updates
    setLeaderboard([
      { rank: 1, name: "Alex Chen", donations: 47, streak: 12, impact: 156 },
      { rank: 2, name: "Emma Rodriguez", donations: 43, streak: 9, impact: 142 },
      { rank: 3, name: "Michael Thompson", donations: 41, streak: 8, impact: 135 },
      { rank: 4, name: "Sophia Patel", donations: 38, streak: 6, impact: 128 },
      { rank: 5, name: "David Kim", donations: 35, streak: 5, impact: 115 },
    ])

    // Simulate predictive alerts
    setAlerts([
      { bloodType: "O+", urgency: "critical", location: "New York", unitsNeeded: 45, estimatedTime: "2 hours" },
      { bloodType: "AB-", urgency: "high", location: "Los Angeles", unitsNeeded: 12, estimatedTime: "4 hours" },
      { bloodType: "B+", urgency: "medium", location: "Chicago", unitsNeeded: 20, estimatedTime: "6 hours" },
    ])

    // Simulate impact stories
    setStories([
      {
        id: "1",
        title: "Emergency Surgery Success",
        donorName: "Alex Chen",
        recipientInitial: "M",
        bloodType: "O+",
        story:
          "M was in a critical accident and needed immediate surgery. 3 donations of O+ blood were used during the operation.",
        outcome: "Recovery is progressing well. M is back at home with family.",
        date: "2 weeks ago",
        donationsUsed: 3,
      },
      {
        id: "2",
        title: "Cancer Treatment Support",
        donorName: "Emma Rodriguez",
        recipientInitial: "J",
        bloodType: "A+",
        story: "J is fighting leukemia and requires regular transfusions as part of treatment protocol.",
        outcome: "J completed their first phase of chemotherapy and is responding positively.",
        date: "1 week ago",
        donationsUsed: 5,
      },
      {
        id: "3",
        title: "Childbirth Complication",
        donorName: "Sophia Patel",
        recipientInitial: "S",
        bloodType: "B+",
        story: "S experienced severe complications during labor requiring emergency blood transfusion.",
        outcome: "Both mother and baby are healthy. They're home and doing great.",
        date: "3 days ago",
        donationsUsed: 2,
      },
      {
        id: "4",
        title: "Chronic Anemia Management",
        donorName: "Michael Thompson",
        recipientInitial: "D",
        bloodType: "AB-",
        story: "D has severe aplastic anemia and requires regular transfusions to maintain quality of life.",
        outcome: "Regular donations help D enjoy life with family and pursue their passion for painting.",
        date: "Today",
        donationsUsed: 6,
      },
    ])

    return () => clearInterval(donationInterval)
  }, [])

  const openProfileModal = (user: LeaderboardUser) => {
    setModal({ type: "profile", data: user })
  }

  const openHelpModal = (alert: PredictiveAlert) => {
    setModal({ type: "help", data: alert })
  }

  const closeModal = () => {
    setModal({ type: null })
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-500/20 border-red-500/50 text-red-300"
      case "high":
        return "bg-orange-500/20 border-orange-500/50 text-orange-300"
      case "medium":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-300"
      default:
        return "bg-blue-500/20 border-blue-500/50"
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="container-custom flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Droplet className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">BloodLink</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/impact">
              <Button variant="ghost">Impact Live</Button>
            </Link>
            <Link href="/donors">
              <Button variant="ghost">Find Donors</Button>
            </Link>
            <Link href="/request">
              <Button className="bg-primary hover:bg-primary-hover">Request Blood</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="pt-32 pb-12 container-custom border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold">Impact Live</h1>
        </div>
        <p className="text-lg text-text-muted max-w-2xl">
          Watch the real-time impact of blood donations globally. See donations happening NOW and get predictive alerts
          for when your blood type is critically needed.
        </p>
      </section>

      {/* Key Statistics */}
      <section className="py-12 container-custom">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="card-glass p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-text-muted text-sm mb-1">Lives Saved This Year</p>
                <p className="text-5xl font-bold text-primary">{Math.floor(totalLivesSaved).toLocaleString()}</p>
              </div>
              <Heart className="w-12 h-12 text-primary/30" />
            </div>
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+{Math.floor(Math.random() * 50 + 10)} today</span>
            </div>
          </Card>

          <Card className="card-glass p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-text-muted text-sm mb-1">Donations Today</p>
                <p className="text-5xl font-bold text-accent">{todaysDonations}</p>
              </div>
              <Droplet className="w-12 h-12 text-accent/30" />
            </div>
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Active donors contributing</span>
            </div>
          </Card>

          <Card className="card-glass p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-text-muted text-sm mb-1">Active Donors</p>
                <p className="text-5xl font-bold">45.9k</p>
              </div>
              <Users className="w-12 h-12 text-primary/30" />
            </div>
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+128 new this week</span>
            </div>
          </Card>
        </div>
      </section>

      <div className="container-custom grid lg:grid-cols-3 gap-8">
        {/* Live Donations Stream */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            Live Donations
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-4">
            {liveDonations.length === 0 ? (
              <Card className="card-glass p-6 text-center text-text-muted">
                <p>Donations appear here in real-time...</p>
              </Card>
            ) : (
              liveDonations.map((donation) => (
                <Card key={donation.id} className="card-glass p-4 hover:bg-card/60 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Droplet className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{donation.donor}</p>
                        <div className="flex items-center gap-2 text-sm text-text-muted mt-1">
                          <span className="bg-primary/30 text-primary px-2 py-0.5 rounded font-mono text-xs">
                            {donation.bloodType}
                          </span>
                          <span>{donation.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-400 font-semibold">
                        {donation.livesImpacted} {donation.livesImpacted === 1 ? "life" : "lives"} helped
                      </p>
                      <p className="text-xs text-text-muted">just now</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Predictive Alerts */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Urgent Needs
          </h2>
          <div className="space-y-4">
            {alerts.map((alert, idx) => (
              <Card key={idx} className={`card-glass p-4 border-2 ${getUrgencyColor(alert.urgency)}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-semibold uppercase tracking-wider">{alert.bloodType}</span>
                  <span className="text-xs px-2 py-1 bg-white/10 rounded-full font-semibold">
                    {alert.urgency === "critical" ? "CRITICAL" : alert.urgency === "high" ? "HIGH" : "MEDIUM"}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-text-muted">{alert.location}</p>
                  <p className="font-semibold">{alert.unitsNeeded} units needed</p>
                  <p className="text-xs text-text-muted">~{alert.estimatedTime}</p>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3 bg-primary hover:bg-primary-hover"
                  onClick={() => openHelpModal(alert)}
                >
                  Help Now
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <section className="py-16 container-custom">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Award className="w-6 h-6 text-accent" />
          Top Donors This Month
        </h2>
        <div className="grid gap-4">
          {leaderboard.map((user) => (
            <Card key={user.rank} className="card-glass p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                    <span className="text-xl font-bold text-primary">#{user.rank}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{user.name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                      <span>
                        <span className="text-foreground font-semibold">{user.donations}</span> donations
                      </span>
                      <span>
                        <span className="text-foreground font-semibold">{user.streak}</span>-day streak
                      </span>
                      <span>
                        <span className="text-foreground font-semibold">{user.impact}</span> lives impacted
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => openProfileModal(user)}>
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Impact Stories Section */}
      <section className="py-16 bg-card/20">
        <div className="container-custom">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Heart className="w-6 h-6 text-accent" />
            Stories of Hope
          </h2>
          <p className="text-text-muted mb-12 max-w-3xl">
            These are real stories from real people whose lives were changed by donors like you. Every donation matters.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {stories.map((story) => (
              <Card
                key={story.id}
                className="card-glass p-6 hover:bg-card/60 transition-colors border-l-4 border-l-primary"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{story.title}</h3>
                    <p className="text-sm text-text-muted">From donor: {story.donorName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">{story.recipientInitial}</span>
                    </div>
                  </div>
                </div>

                <p className="text-text-muted mb-4">{story.story}</p>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-green-300 mb-1">Current Status</p>
                  <p className="text-sm text-green-200">{story.outcome}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="bg-primary/30 text-primary px-3 py-1 rounded-full text-xs font-mono">
                      {story.bloodType}
                    </span>
                    <span className="text-text-muted">{story.date}</span>
                  </div>
                  <span className="text-accent font-semibold">{story.donationsUsed} donations used</span>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-text-muted mb-6 max-w-2xl mx-auto">
              These stories represent thousands more. Your donation can write the next chapter. Share these stories and
              inspire others to donate.
            </p>
            <Link href="/donors/register">
              <Button size="lg" className="bg-primary hover:bg-primary-hover">
                Be Someone's Hero Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 mb-20">
        <Card className="bg-gradient-to-r from-primary to-accent p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join the Impact Live Community</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Become a hero in your community. Every donation you make appears here in real-time, showing the immediate
            impact you're having on lives.
          </p>
          <Link href="/donors/register">
            <Button size="lg" variant="secondary">
              Start Donating Today
            </Button>
          </Link>
        </Card>
      </section>

      {/* Modals for View Profile and Help Now */}
      {modal.type === "profile" && modal.data && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="card-glass max-w-md w-full p-8 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 hover:bg-card rounded transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{(modal.data as LeaderboardUser).name}</h2>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                <span className="text-2xl font-bold text-primary">#{(modal.data as LeaderboardUser).rank}</span>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-text-muted">Total Donations</p>
                <p className="text-2xl font-bold">{(modal.data as LeaderboardUser).donations}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Current Streak</p>
                <p className="text-2xl font-bold">{(modal.data as LeaderboardUser).streak} days</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Lives Impacted</p>
                <p className="text-2xl font-bold text-accent">{(modal.data as LeaderboardUser).impact}</p>
              </div>
            </div>
            <Button onClick={closeModal} className="w-full bg-primary hover:bg-primary-hover">
              Close
            </Button>
          </Card>
        </div>
      )}

      {modal.type === "help" && modal.data && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="card-glass max-w-md w-full p-8 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 hover:bg-card rounded transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-6">Urgent Blood Need</h2>
            <div className="space-y-4 mb-6">
              <div className="bg-primary/20 border border-primary/30 rounded-lg p-4">
                <p className="text-sm text-text-muted mb-1">Blood Type</p>
                <p className="text-3xl font-bold text-primary">{(modal.data as PredictiveAlert).bloodType}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Location</p>
                <p className="text-lg font-semibold">{(modal.data as PredictiveAlert).location}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Units Needed</p>
                <p className="text-lg font-semibold">{(modal.data as PredictiveAlert).unitsNeeded}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Estimated Time</p>
                <p className="text-lg font-semibold">{(modal.data as PredictiveAlert).estimatedTime}</p>
              </div>
            </div>
            <div className="space-y-3">
              <Link href="/donors/register">
                <Button onClick={closeModal} className="w-full bg-primary hover:bg-primary-hover">
                  Register as Donor
                </Button>
              </Link>
              <Button variant="outline" onClick={closeModal} className="w-full bg-transparent">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </main>
  )
}
