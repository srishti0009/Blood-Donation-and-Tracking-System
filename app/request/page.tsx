"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function RequestPage() {
  const [formData, setFormData] = useState({
    patientName: "",
    bloodType: "O+",
    units: "2",
    urgency: "high",
    location: "",
    hospital: "",
    phone: "",
    email: "",
    patientAge: "",
  })

  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestId, setRequestId] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare data for Firebase API
      const apiData = {
        bloodType: formData.bloodType,
        units: parseInt(formData.units),
        urgency: formData.urgency,
        location: formData.location,
        hospital: formData.hospital,
        patientAge: formData.patientAge ? parseInt(formData.patientAge) : null,
        contactName: formData.patientName,
        contactPhone: formData.phone,
        patientName: formData.patientName,
        email: formData.email,
      }

      console.log('📤 Sending request to Firebase...', apiData)

      // Call Firebase API
      const response = await fetch('/api/request/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Request created in Firebase:', result.request)
        
        // Save request ID
        setRequestId(result.request.id)
        
        // Also save to localStorage for backward compatibility
        const requestData = {
          id: result.request.id,
          firestoreId: result.request.firestoreId,
          ...formData,
          requestDate: new Date().toISOString(),
          fulfilled: false,
        }

        localStorage.setItem(`request:${result.request.id}`, JSON.stringify(requestData))
        
        const requestListStr = localStorage.getItem('request-list')
        const requestList = requestListStr ? JSON.parse(requestListStr) : []
        requestList.push(result.request.id)
        localStorage.setItem('request-list', JSON.stringify(requestList))
        
        console.log('💾 Request also saved to localStorage')
        
        setSubmitted(true)
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setSubmitted(false)
          setRequestId("")
          setFormData({
            patientName: "",
            bloodType: "O+",
            units: "2",
            urgency: "high",
            location: "",
            hospital: "",
            phone: "",
            email: "",
            patientAge: "",
          })
        }, 5000)
      } else {
        console.error('❌ Request failed:', result.error)
        alert('Request failed: ' + (result.error || 'Unknown error'))
      }
      
    } catch (error) {
      console.error("❌ Request error:", error)
      alert("Request submission failed. Please check console for details.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="container-custom py-12 max-w-2xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back Home
          </Button>
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Request Blood</h1>
          <p className="text-text-muted text-lg">Submit your blood donation request and we'll find matching donors</p>
        </div>

        {/* Urgency Alert */}
        <Card className="card-glass p-4 mb-8 bg-primary/10 border-primary/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-primary">Urgent Requests Get Priority</h3>
              <p className="text-sm text-text-muted mt-1">Mark your request as urgent to reach more donors faster</p>
            </div>
          </div>
        </Card>

        <Card className="card-glass p-8">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Request Submitted! 🎉</h2>
              <p className="text-text-muted mb-2">
                We're matching you with donors in your area
              </p>
              <p className="text-text-muted mb-8">
                Your request has been saved to Firebase and donors will be notified
              </p>
              
              {requestId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Request ID:</p>
                  <p className="text-lg font-mono text-blue-600">{requestId}</p>
                </div>
              )}
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  ✅ Request saved to database<br/>
                  ✅ Blood demand updated for ML predictions<br/>
                  ✅ Matching donors will be notified
                </p>
              </div>
              
              <p className="text-sm text-text-muted">
                You'll receive notifications as donors respond to your request
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Patient Name *</label>
                <Input
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Blood Type *</label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded bg-background/50 text-foreground border border-border"
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
                  <label className="block text-sm font-semibold mb-2">Units Needed *</label>
                  <Input
                    name="units"
                    type="number"
                    value={formData.units}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    required
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Urgency Level *</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "low", label: "Low", color: "text-success" },
                    { value: "medium", label: "Medium", color: "text-accent" },
                    { value: "high", label: "High", color: "text-primary" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, urgency: option.value }))}
                      className={`p-3 rounded border transition-colors ${
                        formData.urgency === option.value ? "bg-card border-primary" : "border-border hover:bg-card/50"
                      }`}
                    >
                      <span className={`font-semibold ${option.color}`}>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Hospital/Clinic Name *</label>
                <Input
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  placeholder="Hospital name"
                  required
                  className="bg-background/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Location *</label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City name (e.g., Mumbai, Delhi)"
                  required
                  className="bg-background/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Patient Age</label>
                <Input
                  name="patientAge"
                  type="number"
                  value={formData.patientAge}
                  onChange={handleChange}
                  placeholder="Age (optional)"
                  min="1"
                  max="120"
                  className="bg-background/50"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone *</label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91-XXXXXXXXXX"
                    required
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="bg-background/50"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary hover:bg-primary-hover"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Blood Request'
                )}
              </Button>
              <p className="text-xs text-text-muted text-center">
                Your contact information will be shared with matching donors
              </p>
            </form>
          )}
        </Card>
      </div>
    </main>
  )
}