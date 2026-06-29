import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!
})

export async function POST(req: NextRequest) {
  try {
    const { text, language } = await req.json()

    console.log("=================================")
    console.log("🔍 CHATBOT DEBUG START")
    console.log("User message:", text)
    console.log("Language:", language)
    console.log("=================================")

    const systemPrompt = language === 'hi' 
      ? "आप एक सहायक रक्त दान सहायक हैं। हिंदी में उत्तर दें।"
      : language === 'es'
      ? "Eres un asistente útil de donación de sangre. Responde en español."
      : language === 'fr'
      ? "Vous êtes un assistant de don de sang. Répondez en français."
      : language === 'de'
      ? "Sie sind ein Blutspende-Assistent. Antworten Sie auf Deutsch."
      : language === 'ar'
      ? "أنت مساعد تبرع بالدم. أجب بالعربية."
      : "You are a helpful blood donation assistant."

    console.log("📤 Sending to Groq...")
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const reply = completion.choices[0]?.message?.content || "I couldn't process that."

    console.log("📥 Groq Response:", reply)
    console.log("🔍 CHATBOT DEBUG END")
    console.log("=================================")

    return NextResponse.json({ reply, success: true })
  } catch (error) {
    console.error("❌ CHATBOT ERROR:", error)
    return NextResponse.json({ 
      error: "Failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}