
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle, Loader2, AlertTriangle, Bot, User } from 'lucide-react';
import { answerCookingQuestions } from '@/ai/flows/answer-cooking-questions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { toast as ToastType } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

interface ChatInterfaceProps {
  isApiKeyConfirmed: boolean;
  generatedRecipe: string | null;
  selectedLanguage: string; // Added selectedLanguage prop
  toast: typeof ToastType;
}

export function ChatInterface({ isApiKeyConfirmed, generatedRecipe, selectedLanguage, toast }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Optional: Clear messages or add a system message when language changes
    // For now, we'll just let the next message be in the new language
    setMessages(prevMessages => {
      if (prevMessages.length > 0 && prevMessages[prevMessages.length -1].sender !== 'bot') { // Avoid adding multiple system messages
        return prevMessages;
      }
      // You could add a system message here if desired e.g.
      // return [...prevMessages, {id: 'lang_change', sender: 'bot', text: `Chat language set to ${selectedLanguage}`}]
      return prevMessages; 
    });

  }, [selectedLanguage]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { id: Date.now().toString() + '_user', sender: 'user', text: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsChatting(true);

    try {
      const response = await answerCookingQuestions({
        question: currentInput.trim(),
        recipe: generatedRecipe || undefined,
        language: selectedLanguage, // Pass the selected language
      });
      const botMessage: Message = { id: Date.now().toString() + '_bot', sender: 'bot', text: response.answer };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error in chat:", error);
      toast({ title: "Chat Error", description: "Failed to get response from chatbot. Please ensure your API key is correct and try again.", variant: "destructive" });
      const errorMessage: Message = { id: Date.now().toString() + '_error', sender: 'bot', text: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatting(false);
    }
  };
  
  if (!isApiKeyConfirmed) {
    return (
      <Card className="w-full max-w-2xl shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><MessageCircle className="mr-2 h-6 w-6 text-primary" />Cooking Chatbot</CardTitle>
        </CardHeader>
        <CardContent>
           <Alert variant="default" className="border-primary/50">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertTitle className="font-headline">API Key Required</AlertTitle>
            <AlertDescription className="font-body">
              Please set your Gemini API key above to use the chatbot.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg mt-8 animate-subtle-slide-up">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
            <MessageCircle className="mr-2 h-6 w-6 text-primary" />
            Cooking Chatbot
        </CardTitle>
        <CardDescription className="font-body">
          Ask about ingredients, alternatives, or any cooking-related questions in your chosen language! Current: <span className="font-semibold text-primary">{selectedLanguage}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-[500px]">
        <ScrollArea className="flex-grow mb-4 pr-4 -mr-4">
          <div ref={scrollAreaViewportRef} className="h-full space-y-4"> 
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end space-x-2 animate-subtle-fade-in ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <Avatar className="h-8 w-8 self-start">
                    <AvatarFallback><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-xl px-4 py-3 shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-accent-foreground' 
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words font-body">{message.text}</p>
                </div>
                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8 self-start">
                     <AvatarFallback><User className="h-5 w-5 text-foreground" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isChatting && (
              <div className="flex items-end space-x-2 justify-start animate-subtle-fade-in">
                <Avatar className="h-8 w-8 self-start">
                  <AvatarFallback><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] rounded-xl px-4 py-3 shadow-sm bg-accent text-accent-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex items-center space-x-2 pt-4 border-t">
          <Input
            type="text"
            placeholder="Ask a cooking question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isChatting && handleSendMessage()}
            disabled={isChatting}
            className="flex-grow font-body"
            aria-label="Chat input"
          />
          <Button onClick={handleSendMessage} disabled={isChatting || !inputValue.trim()} size="icon" aria-label="Send message">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
