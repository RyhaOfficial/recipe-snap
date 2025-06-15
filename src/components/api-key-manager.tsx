
"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, KeyRound, XCircle } from 'lucide-react';

interface ApiKeyManagerProps {
  onApiKeyConfirm: (key: string) => void;
  isApiKeyConfirmed: boolean;
  resetApiKey: () => void;
}

export function ApiKeyManager({ onApiKeyConfirm, isApiKeyConfirmed, resetApiKey }: ApiKeyManagerProps) {
  const [localApiKey, setLocalApiKey] = useState('');

  const handleConfirm = () => {
    if (localApiKey.trim()) {
      onApiKeyConfirm(localApiKey.trim());
    }
  };

  if (isApiKeyConfirmed) {
    return (
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <CheckCircle className="mr-2 h-6 w-6 text-green-500" />
            API Key Set
          </CardTitle>
          <CardDescription className="font-body">Your Gemini API Key is configured for this session.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={resetApiKey} variant="outline" className="w-full font-body">
            <XCircle className="mr-2 h-4 w-4" /> Change API Key
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
            <KeyRound className="mr-2 h-6 w-6 text-primary" />
            Configure Gemini API Key
        </CardTitle>
        <CardDescription className="font-body">
          Please enter your Gemini API key to enable recipe generation and chatbot features.
          You can get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 transition-colors">Google AI Studio</a>.
          <br />
          To generate one:
          <ol className="list-decimal list-inside mt-1 text-sm text-muted-foreground">
            <li>Click the link above to go to Google AI Studio.</li>
            <li>Click on "Create API key". You might need to create a new project if you don&apos;t have one.</li>
            <li>Copy the generated API key and paste it below.</li>
          </ol>
          This key is used for this session only and is not stored.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="password"
          placeholder="Enter your Gemini API Key"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
          aria-label="Gemini API Key"
          className="text-base font-body"
        />
        <Button onClick={handleConfirm} disabled={!localApiKey.trim()} className="w-full font-body">
          Set API Key
        </Button>
      </CardContent>
    </Card>
  );
}
