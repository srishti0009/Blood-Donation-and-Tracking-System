"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Droplet, Users, Heart, Clock, Shield, Globe, Target } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="container-custom flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Droplet className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">BloodLink</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/impact">
              <Button variant="ghost">Impact Live</Button>
            </Link>
            <Link href="/donors">
              <Button variant="ghost">Find Donors</Button>
            </Link>
            <Link href="/emergency">
              <Button variant="ghost">Emergency Banks</Button>
            </Link>
            <Link href="/map">
              <Button variant="ghost">Donor Map</Button>
            </Link>
            <Link href="/ml">
              <Button variant="ghost">Smart Insights</Button>
            </Link>
            
            {/* 🆕 ML Accuracy Button */}
            <Link href="/accuracy">
              <Button variant="ghost">
                <Target className="w-4 h-4 mr-2" />
                ML Accuracy
              </Button>
            </Link>

            <Link href="/request">
              <Button className="bg-primary hover:bg-primary-hover">Request Blood</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Every Drop <span className="gradient-red bg-clip-text text-transparent">Saves Lives</span>
            </h1>
            <p className="text-lg text-text-muted mb-8 max-w-lg">
              BloodLink connects donors with recipients through intelligent matching, real-time notifications, and
              multilingual support. Together, we save lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/donors/register">
                <Button size="lg" className="bg-primary hover:bg-primary-hover w-full sm:w-auto">
                  I'm a Donor
                </Button>
              </Link>
              <Link href="/request">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Request Blood
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden card-glass flex items-center justify-center">
            <div className="text-center">
              <Droplet className="w-32 h-32 text-primary mx-auto mb-4" />
              <p className="text-2xl font-bold">Ready to Give?</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/20">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose BloodLink?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Smart Matching",
                description:
                  "AI-powered matching connects donors with recipients based on blood type, location, and availability.",
              },
              {
                icon: Heart,
                title: "Real-time Notifications",
                description: "Get instant updates about blood requests in your area and donation opportunities.",
              },
              {
                icon: Globe,
                title: "Multilingual Support",
                description: "Access BloodLink in your preferred language with voice-enabled assistance.",
              },
              {
                icon: Clock,
                title: "Quick Response",
                description: "Find matching donors in minutes, not hours. Critical for emergency blood needs.",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Your health data is encrypted and protected according to privacy regulations.",
              },
              {
                icon: Droplet,
                title: "Impact Tracking",
                description: "See the real-world impact of your donations and contributions to your community.",
              },
            ].map((feature, i) => (
              <Card key={i} className="card-glass p-6 hover:bg-card/60 transition-colors cursor-pointer">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-muted">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 container-custom">
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { value: "45,892", label: "Active Donors" },
            { value: "12,456", label: "Lives Saved" },
            { value: "28", label: "Countries" },
            { value: "99.8%", label: "Match Success" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <p className="text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent rounded-lg mx-4 mb-20">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">Join the Blood Donation Network</h2>
          <p className="text-lg text-white/90 mb-8">Become a lifesaver today and make a difference in your community</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/donors/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Register as Donor
              </Button>
            </Link>
            <Link href="/request">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-white border-white hover:bg-white/10 bg-transparent"
              >
                Need Blood
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Droplet className="w-6 h-6 text-primary" />
                <span className="font-bold">BloodLink</span>
              </div>
              <p className="text-text-muted text-sm">Saving lives through intelligent blood donation matching.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <Link href="/donors" className="hover:text-foreground">
                    Find Donors
                  </Link>
                </li>
                <li>
                  <Link href="/request" className="hover:text-foreground">
                    Request Blood
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Track Donations
                  </Link>
                </li>
                <li>
                  <Link href="/accuracy" className="hover:text-foreground">
                    ML Accuracy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <a href="#" className="hover:text-foreground">
                    About
                  </a>
                </li>
                <li>
                  <Link href="/impact" className="hover:text-foreground">
                    Impact
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-text-muted text-sm">
            <p>&copy; 2025 BloodLink. All rights reserved. Together, we save lives.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}




// ✅ Result

// Navbar mein ab ye dikhega:
// ```
// [Impact Live] [Find Donors] [Emergency Banks] [Donor Map] 
// [Smart Insights] [🎯 ML Accuracy] [Request Blood]