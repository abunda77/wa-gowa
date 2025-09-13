"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Settings, TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { validateApiConfig, testApiConnection, type GowaApiConfig } from "@/lib/gowa-api"

interface ApiConfigProps {
  config: GowaApiConfig
  onConfigChange: (config: GowaApiConfig) => void
}

export function ApiConfig({ config, onConfigChange }: ApiConfigProps) {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean
    success: boolean
    message: string
  }>({ tested: false, success: false, message: "" })
  const [errors, setErrors] = useState<string[]>([])

  const handleConfigChange = useCallback(
    (field: keyof GowaApiConfig, value: string) => {
      const newConfig = { ...config, [field]: value }
      onConfigChange(newConfig)

      // Clear connection status when config changes
      setConnectionStatus({ tested: false, success: false, message: "" })

      // Validate config
      const validationErrors = validateApiConfig(newConfig)
      setErrors(validationErrors)
    },
    [config, onConfigChange],
  )

  const testConnection = useCallback(async () => {
    const validationErrors = validateApiConfig(config)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsTestingConnection(true)
    setErrors([])

    try {
      const result = await testApiConnection(config)
      setConnectionStatus({
        tested: true,
        success: result.success,
        message: result.success ? result.message! : result.error!,
      })
    } catch (error) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: "Gagal menguji koneksi",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }, [config])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Konfigurasi API Gowa
        </CardTitle>
        <CardDescription>Atur kredensial untuk mengirim pesan melalui API Gowa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint API</Label>
            <Input
              id="endpoint"
              type="url"
              placeholder="http://localhost:3000/send/message"
              value={config.endpoint}
              onChange={(e) => handleConfigChange("endpoint", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Username API"
                value={config.username}
                onChange={(e) => handleConfigChange("username", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password API"
                value={config.password}
                onChange={(e) => handleConfigChange("password", e.target.value)}
              />
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside text-sm">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={testConnection} disabled={isTestingConnection || errors.length > 0}>
            {isTestingConnection ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            {isTestingConnection ? "Menguji..." : "Test Koneksi"}
          </Button>

          {connectionStatus.tested && (
            <Badge variant={connectionStatus.success ? "default" : "destructive"}>
              {connectionStatus.success ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {connectionStatus.success ? "Terhubung" : "Gagal"}
            </Badge>
          )}
        </div>

        {connectionStatus.tested && (
          <Alert variant={connectionStatus.success ? "default" : "destructive"}>
            <AlertDescription>
              <div className="space-y-2">
                <div>{connectionStatus.message}</div>
                {connectionStatus.success && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Detail Response
                    </summary>
                    <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(
                        {
                          code: "SUCCESS",
                          message: "Success",
                          results: {
                            message_id: "3EB0B430B6F8F1D0E053AC120E0A9E5C",
                            status: "success",
                          },
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="text-sm font-medium">Format Payload API:</h4>
          <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
            {JSON.stringify(
              {
                phone: "6281234567890@s.whatsapp.net",
                message: "Contoh pesan yang akan dikirim",
                reply_message_id: null,
                is_forwarded: false,
                duration: 3600,
              },
              null,
              2,
            )}
          </pre>

          <h4 className="text-sm font-medium mt-4">Format Response API:</h4>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Success (200):</p>
              <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                {JSON.stringify(
                  {
                    code: "SUCCESS",
                    message: "Success",
                    results: {
                      message_id: "3EB0B430B6F8F1D0E053AC120E0A9E5C",
                      status: "success",
                    },
                  },
                  null,
                  2,
                )}
              </pre>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Bad Request (400):</p>
              <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                {JSON.stringify(
                  {
                    code: 400,
                    message: "field cannot be blank",
                    results: {},
                  },
                  null,
                  2,
                )}
              </pre>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Server Error (500):</p>
              <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                {JSON.stringify(
                  {
                    code: "INTERNAL_SERVER_ERROR",
                    message: "you are not loggin",
                    results: {},
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
