"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, X, CheckCircle } from "lucide-react"

interface Contact {
  nama: string
  nomor: string
}

interface CSVUploadProps {
  onContactsLoaded: (contacts: Contact[]) => void
  contacts: Contact[]
}

export function CSVUpload({ onContactsLoaded, contacts }: CSVUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const parseCSV = useCallback((csvText: string): Contact[] => {
    const lines = csvText.trim().split("\n")
    if (lines.length < 2) {
      throw new Error("File CSV harus memiliki minimal 2 baris (header + data)")
    }

    const header = lines[0]
      .toLowerCase()
      .split(",")
      .map((h) => h.trim())
    const namaIndex = header.findIndex((h) => h === "nama")
    const nomorIndex = header.findIndex((h) => h === "nomor")

    if (namaIndex === -1 || nomorIndex === -1) {
      throw new Error('File CSV harus memiliki kolom "nama" dan "nomor"')
    }

    const contacts: Contact[] = []
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",").map((cell) => cell.trim())
      if (row.length >= Math.max(namaIndex + 1, nomorIndex + 1)) {
        const nama = row[namaIndex]
        const nomor = row[nomorIndex]

        if (nama && nomor) {
          // Clean phone number - remove non-digits except +
          const cleanedNomor = nomor.replace(/[^\d+]/g, "")
          if (cleanedNomor) {
            contacts.push({ nama, nomor: cleanedNomor })
          }
        }
      }
    }

    if (contacts.length === 0) {
      throw new Error("Tidak ada data kontak valid yang ditemukan")
    }

    return contacts
  }, [])

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Hanya file CSV yang diperbolehkan")
        return
      }

      setIsProcessing(true)
      setError(null)

      try {
        const text = await file.text()
        const parsedContacts = parseCSV(text)
        onContactsLoaded(parsedContacts)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memproses file CSV")
      } finally {
        setIsProcessing(false)
      }
    },
    [parseCSV, onContactsLoaded],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  const clearContacts = useCallback(() => {
    onContactsLoaded([])
    setError(null)
  }, [onContactsLoaded])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload File CSV
        </CardTitle>
        <CardDescription>
          Upload file CSV dengan format: nama,nomor (satu baris header, kemudian data kontak)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.length === 0 ? (
          <>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {isDragOver ? "Lepaskan file di sini" : "Drag & drop file CSV atau klik untuk upload"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">Format: nama,nomor (maksimal 10MB)</p>
              <Label htmlFor="csv-file">
                <Button variant="outline" disabled={isProcessing} asChild>
                  <span>{isProcessing ? "Memproses..." : "Pilih File CSV"}</span>
                </Button>
              </Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInputChange}
                disabled={isProcessing}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Contoh format CSV:</p>
              <pre className="bg-muted p-3 rounded text-xs">
                {`nama,nomor
Andi,6281234567890
Budi,6289876543210
Sari,6287654321098`}
              </pre>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span className="font-medium">{contacts.length} kontak berhasil dimuat</span>
              </div>
              <Button variant="outline" size="sm" onClick={clearContacts}>
                <X className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>

            <div className="max-h-40 overflow-y-auto">
              <div className="text-sm space-y-1">
                {contacts.slice(0, 5).map((contact, index) => (
                  <div key={index} className="flex justify-between py-1 px-2 bg-muted/50 rounded">
                    <span>{contact.nama}</span>
                    <span className="text-muted-foreground">{contact.nomor}</span>
                  </div>
                ))}
                {contacts.length > 5 && (
                  <p className="text-muted-foreground text-center py-2">... dan {contacts.length - 5} kontak lainnya</p>
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
