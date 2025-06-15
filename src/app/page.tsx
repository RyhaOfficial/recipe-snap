
"use client";

import React, { useState, useEffect } from 'react';
import { ApiKeyManager } from '@/components/api-key-manager';
import { RecipeGenerator } from '@/components/recipe-generator';
import { ChatInterface } from '@/components/chat-interface';
import { LanguageSelector } from '@/components/language-selector';
import { useToast } from "@/hooks/use-toast";
import { Utensils, Github, Instagram } from 'lucide-react';

export default function HomePage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyConfirmed, setIsApiKeyConfirmed] = useState(false);
  const [generatedRecipeForChat, setGeneratedRecipeForChat] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  const { toast } = useToast();

  useEffect(() => {
    const confirmedStatus = localStorage.getItem('recipeSnapApiKeyConfirmed');
    if (confirmedStatus === 'true') {
      setIsApiKeyConfirmed(true);
    }
    const storedLanguage = localStorage.getItem('recipeSnapSelectedLanguage');
    if (storedLanguage) {
      setSelectedLanguage(storedLanguage);
    }
  }, []);

  const handleApiKeyConfirm = (key: string) => {
    setApiKey(key); 
    setIsApiKeyConfirmed(true);
    localStorage.setItem('recipeSnapApiKeyConfirmed', 'true');
    toast({
      title: "API Key Set",
      description: "Your Gemini API Key has been acknowledged for this session.",
    });
  };

  const resetApiKey = () => {
    setApiKey(null);
    setIsApiKeyConfirmed(false);
    localStorage.removeItem('recipeSnapApiKeyConfirmed');
    setGeneratedRecipeForChat(null); 
    toast({
      title: "API Key Cleared",
      description: "Please enter an API Key to re-enable features.",
      variant: "default"
    });
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    localStorage.setItem('recipeSnapSelectedLanguage', language);
    toast({
      title: "Language Changed",
      description: `Content language set to ${language}.`,
    });
  };

  return (
    <div className="bg-background min-h-screen flex flex-col items-center py-8 px-4 selection:bg-primary/30">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-headline text-primary mb-2 flex items-center justify-center">
          <Utensils className="mr-3 h-12 w-12" />
          Recipe Snap
        </h1>
        <p className="text-lg text-foreground/80 font-body">
          Snap a food pic, get a recipe, and chat with our AI chef!
        </p>
      </header>

      <main className="w-full max-w-2xl space-y-8">
        <ApiKeyManager
          onApiKeyConfirm={handleApiKeyConfirm}
          isApiKeyConfirmed={isApiKeyConfirmed}
          resetApiKey={resetApiKey}
        />

        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
          isApiKeyConfirmed={isApiKeyConfirmed}
        />

        <RecipeGenerator
          isApiKeyConfirmed={isApiKeyConfirmed}
          toast={toast}
          onRecipeGenerated={setGeneratedRecipeForChat}
          selectedLanguage={selectedLanguage}
        />
        
        <ChatInterface
          isApiKeyConfirmed={isApiKeyConfirmed}
          generatedRecipe={generatedRecipeForChat}
          selectedLanguage={selectedLanguage}
          toast={toast}
        />
      </main>
      
      <footer className="mt-12 text-center text-sm text-muted-foreground font-body">
        <p>&copy; {new Date().getFullYear()} Ryha Recipe Snap. Made by Ryha.</p>
        <div className="flex justify-center items-center space-x-4 mt-2">
          <a
            href="https://github.com/RyhaOfficial"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-5 w-5 mr-1" />
            RyhaOfficial
          </a>
          <a
            href="https://www.instagram.com/vellu.raju/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <Instagram className="h-5 w-5 mr-1" />
            vellu.raju
          </a>
        </div>
        <p className="text-xs mt-2">Powered by Genkit and Gemini AI.</p>
      </footer>
    </div>
  );
}
