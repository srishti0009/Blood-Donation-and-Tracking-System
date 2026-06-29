"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, Heart } from "lucide-react"

interface LiveStat {
  label: string
  value: number
  change: number
  icon: React.ReactNode
}

export function LiveStats() {
  const [stats, setStats] = useState<LiveStat[]>([])

  useEffect(() => {
    setStats([
      {
        label: "Lives Saved",
        value: 124856,
        change: 12,
        icon: <Heart className="w-5 h-5" />,
      },
      {
        label: "Donations Today",
        value: 342,
        change: 28,
        icon: <TrendingUp className="w-5 h-5" />,
      },
    ])
  }, [])

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx} className="card-glass p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-primary">{stat.icon}</div>
            <p className="text-text-muted text-sm">{stat.label}</p>
          </div>
          <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
          <p className="text-xs text-green-400 mt-1">+{stat.change}% today</p>
        </Card>
      ))}
    </div>
  )
}
