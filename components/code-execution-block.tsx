"use client"
import { Button } from "@/components/ui/button"
import { Copy, Check, Play, Terminal, Search, Zap } from "lucide-react"
import { useState } from "react"

interface CodeExecutionBlockProps {
  content: string
}

export default function CodeExecutionBlock({ content }: CodeExecutionBlockProps) {
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

  const isExecutingCode = content.includes("🔧 Executing Code")
  const isExecutionResult = content.includes("📊 Execution Result")
  const isSearchResult = content.includes("🔍 Search Result")

  if (isExecutingCode) {
    return (
      <div className="my-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border border-orange-200/50 dark:border-orange-800/50 shadow-lg">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-yellow-500/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)] animate-pulse"></div>
        </div>

        {/* Floating particles */}
        <div className="absolute top-2 left-4 w-1 h-1 bg-orange-400 rounded-full animate-ping"></div>
        <div
          className="absolute top-4 right-8 w-1 h-1 bg-amber-400 rounded-full animate-ping"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-3 left-8 w-1 h-1 bg-yellow-400 rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-50/90 to-amber-50/90 dark:from-orange-900/30 dark:to-amber-900/30 border-b border-orange-200/50 dark:border-orange-800/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20"></div>
              <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-full">
                <Play className="h-4 w-4 text-white" />
              </div>
              <Zap className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Executing Code
                </span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-1 h-1 bg-amber-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-yellow-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                ⚡ Running Python script...
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(content)}
            className="h-8 px-3 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="relative p-4 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/50 dark:to-amber-950/50">
          <div className="font-medium text-orange-800 dark:text-orange-200">{content}</div>
        </div>
      </div>
    )
  }

  if (isExecutionResult) {
    return (
      <div className="my-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
        {/* Success shimmer */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent"></div>

        {/* Success glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-green-500/5 to-teal-500/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_50%)] animate-pulse"></div>
        </div>

        {/* Success indicators */}
        <div className="absolute top-2 right-4 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-2 left-4 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>

        <div className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-50/90 to-green-50/90 dark:from-emerald-900/30 dark:to-green-900/30 border-b border-emerald-200/50 dark:border-emerald-800/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
              <div className="relative bg-gradient-to-r from-emerald-500 to-green-500 p-2 rounded-full">
                <Terminal className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Execution Result
                </span>
                <div className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">✓ Success</span>
                </div>
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                🎯 Code executed successfully
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(content)}
            className="h-8 px-3 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all duration-200"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="relative p-4 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/50 dark:to-green-950/50">
          <div className="font-mono text-sm text-emerald-800 dark:text-emerald-200 whitespace-pre-wrap break-words">
            {content}
          </div>
        </div>
      </div>
    )
  }

  if (isSearchResult) {
    return (
      <div className="my-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
        {/* Search shimmer */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"></div>

        {/* Search waves */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse"></div>
        </div>

        {/* Search indicators */}
        <div className="absolute top-3 right-6 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
        <div
          className="absolute bottom-3 left-6 w-1 h-1 bg-indigo-400 rounded-full animate-ping"
          style={{ animationDelay: "0.5s" }}
        ></div>

        <div className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-900/30 dark:to-indigo-900/30 border-b border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-full">
                <Search className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Search Result
                </span>
                <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">🌐 Live</span>
                </div>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">🔍 Found relevant information</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(content)}
            className="h-8 px-3 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="relative p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/50 dark:to-indigo-950/50">
          <div className="text-blue-800 dark:text-blue-200">{content}</div>
        </div>
      </div>
    )
  }

  return <div className="font-semibold text-blue-600 dark:text-blue-400 my-2">{content}</div>
}
