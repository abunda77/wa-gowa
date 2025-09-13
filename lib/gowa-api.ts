/**
 * Gowa API Integration for WhatsApp Bulk Messenger
 * Handles sending messages through the Gowa WhatsApp API
 */

export interface GowaApiConfig {
  endpoint: string
  username: string
  password: string
}

export interface MessagePayload {
  phone: string
  message: string
  reply_message_id: string | null
  is_forwarded: boolean
  duration: number
}

export interface SendMessageResponse {
  success: boolean
  message?: string
  error?: string
  data?: GowaApiResponse
  messageId?: string
}

export interface BulkSendProgress {
  total: number
  sent: number
  failed: number
  current: string
  isComplete: boolean
  results: SendResult[]
}

export interface SendResult {
  phone: string
  name?: string
  message: string
  success: boolean
  error?: string
  timestamp: Date
  messageId?: string
  responseCode?: string | number
  responseMessage?: string
  apiResponse?: GowaApiResponse
}

export interface GowaApiResponse {
  code: string | number
  message: string
  results:
    | {
        message_id?: string
        status?: string
      }
    | {}
}

/**
 * Send a single message through Gowa API
 */
export async function sendMessage(config: GowaApiConfig, payload: MessagePayload): Promise<SendMessageResponse> {
  try {
    const credentials = btoa(`${config.username}:${config.password}`)
    
    // Use local API route to avoid CORS issues
    const apiUrl = '/api/gowa/send/message'

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify(payload),
    })

    const data: GowaApiResponse = await response.json()

    if (data.code === "SUCCESS" || response.status === 200) {
      return {
        success: true,
        message: data.message || "Pesan berhasil dikirim",
        data,
        messageId: data.results && "message_id" in data.results ? data.results.message_id : undefined,
      }
    } else if (data.code === 400) {
      return {
        success: false,
        error: data.message || "Field cannot be blank",
        data,
      }
    } else if (data.code === "INTERNAL_SERVER_ERROR" || response.status === 500) {
      return {
        success: false,
        error: data.message || "Internal server error",
        data,
      }
    } else {
      return {
        success: false,
        error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        data,
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal",
    }
  }
}

/**
 * Format phone number for Gowa API
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits except +
  let cleaned = phone.replace(/[^\d+]/g, "")

  // Remove leading + if present
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1)
  }

  // Add @s.whatsapp.net suffix
  return `${cleaned}@s.whatsapp.net`
}

/**
 * Validate API configuration
 */
export function validateApiConfig(config: Partial<GowaApiConfig>): string[] {
  const errors: string[] = []

  if (!config.endpoint?.trim()) {
    errors.push("Endpoint API harus diisi")
  } else {
    try {
      new URL(config.endpoint)
    } catch {
      errors.push("Format endpoint tidak valid")
    }
  }

  if (!config.username?.trim()) {
    errors.push("Username harus diisi")
  }

  if (!config.password?.trim()) {
    errors.push("Password harus diisi")
  }

  return errors
}

/**
 * Test API connection
 */
export async function testApiConnection(config: GowaApiConfig): Promise<SendMessageResponse> {
  // Send a test message to a dummy number to check connection
  const testPayload: MessagePayload = {
    phone: "6281234567890@s.whatsapp.net",
    message: "Test connection",
    reply_message_id: null,
    is_forwarded: false,
    duration: 3600,
  }

  try {
    const credentials = btoa(`${config.username}:${config.password}`)

    // Use local API route to avoid CORS issues
    const apiUrl = '/api/gowa/send/message'

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify(testPayload),
    })

    const data: GowaApiResponse = await response.json()

    if (data.code === "INTERNAL_SERVER_ERROR" && data.message === "you are not loggin") {
      return {
        success: false,
        error: "Username atau password salah",
        data,
      }
    }

    if (response.status === 401) {
      return {
        success: false,
        error: "Username atau password salah",
        data,
      }
    }

    if (response.status === 404) {
      return {
        success: false,
        error: "Endpoint tidak ditemukan",
        data,
      }
    }

    if (data.code === 400) {
      // For connection test, a 400 error means the API is reachable but the test data is invalid
      // This is actually a successful connection test
      return {
        success: true,
        message: "Koneksi API berhasil (endpoint dapat diakses)",
        data,
      }
    }

    if (data.code === "SUCCESS") {
      return {
        success: true,
        message: "Koneksi API berhasil",
        data,
      }
    }

    // Even if we get other responses, if we can communicate with the API, connection is working
    return {
      success: true,
      message: "Koneksi API berhasil (endpoint merespons)",
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal terhubung ke API",
    }
  }
}
