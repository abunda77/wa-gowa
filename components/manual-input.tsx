"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, X, CheckCircle } from "lucide-react"

interface ManualInputProps {
  onNumbersLoaded: (numbers: string[]) => void
  numbers: string[]
}

export function ManualInput({ onNumbersLoaded, numbers }: ManualInputProps) {
  const [inputText, setInputText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const processNumbers = useCallback(() => {
    if (!inputText.trim()) {
      setError("Masukkan minimal satu nomor telepon")
      return
    }

    const lines = inputText.trim().split("\n")
    const validNumbers: string[] = []
    const invalidLines: string[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (trimmed) {
        // Clean phone number - remove non-digits except +
        const cleaned = trimmed.replace(/[^\d+]/g, "")
        if (cleaned && cleaned.length >= 10) {
          validNumbers.push(cleaned)
        } else {
          invalidLines.push(`Baris ${index + 1}: "${trimmed}"`)
        }
      }
    })

    if (validNumbers.length === 0) {
      setError("Tidak ada nomor telepon valid yang ditemukan")
      return
    }

    if (invalidLines.length > 0) {
      setError(`Nomor tidak valid ditemukan: ${invalidLines.join(", ")}`)
      return
    }

    setError(null)
    onNumbersLoaded(validNumbers)
  }, [inputText, onNumbersLoaded])

  const clearNumbers = useCallback(() => {
    setInputText("")
    onNumbersLoaded([])
    setError(null)
  }, [onNumbersLoaded])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Input Manual Nomor
        </CardTitle>
        <CardDescription>Masukkan nomor telepon satu per baris (format: 628xxxxxxxxxx)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {numbers.length === 0 ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="numbers-input">Daftar Nomor Telepon</Label>
              <Textarea
                id="numbers-input"
                placeholder={`Contoh:
6281234567890
6289876543210
6287654321098`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-32 font-mono text-sm"
              />
            </div>

            <Button onClick={processNumbers} className="w-full">
              Proses Nomor (
              {
                inputText
                  .trim()
                  .split("\n")
                  .filter((line) => line.trim()).length
              }{" "}
              baris)
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span className="font-medium">{numbers.length} nomor berhasil diproses</span>
              </div>
              <Button variant="outline" size="sm" onClick={clearNumbers}>
                <X className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>

            <div className="max-h-40 overflow-y-auto">
              <div className="text-sm space-y-1">
                {numbers.slice(0, 10).map((number, index) => (
                  <div key={index} className="py-1 px-2 bg-muted/50 rounded font-mono">
                    {number}
                  </div>
                ))}
                {numbers.length > 10 && (
                  <p className="text-muted-foreground text-center py-2">... dan {numbers.length - 10} nomor lainnya</p>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
