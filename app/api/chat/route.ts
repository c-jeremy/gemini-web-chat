import { GoogleGenAI } from "@google/genai"
import type { NextRequest } from "next/server"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, images, history, settings } = body

    if (!message && (!images || images.length === 0)) {
      return new Response("Message or images are required", { status: 400 })
    }

    // Build conversation history for context
    const contents = []

    // Add previous messages for context (limit to last 10 for performance)
    const recentHistory = history.slice(-10)

    for (const msg of recentHistory) {
      const parts = []

      // Add text content
      if (msg.content) {
        parts.push({ text: msg.content })
      }

      // Add images content if exists
      if (msg.images && msg.images.length > 0) {
        for (const image of msg.images) {
          parts.push({
            inlineData: {
              mimeType: image.mimeType,
              data: image.data,
            },
          })
        }
      }

      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts,
      })
    }

    // Add current message
    const currentParts = []

    // Add images first if exist
    if (images && images.length > 0) {
      for (const image of images) {
        currentParts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          },
        })
      }
    }

    // Add text
    if (message) {
      currentParts.push({ text: message })
    }

    contents.push({
      role: "user",
      parts: currentParts,
    })

    // Build tools array based on settings
    const tools = []
    if (settings.enableGoogleSearch) {
      tools.push({ googleSearch: {} })
    }

    // Build config with parameter validation
    const config = {
      systemInstruction: settings.systemInstruction || "You are a helpful assistant.",
      maxOutputTokens: Math.min(Math.max(settings.maxOutputTokens || 30000, 1000), 40000),
      temperature: Math.min(Math.max(settings.temperature || 1.0, 0.0), 2.0),
      tools: tools.length > 0 ? tools : undefined,
      safetySettings: [
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    }

    // Only add thinkingConfig if thinking is enabled
    if (settings.enableThinking && settings.thinkingBudget > 0) {
      config.thinkingConfig = {
        thinkingBudget: Math.min(Math.max(settings.thinkingBudget, 0), 10000),
      }
    }

    const model = settings.model || "gemini-2.5-flash"

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    })

    // Create a readable stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
              continue
            }

            const parts = chunk.candidates[0].content.parts

            for (const part of parts) {
              if (part.text) {
                const data = JSON.stringify({
                  type: "text",
                  content: part.text,
                })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
