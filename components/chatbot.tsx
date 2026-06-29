"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, Loader, X, MessageCircle, Globe } from "lucide-react"
import { Button } from "./ui/button"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

const LANGUAGE_STRINGS: Record<string, Record<string, string>> = {
  en: {
    title: "BloodLink Assistant",
    greeting: "Hello! I'm BloodLink Assistant. How can I help you find blood donors or make a donation request today?",
    placeholder: "Ask me anything...",
    sendBtn: "Send",
    default: "I'm sorry, I couldn't process that. Please try again.",
  },
  es: {
    title: "Asistente BloodLink",
    greeting:
      "¡Hola! Soy el Asistente BloodLink. ¿Cómo puedo ayudarte a encontrar donantes de sangre o hacer una solicitud de donación hoy?",
    placeholder: "Pregúntame cualquier cosa...",
    sendBtn: "Enviar",
    default: "Lo siento, no pude procesar eso. Por favor, inténtalo de nuevo.",
  },
  fr: {
    title: "Assistant BloodLink",
    greeting:
      "Bonjour! Je suis l'Assistant BloodLink. Comment puis-je vous aider à trouver des donneurs de sang ou à faire une demande de don aujourd'hui?",
    placeholder: "Demande-moi n'importe quoi...",
    sendBtn: "Envoyer",
    default: "Je suis désolé, je n'ai pas pu traiter cela. Veuillez réessayer.",
  },
  de: {
    title: "BloodLink-Assistent",
    greeting:
      "Hallo! Ich bin der BloodLink-Assistent. Wie kann ich dir heute helfen, Blutspender zu finden oder eine Spendenanfrage zu stellen?",
    placeholder: "Frag mich alles...",
    sendBtn: "Senden",
    default: "Es tut mir leid, ich konnte das nicht verarbeiten. Bitte versuchen Sie es erneut.",
  },
  ar: {
    title: "مساعد BloodLink",
    greeting: "مرحبا! أنا مساعد BloodLink. كيف يمكنني مساعدتك في العثور على متبرعي الدم أو تقديم طلب تبرع اليوم؟",
    placeholder: "اسأني أي شيء...",
    sendBtn: "إرسال",
    default: "أنا آسف، لم أتمكن من معالجة ذلك. يرجى المحاولة مرة أخرى.",
  },
}

export function Chatbot() {
  const [language, setLanguage] = useState<"en" | "es" | "fr" | "de" | "ar">("en")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: LANGUAGE_STRINGS[language].greeting,
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
        }
        recognitionRef.current.onerror = () => {
          setIsListening(false)
        }
        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [])

  const handleLanguageChange = (newLanguage: "en" | "es" | "fr" | "de" | "ar") => {
    setLanguage(newLanguage)
    setShowLanguages(false)
    setMessages([
      {
        id: "1",
        text: LANGUAGE_STRINGS[newLanguage].greeting,
        sender: "bot",
        timestamp: new Date(),
      },
    ])
  }

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  // 🔥 FIXED handleSend - Now uses REAL AI!
  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    const userInput = input  // Save input before clearing
    setInput("")
    setIsLoading(true)

    try {
      // 🔥 REAL AI API CALL
      console.log("🚀 Calling Gemini API...")
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: userInput,
          language: language,
        }),
      })

      console.log("📥 Response received:", response.status)
      const data = await response.json()
      console.log("📦 Data:", data)

      if (data.success && data.reply) {
        // ✅ Use AI response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.reply,  // Real AI response!
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
        console.log("✅ AI response displayed")
      } else {
        // Fallback if API returns error
        console.warn("⚠️ API returned error:", data)
        const strings = LANGUAGE_STRINGS[language] || LANGUAGE_STRINGS.en
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: strings.default,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      }
    } catch (error) {
      console.error("❌ Chatbot API error:", error)
      // Fallback on error
      const strings = LANGUAGE_STRINGS[language] || LANGUAGE_STRINGS.en
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: strings.default,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Minimized bubble button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary hover:bg-primary-hover rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 text-white"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Expanded chat window */}
      {isOpen && (
        <div className="absolute bottom-0 right-0 w-96 max-w-[calc(100vw-1.5rem)] h-96 rounded-lg card-glass border flex flex-col shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/20 to-transparent rounded-t-lg">
            <h3 className="font-semibold">{LANGUAGE_STRINGS[language].title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLanguages(!showLanguages)}
                className="p-1 hover:bg-background/50 rounded transition-colors"
              >
                <Globe className="w-5 h-5 text-primary" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-background/50 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Language Selector */}
          {showLanguages && (
            <div className="px-4 py-3 border-b border-border bg-card/20 flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code as any)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    language === lang.code
                      ? "bg-primary text-white"
                      : "bg-background/50 text-foreground hover:bg-background"
                  }`}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === "user" ? "bg-primary text-white" : "bg-card text-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card px-4 py-2 rounded-lg">
                  <Loader className="w-4 h-4 animate-spin text-text-muted" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-4 border-t border-border space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder={LANGUAGE_STRINGS[language].placeholder}
                className="flex-1 px-3 py-2 rounded bg-background/50 border border-border text-sm text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                size="sm"
                onClick={isListening ? stopListening : startListening}
                variant={isListening ? "default" : "outline"}
                className="px-3"
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={handleSend} disabled={!input.trim()} className="w-full bg-primary hover:bg-primary-hover">
              <Send className="w-4 h-4 mr-2" />
              {LANGUAGE_STRINGS[language].sendBtn}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}