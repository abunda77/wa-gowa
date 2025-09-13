"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Type, Braces, Hash } from "lucide-react"

interface MessageComposerProps {
  message: string
  onMessageChange: (message: string) => void
}

export function MessageComposer({ message, onMessageChange }: MessageComposerProps) {
  const [charCount, setCharCount] = useState(0)

  const handleMessageChange = useCallback(
    (value: string) => {
      onMessageChange(value)
      setCharCount(value.length)
    },
    [onMessageChange],
  )

  const insertSpintaxTemplate = useCallback(
    (template: string) => {
      const textarea = document.getElementById("message-textarea") as HTMLTextAreaElement
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newMessage = message.substring(0, start) + template + message.substring(end)
        handleMessageChange(newMessage)

        // Set cursor position after inserted template
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(start + template.length, start + template.length)
        }, 0)
      }
    },
    [message, handleMessageChange],
  )

  const insertVariable = useCallback(
    (variable: string) => {
      insertSpintaxTemplate(`[[${variable}]]`)
    },
    [insertSpintaxTemplate],
  )

  const spintaxTemplates = [
    { label: "Salam", template: "{Halo|Hai|Selamat pagi|Selamat siang}" },
    { label: "Ingin/Mau", template: "{ingin|mau|hendak}" },
    { label: "Memberitahu", template: "{memberitahu|mengabarkan|kasih info|kasih tahu}" },
    { label: "Jangan Sampai", template: "{Jangan sampai|Pastikan jangan|Jangan|Pastikan tidak}" },
    { label: "Terima Kasih", template: "{Terima kasih|Makasih|Thanks}" },
  ]

  const commonVariables = ["nama"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Composer Pesan
        </CardTitle>
        <CardDescription>Tulis pesan dengan dukungan spintax dan variabel untuk personalisasi</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="message-textarea">Isi Pesan</Label>
            <Badge variant="outline" className="text-xs">
              {charCount} karakter
            </Badge>
          </div>
          <Textarea
            id="message-textarea"
            placeholder="Contoh: {Halo|Hai} [[nama]], {mau|ingin} {kasih info|mengabarkan} promo terbaru dari kami..."
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            className="min-h-32 font-mono text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Braces className="h-4 w-4" />
              <h4 className="text-sm font-medium">Template Spintax</h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {spintaxTemplates.map((template) => (
                <Button
                  key={template.label}
                  variant="outline"
                  size="sm"
                  onClick={() => insertSpintaxTemplate(template.template)}
                  className="justify-start text-xs h-8"
                >
                  <Type className="h-3 w-3 mr-2" />
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              <h4 className="text-sm font-medium">Variabel</h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {commonVariables.map((variable) => (
                <Button
                  key={variable}
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable(variable)}
                  className="justify-start text-xs h-8"
                >
                  <Hash className="h-3 w-3 mr-2" />
                  [[{variable}]]
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="text-sm font-medium">Panduan Sintaks:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <code className="bg-background px-1 rounded">{"{option1|option2|option3}"}</code> - Pilihan acak dari opsi
              yang tersedia
            </p>
            <p>
              <code className="bg-background px-1 rounded">[[nama]]</code> - Variabel yang akan diganti dengan data dari
              CSV
            </p>
            <p>
              <strong>Contoh:</strong>{" "}
              <code className="bg-background px-1 rounded text-xs">
                {"{Halo|Hai} [[nama]], {mau|ingin} kasih info promo terbaru"}
              </code>
            </p>
          </div>
        </div>

        {message && (
          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Tips:</strong> Semakin banyak variasi spintax, semakin unik setiap pesan yang dikirim. Ini
              membantu menghindari deteksi spam.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
