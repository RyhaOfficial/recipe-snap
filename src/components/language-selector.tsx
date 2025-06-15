
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Languages } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

const languages = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Español (Spanish)" },
  { value: "french", label: "Français (French)" },
  { value: "german", label: "Deutsch (German)" },
  { value: "hindi", label: "हिन्दी (Hindi)" },
  { value: "tamil", label: "தமிழ் (Tamil)" },
  { value: "mandarin chinese", label: "中文 (Mandarin)" },
  { value: "japanese", label: "日本語 (Japanese)" },
  { value: "korean", label: "한국어 (Korean)" },
  { value: "arabic", label: "العربية (Arabic)" },
  { value: "portuguese", label: "Português (Portuguese)" },
  { value: "russian", label: "Русский (Russian)" },
  { value: "italian", label: "Italiano (Italian)" },
  // Add more languages as needed
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  isApiKeyConfirmed: boolean;
}

export function LanguageSelector({ selectedLanguage, onLanguageChange, isApiKeyConfirmed }: LanguageSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const currentLanguageLabel = languages.find(
    (lang) => lang.value.toLowerCase() === selectedLanguage.toLowerCase()
  )?.label || selectedLanguage;

  if (!isApiKeyConfirmed) {
    return (
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center">
            <Languages className="mr-2 h-6 w-6 text-primary" />
            Select Language
          </CardTitle>
        </CardHeader>
        <CardContent>
           <Alert variant="default" className="border-primary/50">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertTitle className="font-headline">API Key Required</AlertTitle>
            <AlertDescription className="font-body">
              Please set your Gemini API key above to select a language for the chatbot.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg animate-subtle-slide-up">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
          <Languages className="mr-2 h-6 w-6 text-primary" />
          Select Chat Language
        </CardTitle>
        <CardDescription className="font-body">
          Choose the language for your conversation with the AI cooking assistant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-body"
            >
              {currentLanguageLabel}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Search language..." />
              <CommandList>
                <CommandEmpty>No language found.</CommandEmpty>
                <CommandGroup>
                  {languages.map((language) => (
                    <CommandItem
                      key={language.value}
                      value={language.label} // Value for searchability
                      onSelect={() => {
                        onLanguageChange(language.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedLanguage.toLowerCase() === language.value.toLowerCase() ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {language.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
}
