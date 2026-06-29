"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Activity, Droplet } from "lucide-react"

interface ChartProps {
  data: {
    prediction: number
    confidence: number
    factors: Record<string, number>
  } | null
}

const MAX_DEMAND = 300 // 🔒 visual scale only

export function BloodDemandChart({ data }: ChartProps) {
  const prediction = Number(data?.prediction ?? 0)
  const confidence = Number(data?.confidence ?? 0)

  // Normalize only for UI (NOT ML)
  const percentage = Math.min(
    100,
    Math.round((prediction / MAX_DEMAND) * 100)
  )

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Circular Demand Chart */}
      <Card className="p-6 flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Predicted Blood Demand
        </h3>

        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-muted/20"
            />
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeLinecap="round"
              className="text-primary transition-all duration-1000 ease-out"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{prediction}</span>
            <span className="text-sm text-muted-foreground">
              Units Required
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          <Activity className="w-4 h-4" />
          Model Confidence: {(confidence * 100).toFixed(1)}%
        </div>
      </Card>

      {/* Key Drivers */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Droplet className="w-5 h-5 text-primary" />
          Key Demand Drivers
        </h3>

        <div className="space-y-4">
          {data?.factors &&
            Object.entries(data.factors).map(([factor, value], i) => {
              const v = Math.min(100, Math.round(value))
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{factor}</span>
                    <span className="text-muted-foreground">{v}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div
                      className="h-full bg-primary/80 rounded-full"
                      style={{ width: `${v}%` }}
                    />
                  </div>
                </div>
              )
            })}

          {(!data?.factors ||
            Object.keys(data.factors).length === 0) && (
            <p className="text-muted-foreground text-sm">
              No contributing factors available.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
