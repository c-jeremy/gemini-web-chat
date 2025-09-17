"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Save, Plus } from "lucide-react"
import type { ChatSettings } from "./chat-interface"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: ChatSettings
  onSave: (settings: ChatSettings) => void
}

interface SavedInstruction {
  id: string
  name: string
  instruction: string
}

export default function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings)
  const [savedInstructions, setSavedInstructions] = useState<SavedInstruction[]>([])
  const [newInstructionName, setNewInstructionName] = useState("")
  const [showSaveForm, setShowSaveForm] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("gemini-saved-instructions")
    if (saved) {
      try {
        setSavedInstructions(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse saved instructions:", e)
      }
    }
  }, [])

  const saveInstructionsToStorage = (instructions: SavedInstruction[]) => {
    localStorage.setItem("gemini-saved-instructions", JSON.stringify(instructions))
    setSavedInstructions(instructions)
  }

  const handleSave = () => {
    onSave(localSettings)
    onClose()
  }

  const saveCurrentInstruction = () => {
    if (!newInstructionName.trim()) return

    const newInstruction: SavedInstruction = {
      id: Date.now().toString(),
      name: newInstructionName.trim(),
      instruction: localSettings.systemInstruction,
    }

    const updated = [...savedInstructions, newInstruction]
    saveInstructionsToStorage(updated)
    setNewInstructionName("")
    setShowSaveForm(false)
  }

  const loadInstruction = (instruction: SavedInstruction) => {
    setLocalSettings({ ...localSettings, systemInstruction: instruction.instruction })
  }

  const deleteInstruction = (id: string) => {
    const updated = savedInstructions.filter((inst) => inst.id !== id)
    saveInstructionsToStorage(updated)
  }

  const defaultInstructions = [
    {
      id: "default",
      name: "Default Assistant",
      instruction: "You are a helpful assistant.",
    },
    {
      id: "creative",
      name: "Creative Writer",
      instruction:
        "You are a creative writing assistant. Help users with storytelling, poetry, and creative content. Be imaginative and inspiring.",
    },
    {
      id: "technical",
      name: "Technical Expert",
      instruction:
        "You are a technical expert specializing in programming, software development, and technology. Provide detailed, accurate technical guidance.",
    },
    {
      id: "teacher",
      name: "Patient Teacher",
      instruction:
        "You are a patient and encouraging teacher. Explain concepts clearly, use examples, and adapt your teaching style to help users learn effectively.",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-8 py-6">
          {/* Model Selection */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-medium">AI Model</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select
                value={localSettings.model}
                onValueChange={(value) => setLocalSettings({ ...localSettings, model: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-2.5-flash">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Gemini 2.5 Flash</span>
                      <span className="text-xs text-muted-foreground">Fast and efficient</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="gemini-2.5-pro">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Gemini 2.5 Pro</span>
                      <span className="text-xs text-muted-foreground">Most capable</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Choose the AI model that best fits your needs.
              </p>
            </CardContent>
          </Card>

          {/* System Instructions */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">System Instruction</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowSaveForm(!showSaveForm)}>
                  <Plus className="h-3 w-3 mr-2" />
                  Save Current
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Select */}
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">Quick Select:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {defaultInstructions.map((inst) => (
                    <Button
                      key={inst.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setLocalSettings({ ...localSettings, systemInstruction: inst.instruction })}
                      className="text-left justify-start h-auto p-4 border-border"
                    >
                      <div>
                        <div className="font-medium text-sm">{inst.name}</div>
                        <div className="text-xs text-muted-foreground truncate mt-1">
                          {inst.instruction.slice(0, 50)}...
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Saved Instructions */}
              {savedInstructions.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground">Your Saved Instructions:</Label>
                  <div className="space-y-3 max-h-32 overflow-y-auto">
                    {savedInstructions.map((inst) => (
                      <div key={inst.id} className="flex items-center gap-3 p-3 border rounded-md border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadInstruction(inst)}
                          className="flex-1 text-left justify-start h-auto p-2"
                        >
                          <div>
                            <div className="font-medium text-sm">{inst.name}</div>
                            <div className="text-xs text-muted-foreground truncate mt-1">
                              {inst.instruction.slice(0, 40)}...
                            </div>
                          </div>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteInstruction(inst.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Form */}
              {showSaveForm && (
                <div className="flex gap-3 p-4 bg-muted rounded-md">
                  <Input
                    placeholder="Instruction name..."
                    value={newInstructionName}
                    onChange={(e) => setNewInstructionName(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={saveCurrentInstruction} disabled={!newInstructionName.trim()}>
                    <Save className="h-3 w-3 mr-2" />
                    Save
                  </Button>
                </div>
              )}

              <Textarea
                value={localSettings.systemInstruction}
                onChange={(e) => setLocalSettings({ ...localSettings, systemInstruction: e.target.value })}
                placeholder="You are a helpful assistant."
                className="min-h-[120px] border-border"
              />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Define how Gemini should behave and respond to your queries.
              </p>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Temperature */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Temperature</Label>
                  <span className="text-sm text-muted-foreground">{localSettings.temperature.toFixed(1)}</span>
                </div>
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  value={[localSettings.temperature]}
                  onValueChange={(value) => setLocalSettings({ ...localSettings, temperature: value[0] })}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Controls randomness: 0.0 = focused and deterministic, 2.0 = creative and random
                </p>
              </div>

              {/* Max Output Tokens */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Max Output Tokens</Label>
                  <span className="text-sm text-muted-foreground">
                    {localSettings.maxOutputTokens.toLocaleString()}
                  </span>
                </div>
                <Slider
                  min={2000}
                  max={40000}
                  step={1000}
                  value={[localSettings.maxOutputTokens]}
                  onValueChange={(value) => setLocalSettings({ ...localSettings, maxOutputTokens: value[0] })}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Maximum number of tokens in the response (higher = longer responses)
                </p>
              </div>

              {/* Thinking Budget */}
              {localSettings.enableThinking && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Thinking Budget</Label>
                    <span className="text-sm text-muted-foreground">
                      {localSettings.thinkingBudget.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={10000}
                    step={100}
                    value={[localSettings.thinkingBudget]}
                    onValueChange={(value) => setLocalSettings({ ...localSettings, thinkingBudget: value[0] })}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Amount of thinking tokens for complex reasoning (higher = deeper analysis)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Google Search</Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Allow Gemini to search the web for up-to-date information.
                  </p>
                </div>
                <Switch
                  checked={localSettings.enableGoogleSearch}
                  onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enableGoogleSearch: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Advanced Thinking</Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Enable Gemini's advanced thinking capabilities for complex questions.
                  </p>
                </div>
                <Switch
                  checked={localSettings.enableThinking}
                  onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enableThinking: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
