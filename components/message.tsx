"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Check, RotateCcw } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import remarkGfm from "remark-gfm"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { GoogleLogo } from "./google-logo"

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

interface MessageProps {
  message: ChatMessage
  onRegenerate?: () => void
}

export default function Message({ message, onRegenerate }: MessageProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="flex flex-col items-end space-y-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{message.timestamp.toLocaleTimeString()}</span>
          <span>•</span>
          <span className="font-medium">You</span>
        </div>

        <Card className="p-5 relative group bg-background border-border max-w-[70%] w-fit">
          {/* Images display for user messages */}
          {message.images && message.images.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-3">
              {message.images.map((image, index) => (
                <img
                  key={index}
                  src={`data:${image.mimeType};base64,${image.data}`}
                  alt={`User uploaded ${index + 1}`}
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight: "300px" }}
                />
              ))}
            </div>
          )}
          <div className="whitespace-pre-wrap break-words leading-relaxed text-sm text-right">{message.content}</div>
          {/* Copy button */}
          {message.complete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(message.content)}
              className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Avatar and timestamp on separate line */}
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-transparent border-0">
            <GoogleLogo className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium">Gemini</span>
          <span>•</span>
          <span>{message.timestamp.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* AI message content - full width */}
      <div className="relative group">
        <div className="prose prose-sm max-w-none text-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "")
                const language = match ? match[1] : ""

                if (!inline && language) {
                  return (
                    <div className="relative my-8 rounded-lg overflow-hidden border border-border">
                      <div className="flex items-center justify-between bg-muted px-6 py-3 text-sm border-b border-border">
                        <span className="font-medium">{language}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(String(children).replace(/\n$/, ""))}
                          className="h-6 px-2"
                        >
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <div className="overflow-x-auto">
                        <SyntaxHighlighter
                          style={oneLight}
                          language={language}
                          PreTag="div"
                          className="!mt-0 !bg-background"
                          customStyle={{
                            margin: 0,
                            padding: "1.5rem",
                            fontSize: "0.875rem",
                            lineHeight: "1.6",
                            backgroundColor: "transparent",
                          }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  )
                }

                return (
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                )
              },
              pre({ children }) {
                return <div className="overflow-x-auto">{children}</div>
              },
              p({ children }) {
                return <p className="break-words leading-relaxed mb-6">{children}</p>
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-8">
                    <table className="min-w-full border border-border">{children}</table>
                  </div>
                )
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Action buttons - only show when AI message is complete */}
      {message.complete && (onRegenerate || message.content) && (
        <div className="flex justify-start gap-2 mt-4">
          {onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              className="h-8 px-3 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(message.content)}
            className="h-8 px-3 text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            Copy
          </Button>
        </div>
      )}
    </div>
  )
}
