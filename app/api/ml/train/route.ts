import { NextResponse } from "next/server"
import { sharedDemandPredictor, DonorMatchingModel } from "@/lib/ml-models"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { modelType } = body

    // ===============================
    // TRAIN BLOOD DEMAND MODEL
    // ===============================
    if (modelType === "demand") {
      console.log("🎯 Training Blood Demand Model")

      const filePath = path.join(
        process.cwd(),
        "data",
        "synthetic_blood_demand_data.csv"
      )

      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { success: false, error: "CSV file not found" },
          { status: 404 }
        )
      }

      const csvData = fs.readFileSync(filePath, "utf8")

      const result = await sharedDemandPredictor.trainModel(csvData)

      return NextResponse.json({
        success: true,
        samples: result.samples,
        finalLoss: result.loss?.slice(-1)[0] ?? 0,
        message: "Model trained successfully using real CSV data",
      })
    }

    // ===============================
    // DONOR MATCHING (OPTIONAL)
    // ===============================
    if (modelType === "matching") {
      const matcher = new DonorMatchingModel()
      matcher.train(null)

      return NextResponse.json({
        success: true,
        message: "Donor matching model ready",
      })
    }

    return NextResponse.json(
      { success: false, error: "Invalid modelType" },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("❌ Training API Error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Training failed" },
      { status: 500 }
    )
  }
}
