"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Eye, AlertTriangle } from "lucide-react"
import { generateSpintaxPreview, validateSpintax, countSpintaxVariations, extractVariables } from "@/lib/spintax"

interface SpintaxPreviewProps {
  template: string
  hasContacts: boolean
}

export function SpintaxPreview({ template, hasContacts }: SpintaxPreviewProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [variations, setVariations] = useState(0)
  const [variables, setVariables] = useState<string[]>([])

  const generatePreviews = () => {
    if (!template.trim()) {
      setPreviews([])
      setErrors([])
      setVariations(0)
      setVariables([])
      return
    }

    const validationErrors = validateSpintax(template)
    setErrors(validationErrors)

    if (validationErrors.length === 0) {
      const newPreviews = generateSpintaxPreview(template, 5)
      setPreviews(newPreviews)
      setVariations(countSpintaxVariations(template))
    } else {
      setPreviews([])
      setVariations(0)
    }

    setVariables(extractVariables(template))
  }

  useEffect(() => {
    generatePreviews()
  }, [template])

  if (!template.trim()) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview Spintax
        </CardTitle>
        <CardDescription>Lihat bagaimana pesan akan diproses dengan spintax dan variabel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Error dalam sintaks spintax:</p>
                <ul className="list-disc list-inside text-sm">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {variables.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Variabel yang ditemukan:</p>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <Badge key={variable} variant={hasContacts ? "default" : "secondary"}>
                  [[{variable}]]
                  {!hasContacts && <span className="ml-1 text-xs">(akan diabaikan)</span>}
                </Badge>
              ))}
            </div>
            {!hasContacts && variables.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Variabel akan diabaikan karena menggunakan input manual nomor
              </p>
            )}
          </div>
        )}

        {variations > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Kemungkinan variasi: <span className="font-medium">{variations.toLocaleString()}</span>
            </p>
            <Button variant="outline" size="sm" onClick={generatePreviews}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Preview
            </Button>
          </div>
        )}

        {previews.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Contoh hasil:</p>
            <div className="space-y-2">
              {previews.map((preview, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                  <span className="text-xs text-muted-foreground">Variasi {index + 1}:</span>
                  <p className="mt-1">{preview}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Sintaks Spintax:</strong> Gunakan {"{option1|option2|option3}"} untuk pilihan acak
          </p>
          <p>
            <strong>Sintaks Variabel:</strong> Gunakan [[nama]] untuk menyisipkan nama dari CSV
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
