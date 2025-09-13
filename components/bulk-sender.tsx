"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Pause, Play, Square, CheckCircle, XCircle, Clock, Loader2, Copy, Eye } from "lucide-react"
import { sendMessage, formatPhoneNumber, type GowaApiConfig, type SendResult } from "@/lib/gowa-api"
import { processSpintax } from "@/lib/spintax"

interface Contact {
  nama: string
  nomor: string
}

interface BulkSenderProps {
  config: GowaApiConfig
  message: string
  contacts: Contact[]
  numbers: string[]
  onSendingComplete: (results: SendResult[]) => void
}

type SendingStatus = "idle" | "sending" | "paused" | "completed" | "cancelled"

export function BulkSender({ config, message, contacts, numbers, onSendingComplete }: BulkSenderProps) {
  const [status, setStatus] = useState<SendingStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<SendResult[]>([])
  const [currentRecipient, setCurrentRecipient] = useState("")
  const [isPaused, setIsPaused] = useState(false)
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set())

  const recipients =
    contacts.length > 0
      ? contacts.map((c) => ({ phone: c.nomor, name: c.nama }))
      : numbers.map((n) => ({ phone: n, name: undefined }))

  const totalRecipients = recipients.length

  const resetSending = useCallback(() => {
    setStatus("idle")
    setProgress(0)
    setCurrentIndex(0)
    setResults([])
    setCurrentRecipient("")
    setIsPaused(false)
    setExpandedLogs(new Set())
  }, [])

  const startSending = useCallback(async () => {
    if (!message.trim()) {
      alert("Pesan tidak boleh kosong")
      return
    }

    if (recipients.length === 0) {
      alert("Tidak ada penerima yang tersedia")
      return
    }

    setStatus("sending")
    setResults([])
    setCurrentIndex(0)
    setProgress(0)
    setIsPaused(false)

    const newResults: SendResult[] = []

    for (let i = 0; i < recipients.length; i++) {
      // Check if paused
      while (isPaused && status === "sending") {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Check if cancelled
      if (status === "cancelled") {
        break
      }

      const recipient = recipients[i]
      setCurrentIndex(i)
      setCurrentRecipient(recipient.name || recipient.phone)

      try {
        // Process spintax for this recipient
        const variables = recipient.name ? { nama: recipient.name } : {}
        const { processedMessage } = processSpintax(message, variables)

        // Format phone number
        const formattedPhone = formatPhoneNumber(recipient.phone)

        // Send message
        const result = await sendMessage(config, {
          phone: formattedPhone,
          message: processedMessage,
          reply_message_id: null,
          is_forwarded: false,
          duration: 3600,
        })

        const sendResult: SendResult = {
          phone: recipient.phone,
          name: recipient.name,
          message: processedMessage,
          success: result.success,
          error: result.error,
          timestamp: new Date(),
          messageId: result.messageId,
          responseCode: result.data?.code,
          responseMessage: result.data?.message,
          apiResponse: result.data,
        }

        newResults.push(sendResult)
        setResults([...newResults])

        // Update progress
        const progressPercent = ((i + 1) / totalRecipients) * 100
        setProgress(progressPercent)

        // Add delay between messages (1-2 seconds)
        const delay = Math.random() * 1000 + 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      } catch (error) {
        const sendResult: SendResult = {
          phone: recipient.phone,
          name: recipient.name,
          message: "Gagal memproses pesan",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date(),
        }

        newResults.push(sendResult)
        setResults([...newResults])
      }
    }

    setStatus("completed")
    setCurrentRecipient("")
    onSendingComplete(newResults)
  }, [message, recipients, config, isPaused, status, totalRecipients, onSendingComplete])

  const pauseSending = useCallback(() => {
    setIsPaused(true)
    setStatus("paused")
  }, [])

  const resumeSending = useCallback(() => {
    setIsPaused(false)
    setStatus("sending")
  }, [])

  const cancelSending = useCallback(() => {
    setStatus("cancelled")
    setIsPaused(false)
  }, [])

  const toggleLogExpansion = useCallback(
    (index: number) => {
      const newExpanded = new Set(expandedLogs)
      if (newExpanded.has(index)) {
        newExpanded.delete(index)
      } else {
        newExpanded.add(index)
      }
      setExpandedLogs(newExpanded)
    },
    [expandedLogs],
  )

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
  }, [])

  const successCount = results.filter((r) => r.success).length
  const failedCount = results.filter((r) => !r.success).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Bulk Sender
        </CardTitle>
        <CardDescription>Kirim pesan ke {totalRecipients} penerima dengan spintax dan personalisasi</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "idle" && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Siap mengirim pesan ke <strong>{totalRecipients} penerima</strong>.
                {contacts.length > 0 && " Pesan akan dipersonalisasi dengan nama dari CSV."}
              </AlertDescription>
            </Alert>

            <Button onClick={startSending} className="w-full" size="lg">
              <Send className="h-4 w-4 mr-2" />
              Mulai Kirim Pesan
            </Button>
          </div>
        )}

        {(status === "sending" || status === "paused") && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  Progress: {currentIndex + 1} dari {totalRecipients}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            {currentRecipient && (
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  Mengirim ke: <strong>{currentRecipient}</strong>
                </span>
              </div>
            )}

            <div className="flex gap-2">
              {status === "sending" ? (
                <Button variant="outline" onClick={pauseSending}>
                  <Pause className="h-4 w-4 mr-2" />
                  Jeda
                </Button>
              ) : (
                <Button variant="outline" onClick={resumeSending}>
                  <Play className="h-4 w-4 mr-2" />
                  Lanjut
                </Button>
              )}
              <Button variant="destructive" onClick={cancelSending}>
                <Square className="h-4 w-4 mr-2" />
                Batal
              </Button>
            </div>

            <div className="flex gap-4 text-sm">
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Berhasil: {successCount}
              </Badge>
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Gagal: {failedCount}
              </Badge>
            </div>
          </div>
        )}

        {(status === "completed" || status === "cancelled") && (
          <div className="space-y-4">
            <Alert variant={status === "completed" ? "default" : "destructive"}>
              <AlertDescription>
                {status === "completed"
                  ? `Pengiriman selesai! ${successCount} berhasil, ${failedCount} gagal.`
                  : `Pengiriman dibatalkan. ${successCount} berhasil, ${failedCount} gagal.`}
              </AlertDescription>
            </Alert>

            <div className="flex gap-4 text-sm">
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Berhasil: {successCount}
              </Badge>
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Gagal: {failedCount}
              </Badge>
            </div>

            <Button onClick={resetSending} variant="outline" className="w-full bg-transparent">
              Kirim Lagi
            </Button>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Log Pengiriman:</h4>
            <ScrollArea className="h-60 w-full border rounded-md p-2">
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-md p-3 bg-card">
                    <div className="flex items-start gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{result.name || result.phone}</span>
                            <Badge variant={result.success ? "default" : "destructive"} className="text-xs">
                              {result.responseCode || (result.success ? "SUCCESS" : "ERROR")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {result.timestamp.toLocaleTimeString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => toggleLogExpansion(index)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {result.error && (
                          <p className="text-red-600 text-xs mt-1">{result.responseMessage || result.error}</p>
                        )}

                        {result.success && result.messageId && (
                          <p className="text-green-600 text-xs mt-1">Message ID: {result.messageId}</p>
                        )}

                        {expandedLogs.has(index) && (
                          <div className="mt-3 space-y-2 border-t pt-2">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Pesan yang dikirim:</p>
                              <div className="bg-muted p-2 rounded text-xs mt-1 relative">
                                <pre className="whitespace-pre-wrap break-words">{result.message}</pre>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(result.message)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {result.apiResponse && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">Response API:</p>
                                <div className="bg-muted p-2 rounded text-xs mt-1 relative">
                                  <pre className="whitespace-pre-wrap break-words">
                                    {JSON.stringify(result.apiResponse, null, 2)}
                                  </pre>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-1 right-1 h-6 w-6 p-0"
                                    onClick={() => copyToClipboard(JSON.stringify(result.apiResponse, null, 2))}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}

                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Detail Pengiriman:</p>
                              <div className="text-xs text-muted-foreground mt-1 space-y-1">
                                <div>Nomor: {result.phone}</div>
                                <div>Formatted: {formatPhoneNumber(result.phone)}</div>
                                <div>Status: {result.success ? "Berhasil" : "Gagal"}</div>
                                <div>Waktu: {result.timestamp.toLocaleString()}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
