"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Upload, Users, Settings, Send } from "lucide-react";

import { CSVUpload } from "@/components/csv-upload";
import { ManualInput } from "@/components/manual-input";
import { MessageComposer } from "@/components/message-composer";
import { SpintaxPreview } from "@/components/spintax-preview";
import { ApiConfig } from "@/components/api-config";
import { BulkSender } from "@/components/bulk-sender";

import type { GowaApiConfig, SendResult } from "@/lib/gowa-api";

interface Contact {
  nama: string;
  nomor: string;
}

export default function WhatsAppBulkMessenger() {
  // Recipients state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [inputMode, setInputMode] = useState<"csv" | "manual">("csv");

  // Message state
  const [message, setMessage] = useState("");

  // API configuration state
  const [apiConfig, setApiConfig] = useState<GowaApiConfig>({
    endpoint: "http://localhost:3000/send/message",
    username: "",
    password: "",
  });

  // Sending results state
  const [sendingResults, setSendingResults] = useState<SendResult[]>([]);

  const totalRecipients =
    contacts.length > 0 ? contacts.length : numbers.length;
  const hasRecipients = totalRecipients > 0;
  const hasMessage = message.trim().length > 0;
  const hasApiConfig =
    apiConfig.username && apiConfig.password && apiConfig.endpoint;
  const canSend = hasRecipients && hasMessage && hasApiConfig;

  const handleContactsLoaded = (newContacts: Contact[]) => {
    setContacts(newContacts);
    setNumbers([]); // Clear manual numbers when CSV is loaded
    setInputMode("csv");
  };

  const handleNumbersLoaded = (newNumbers: string[]) => {
    setNumbers(newNumbers);
    setContacts([]); // Clear CSV contacts when manual numbers are loaded
    setInputMode("manual");
  };

  const handleSendingComplete = (results: SendResult[]) => {
    setSendingResults(results);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-balance mb-2">
            WhatsApp Bulk Messenger
          </h1>
          <p className="text-muted-foreground text-lg text-pretty">
            Kirim pesan WhatsApp secara massal dengan spintax dan personalisasi
            melalui API Gowa
          </p>
        </div>

        {/* Status Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Status Aplikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant={hasRecipients ? "default" : "secondary"}>
                {inputMode === "csv" ? (
                  <Upload className="h-3 w-3 mr-1" />
                ) : (
                  <Users className="h-3 w-3 mr-1" />
                )}
                {hasRecipients
                  ? `${totalRecipients} Penerima`
                  : "Belum ada penerima"}
              </Badge>
              <Badge variant={hasMessage ? "default" : "secondary"}>
                <MessageSquare className="h-3 w-3 mr-1" />
                {hasMessage ? "Pesan siap" : "Belum ada pesan"}
              </Badge>
              <Badge variant={hasApiConfig ? "default" : "secondary"}>
                <Settings className="h-3 w-3 mr-1" />
                {hasApiConfig
                  ? "API terkonfigurasi"
                  : "API belum dikonfigurasi"}
              </Badge>
              <Badge variant={canSend ? "default" : "outline"}>
                <Send className="h-3 w-3 mr-1" />
                {canSend ? "Siap kirim" : "Belum siap"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="recipients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="recipients"
              className="hover:bg-primary/10 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
            >
              1. Penerima
            </TabsTrigger>
            <TabsTrigger
              value="message"
              className="hover:bg-primary/10 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
            >
              2. Pesan
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="hover:bg-primary/10 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
            >
              3. API
            </TabsTrigger>
            <TabsTrigger
              value="send"
              className="hover:bg-primary/10 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
            >
              4. Kirim
            </TabsTrigger>
          </TabsList>

          {/* Recipients Tab */}
          <TabsContent value="recipients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CSVUpload
                contacts={contacts}
                onContactsLoaded={handleContactsLoaded}
              />
              <ManualInput
                numbers={numbers}
                onNumbersLoaded={handleNumbersLoaded}
              />
            </div>

            {hasRecipients && (
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Penerima</CardTitle>
                  <CardDescription>
                    Mode: {inputMode === "csv" ? "Upload CSV" : "Input Manual"}{" "}
                    • Total: {totalRecipients} penerima
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {inputMode === "csv"
                      ? "Pesan akan dipersonalisasi dengan nama dari file CSV"
                      : "Pesan akan dikirim tanpa personalisasi nama"}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Message Tab */}
          <TabsContent value="message" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MessageComposer message={message} onMessageChange={setMessage} />
              <SpintaxPreview
                template={message}
                hasContacts={contacts.length > 0}
              />
            </div>
          </TabsContent>

          {/* API Config Tab */}
          <TabsContent value="config" className="space-y-6">
            <ApiConfig config={apiConfig} onConfigChange={setApiConfig} />
          </TabsContent>

          {/* Send Tab */}
          <TabsContent value="send" className="space-y-6">
            {!canSend ? (
              <Card>
                <CardHeader>
                  <CardTitle>Belum Siap Mengirim</CardTitle>
                  <CardDescription>
                    Lengkapi semua langkah sebelum mengirim pesan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {!hasRecipients && (
                      <p>• Tambahkan penerima di tab "Penerima"</p>
                    )}
                    {!hasMessage && <p>• Tulis pesan di tab "Pesan"</p>}
                    {!hasApiConfig && <p>• Konfigurasi API di tab "API"</p>}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <BulkSender
                config={apiConfig}
                message={message}
                contacts={contacts}
                numbers={numbers}
                onSendingComplete={handleSendingComplete}
              />
            )}

            {sendingResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Hasil Pengiriman Terakhir</CardTitle>
                  <CardDescription>
                    {sendingResults.filter((r) => r.success).length} berhasil,{" "}
                    {sendingResults.filter((r) => !r.success).length} gagal dari{" "}
                    {sendingResults.length} total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Pengiriman selesai pada{" "}
                    {sendingResults[
                      sendingResults.length - 1
                    ]?.timestamp.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
