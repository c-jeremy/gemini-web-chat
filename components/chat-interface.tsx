"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Settings, Trash2, X, Menu, ArrowUp, Plus } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Message from "./message"
import SettingsModal from "./settings-modal"
import { GoogleLogo } from "./google-logo"
import { useToast } from "@/hooks/use-toast"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  complete?: boolean
  images?: {
    data: string
    mimeType: string
  }[]
}

export interface ChatSettings {
  systemInstruction: string
  enableGoogleSearch: boolean
  enableThinking: boolean
  temperature: number
  thinkingBudget: number
  maxOutputTokens: number
  model: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState<{ data: string; mimeType: string }[]>([])
  const { toast } = useToast()

  const [settings, setSettings] = useState<ChatSettings>({
    systemInstruction: "You are a helpful assistant.",
    enableGoogleSearch: true,
    enableThinking: true,
    temperature: 1.0,
    thinkingBudget: 5625,
    maxOutputTokens: 30000,
    model: "gemini-2.5-flash",
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input, selectedImages)
    setInput("")
    setSelectedImages([])
  }

  const scrollToUserMessage = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }
      }
    }, 100)
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    if (selectedImages.length + files.length > 3) {
      toast({
        title: "Too Many Images",
        description: "You can upload up to 3 images at once.",
        variant: "destructive",
      })
      return
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        })
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 10MB.`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        const base64Data = result.split(",")[1]
        setSelectedImages((prev) => [
          ...prev,
          {
            data: base64Data,
            mimeType: file.type,
          },
        ])
      }
      reader.readAsDataURL(file)
    })

    if (validFiles.length > 0) {
      toast({
        title: "Images Selected",
        description: `${validFiles.length} image(s) ready to send.`,
      })
    }
  }

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const sendMessage = async (messageContent: string, messageImages?: { data: string; mimeType: string }[]) => {
    if (isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent || "Please analyze these images.",
      timestamp: new Date(),
      complete: true,
      images: messageImages && messageImages.length > 0 ? messageImages : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    scrollToUserMessage()

    try {
      const requestBody = {
        message: userMessage.content,
        images: userMessage.images,
        history: messages,
        settings,
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let done = false
      let receivedData = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone

        if (value) {
          receivedData = true
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") {
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, complete: true } : msg)),
                )
                done = true
                break
              }

              try {
                const parsed = JSON.parse(data)

                if (parsed.type === "text" && parsed.content) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id ? { ...msg, content: msg.content + parsed.content } : msg,
                    ),
                  )
                }
              } catch (e) {
                // Ignore parsing errors for partial chunks
              }
            }
          }
        }
      }

      if (!receivedData) {
        throw new Error("No data received from server")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
      })

      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error while processing your request: ${errorMessage}\n\nPlease try again.`,
        timestamp: new Date(),
        complete: true,
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessageWithHistory = async (
    messageContent: string,
    messageImages?: { data: string; mimeType: string }[],
    historyOverride?: ChatMessage[],
  ) => {
    if (isLoading) return

    const currentHistory = historyOverride || messages
    setIsLoading(true)
    scrollToUserMessage()

    try {
      const requestBody = {
        message: messageContent,
        images: messageImages,
        history: currentHistory,
        settings,
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let done = false
      let receivedData = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone

        if (value) {
          receivedData = true
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") {
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, complete: true } : msg)),
                )
                done = true
                break
              }

              try {
                const parsed = JSON.parse(data)

                if (parsed.type === "text" && parsed.content) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id ? { ...msg, content: msg.content + parsed.content } : msg,
                    ),
                  )
                }
              } catch (e) {
                // Ignore parsing errors for partial chunks
              }
            }
          }
        }
      }

      if (!receivedData) {
        throw new Error("No data received from server")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
      })

      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error while processing your request: ${errorMessage}\n\nPlease try again.`,
        timestamp: new Date(),
        complete: true,
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = (messageIndex: number) => {
    if (isLoading) return

    // Find the user message that preceded this AI message
    const userMessage = messages[messageIndex - 1]
    if (userMessage && userMessage.role === "user") {
      // Remove the AI message and any subsequent messages
      const newMessages = messages.slice(0, messageIndex)
      setMessages(newMessages)

      // Resend the user message with the updated history
      sendMessageWithHistory(userMessage.content, userMessage.images, newMessages)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const quickSwitchModel = () => {
    const newModel = settings.model === "gemini-2.5-flash" ? "gemini-2.5-pro" : "gemini-2.5-flash"
    setSettings({ ...settings, model: newModel })
    toast({
      title: "Model Switched",
      description: `Now using ${newModel === "gemini-2.5-pro" ? "Gemini Pro" : "Gemini Flash"}`,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const HeaderActions = () => (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="sm" onClick={clearChat} disabled={messages.length === 0} className="hidden sm:flex">
        <Trash2 className="h-4 w-4 mr-2" />
        Clear
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)} className="hidden sm:flex">
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Button>
    </div>
  )

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="sm:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64">
        <div className="flex flex-col gap-6 mt-8">
          <Button variant="ghost" onClick={clearChat} disabled={messages.length === 0} className="justify-start">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
          <Button variant="ghost" onClick={() => setIsSettingsOpen(true)} className="justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="flex flex-col h-screen">
      {/* Header - Made smaller */}
      <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <GoogleLogo className="h-6 w-6" />
          <div>
            <h1 className="font-medium">Gemini</h1>
            <Button variant="ghost" size="sm" onClick={quickSwitchModel} className="h-auto p-0 font-normal">
              <Badge variant="secondary" className="text-xs font-normal cursor-pointer hover:bg-secondary/80">
                {settings.model === "gemini-2.5-pro" ? "Pro" : "Flash"}
              </Badge>
            </Button>
          </div>
        </div>
        <HeaderActions />
        <MobileMenu />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <GoogleLogo className="h-16 w-16 mb-8" />
            <h2 className="text-2xl font-medium mb-4">Hello</h2>
            <p className="text-muted-foreground text-center max-w-md mb-12 leading-relaxed">
              How can I help you today?
            </p>
          </div>
        ) : (
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="max-w-4xl mx-auto p-8 space-y-10">
              {messages.map((message, index) => (
                <Message
                  key={message.id}
                  message={message}
                  onRegenerate={
                    message.role === "assistant" && message.complete ? () => handleRegenerate(index) : undefined
                  }
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Gemini is thinking...</span>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input area */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <Card className="mb-4 p-3 border-border">
              <div className="flex flex-wrap gap-3">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={`data:${image.mimeType};base64,${image.data}`}
                      alt={`Selected ${index + 1}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSelectedImage(index)}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-background border border-border rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center text-sm text-muted-foreground">
                  {selectedImages.length}/3 images selected
                </div>
              </div>
            </Card>
          )}

          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Gemini..."
              className="min-h-[80px] max-h-[200px] pr-12 resize-none border-border text-base leading-relaxed"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="absolute left-2 bottom-2 h-8 w-8 p-0"
              disabled={selectedImages.length >= 3}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              disabled={(!input.trim() && selectedImages.length === 0) || isLoading}
              size="sm"
              className="absolute right-2 bottom-2 h-8 w-8 p-0"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  )
}
