import { NextResponse } from 'next/server'
import { sharedDemandPredictor } from '@/lib/ml-models'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { features } = body

    // 🔴 STRICT CHECK
    if (!Array.isArray(features) || features.length !== 8) {
      return NextResponse.json(
        { error: 'Exactly 8 input features required' },
        { status: 400 }
      )
    }

    if (!sharedDemandPredictor.trained) {
      return NextResponse.json(
        { error: 'Model not trained yet. Call /train first.' },
        { status: 400 }
      )
    }

    const prediction = sharedDemandPredictor.predict(features)

    return NextResponse.json({
      success: true,
      prediction: prediction.prediction,
      confidence: prediction.confidence,
      factors: prediction.factors
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
