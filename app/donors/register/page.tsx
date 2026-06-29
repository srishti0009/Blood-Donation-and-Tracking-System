"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, User, Mail, Phone, MapPin, Droplet, Calendar,
  Weight, Activity, FileText, CheckCircle, AlertCircle, Heart,RefreshCw
} from "lucide-react"

export default function DonorRegistrationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "male",
    
    // Address
    address: "",
    city: "",
    state: "",
    pincode: "",
    
    // Medical Information
    bloodGroup: "A+",
    weight: "",
    hemoglobin: "",
    lastDonationDate: "",
    totalDonations: "0",
    
    // Health Status
    medicalCondition: "none",
    medications: "",
    allergies: "",
    chronicDiseases: "",
    
    // Additional
    emergencyContact: "",
    emergencyPhone: "",
    donationCenter: "",
    
    // Consent
    termsAccepted: false,
    dataConsent: false,
  })

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.termsAccepted) {
      alert("Please accept the terms and conditions")
      return
    }

    if (!formData.dataConsent) {
      alert("Please accept the data consent")
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate age from date of birth
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      // Prepare data for Firebase API
      const apiData = {
        name: formData.fullName,
        bloodType: formData.bloodGroup,
        age: age,
        location: formData.city,
        phone: formData.phone,
        email: formData.email,
        weight: parseInt(formData.weight) || 55,
        lastDonation: formData.lastDonationDate || null,
        medicalConditions: formData.medicalCondition !== 'none' ? [formData.medicalCondition] : [],
      }

      console.log('📤 Sending donor data to Firebase...', apiData)

      // Call Firebase API
      const response = await fetch('/api/donors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Donor registered in Firebase:', result.donor)
        
        // Also save to localStorage for backward compatibility
        const donorId = result.donor.id
        const donorData = {
          id: donorId,
          firestoreId: result.donor.firestoreId,
          ...formData,
          age: age,
          registrationDate: new Date().toISOString(),
          isVerified: false,
          status: 'active',
          eligibility: result.donor.eligibility
        }

        localStorage.setItem(`donor:${donorId}`, JSON.stringify(donorData))
        
        const donorListStr = localStorage.getItem('donor-list')
        const donorList = donorListStr ? JSON.parse(donorListStr) : []
        donorList.push(donorId)
        localStorage.setItem('donor-list', JSON.stringify(donorList))
        
        console.log('💾 Donor also saved to localStorage')
        console.log('🎯 Eligibility:', result.donor.eligibility ? 'ELIGIBLE ✅' : 'NOT ELIGIBLE ❌')
        
        setSubmitted(true)
      } else {
        console.error('❌ Registration failed:', result.error)
        alert('Registration failed: ' + (result.error || 'Unknown error'))
      }
      
    } catch (error) {
      console.error("❌ Registration error:", error)
      alert("Registration failed. Please check console for details.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStepValid = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return formData.fullName && formData.email && formData.phone && formData.dateOfBirth
      case 2:
        return formData.city && formData.state
      case 3:
        return formData.bloodGroup && formData.weight
      case 4:
        return formData.termsAccepted && formData.dataConsent
      default:
        return false
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto py-12 px-4 max-w-2xl">
          <Card className="card-glass p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Registration Successful! 🎉</h1>
            <p className="text-text-muted mb-2">
              Thank you for registering as a blood donor.
            </p>
            <p className="text-text-muted mb-8">
              Your information has been saved to Firebase and you can now help save lives!
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-blue-800">
                ✅ Your donor profile is now active in our system<br/>
                ✅ You will be matched with patients who need your blood type<br/>
                ✅ Check the dashboard to see blood demand predictions
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/dashboard')} className="bg-primary">
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                Back Home
              </Button>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Become a Blood Donor</h1>
          <p className="text-text-muted text-lg">
            Join our community of life-savers. Fill out this form to register as a donor.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= num
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {num}
                  </div>
                  <span className="text-xs mt-2 text-center">
                    {num === 1 && 'Personal'}
                    {num === 2 && 'Address'}
                    {num === 3 && 'Medical'}
                    {num === 4 && 'Review'}
                  </span>
                </div>
                {num < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${step > num ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <Card className="card-glass p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-primary" />
                Personal Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+91-XXXXXXXXXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full px-4 py-2 rounded bg-background border border-border"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <Card className="card-glass p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                Address Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Street address, House no."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">State *</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="State"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Pincode</label>
                  <Input
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    placeholder="000000"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Medical Information */}
          {step === 3 && (
            <Card className="card-glass p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                Medical Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Blood Group *</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => handleChange('bloodGroup', e.target.value)}
                    className="w-full px-4 py-2 rounded bg-background border border-border"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Weight (kg) *</label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    placeholder="50"
                    min="45"
                    required
                  />
                  <p className="text-xs text-text-muted mt-1">Minimum 50 kg required</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hemoglobin Level (g/dL)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.hemoglobin}
                    onChange={(e) => handleChange('hemoglobin', e.target.value)}
                    placeholder="13.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Last Donation Date</label>
                  <Input
                    type="date"
                    value={formData.lastDonationDate}
                    onChange={(e) => handleChange('lastDonationDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Total Donations</label>
                  <Input
                    type="number"
                    value={formData.totalDonations}
                    onChange={(e) => handleChange('totalDonations', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Medical Condition</label>
                  <select
                    value={formData.medicalCondition}
                    onChange={(e) => handleChange('medicalCondition', e.target.value)}
                    className="w-full px-4 py-2 rounded bg-background border border-border"
                  >
                    <option value="none">None</option>
                    <option value="diabetes">Diabetes</option>
                    <option value="hypertension">Hypertension</option>
                    <option value="heart">Heart Condition</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Allergies</label>
                  <Input
                    value={formData.allergies}
                    onChange={(e) => handleChange('allergies', e.target.value)}
                    placeholder="Any known allergies"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Emergency Contact Name</label>
                  <Input
                    value={formData.emergencyContact}
                    onChange={(e) => handleChange('emergencyContact', e.target.value)}
                    placeholder="Contact person name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Emergency Contact Phone</label>
                  <Input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Preferred Donation Center</label>
                  <Input
                    value={formData.donationCenter}
                    onChange={(e) => handleChange('donationCenter', e.target.value)}
                    placeholder="Blood bank or hospital name"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Step 4: Review & Consent */}
          {step === 4 && (
            <Card className="card-glass p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Review & Consent
              </h2>

              <div className="space-y-6 mb-8">
                <div className="bg-background/50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-muted">Name:</span>
                      <span className="ml-2 font-medium">{formData.fullName}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Email:</span>
                      <span className="ml-2 font-medium">{formData.email}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Phone:</span>
                      <span className="ml-2 font-medium">{formData.phone}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">DOB:</span>
                      <span className="ml-2 font-medium">{formData.dateOfBirth}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-background/50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-red-500" />
                    Medical Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-muted">Blood Group:</span>
                      <span className="ml-2 font-medium text-primary">{formData.bloodGroup}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Weight:</span>
                      <span className="ml-2 font-medium">{formData.weight} kg</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Location:</span>
                      <span className="ml-2 font-medium">{formData.city}, {formData.state}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => handleChange('termsAccepted', e.target.checked)}
                    className="mt-1 w-5 h-5"
                  />
                  <span className="text-sm">
                    I agree to the <a href="#" className="text-primary underline">terms and conditions</a> and confirm that all information provided is accurate.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dataConsent}
                    onChange={(e) => handleChange('dataConsent', e.target.checked)}
                    className="mt-1 w-5 h-5"
                  />
                  <span className="text-sm">
                    I consent to my data being used to match with blood recipients and for communication purposes.
                  </span>
                </label>
              </div>

              {(!formData.termsAccepted || !formData.dataConsent) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Please accept both the terms and data consent to proceed with registration.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>

            {step < 4 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!isStepValid(step)}
                className="bg-primary hover:bg-primary-hover"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!formData.termsAccepted || !formData.dataConsent || isSubmitting}
                className="bg-primary hover:bg-primary-hover"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Complete Registration
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}