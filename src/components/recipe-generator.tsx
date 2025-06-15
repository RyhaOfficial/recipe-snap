
"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChefHat, Loader2, AlertTriangle, X } from 'lucide-react';
import { moderateImageContent, ModerateImageContentOutput } from '@/ai/flows/moderate-image-content';
import { generateRecipeFromImage } from '@/ai/flows/generate-recipe-from-image';
import type { toast as ToastType } from '@/hooks/use-toast';

interface RecipeGeneratorProps {
  isApiKeyConfirmed: boolean;
  toast: typeof ToastType;
  onRecipeGenerated: (recipe: string | null) => void;
  selectedLanguage: string; 
}

// Placeholder for SparklesIcon as it is not in lucide-react
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2.5a1.68 1.68 0 0 1 2.58 1.19c.16.52.01 1.14-.35 1.64l-1.9 2.66c-.2.28-.53.38-.83.26-.3-.12-.5-.41-.5-.75V3.5a1 1 0 0 1 1-1Z" />
      <path d="M14.5 16.5a1.68 1.68 0 0 1 2.58 1.19c.16.52.01 1.14-.35 1.64l-1.9 2.66c-.2.28-.53.38-.83.26-.3-.12-.5-.41-.5-.75v-4a1 1 0 0 1 1-1Z" />
      <path d="M5.21 7.21a1 1 0 0 1 .04 1.5l-1.8 2.64c-.39.57-.3 1.32.22 1.79.52.47 1.28.42 1.75-.15l1.8-2.64a1 1 0 0 1 1.56-.04Z" />
      <path d="M18.79 12.79a1 1 0 0 1 .04 1.5l-1.8 2.64c-.39.57-.3 1.32.22 1.79.52.47 1.28.42 1.75-.15l1.8-2.64a1 1 0 0 1 1.56-.04Z" />
      <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" />
      <path d="m4.93 19.07 1.41-1.41" /><path d="m17.66 6.34 1.41-1.41" />
    </svg>
  );
}

export function RecipeGenerator({ isApiKeyConfirmed, toast, onRecipeGenerated, selectedLanguage }: RecipeGeneratorProps) {
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [moderationResult, setModerationResult] = useState<ModerateImageContentOutput | null>(null);
  const [localGeneratedRecipe, setLocalGeneratedRecipe] = useState<string | null>(null);
  const [isModerating, setIsModerating] = useState(false);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLocalGeneratedRecipe(null); 
      onRecipeGenerated(null);
      setModerationResult(null); 
      setIsModerating(true);
      setImageDataUri(null); 

      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        setImageDataUri(dataUri); 

        try {
          const modResult = await moderateImageContent({ photoDataUri: dataUri });
          setModerationResult(modResult);
          if (!modResult.isFood) {
            setImageDataUri(null); 
            if (fileInputRef.current) fileInputRef.current.value = ""; 
          }
        } catch (error) {
          console.error("Error moderating image:", error);
          toast({ title: "Moderation Error", description: "Failed to analyze image. Please ensure your API key is correct and try again.", variant: "destructive" });
          setImageDataUri(null); 
           if (fileInputRef.current) fileInputRef.current.value = ""; 
        } finally {
          setIsModerating(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateRecipe = async () => {
    if (!imageDataUri || !moderationResult?.isFood) {
      toast({ title: "Cannot Generate Recipe", description: "Please upload a valid food image first.", variant: "destructive" });
      return;
    }
    setIsGeneratingRecipe(true);
    setLocalGeneratedRecipe(null);
    onRecipeGenerated(null);
    try {
      const recipeResult = await generateRecipeFromImage({ 
        foodPhotoDataUri: imageDataUri,
        language: selectedLanguage 
      });
      setLocalGeneratedRecipe(recipeResult.recipe);
      onRecipeGenerated(recipeResult.recipe);
    } catch (error) {
      console.error("Error generating recipe:", error);
      toast({ title: "Recipe Generation Error", description: "Failed to generate recipe. Please check your API key and try again.", variant: "destructive" });
    } finally {
      setIsGeneratingRecipe(false);
    }
  };

  const clearImage = () => {
    setImageDataUri(null);
    setModerationResult(null);
    setLocalGeneratedRecipe(null);
    onRecipeGenerated(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isApiKeyConfirmed) {
    return (
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><ChefHat className="mr-2 h-6 w-6 text-primary" />Recipe Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="border-primary/50">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertTitle className="font-headline">API Key Required</AlertTitle>
            <AlertDescription className="font-body">
              Please set your Gemini API key above to use the recipe generator.
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
            <ChefHat className="mr-2 h-6 w-6 text-primary" />
            Generate a Recipe
        </CardTitle>
        <CardDescription className="font-body">
          Upload an image of a dish, and we&apos;ll whip up a recipe for you in your chosen language! Current: <span className="font-semibold text-primary">{selectedLanguage}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-foreground mb-1 font-body">
            Upload Food Image
          </label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            disabled={isModerating || isGeneratingRecipe}
            className="font-body file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>

        {isModerating && (
          <div className="flex items-center justify-center p-4 text-muted-foreground font-body">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing image...
          </div>
        )}

        {moderationResult && !moderationResult.isFood && moderationResult.prompt && (
          <Alert variant="destructive" className="animate-subtle-fade-in">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="font-headline">Image Not Suitable</AlertTitle>
            <AlertDescription className="font-body">{moderationResult.prompt}</AlertDescription>
          </Alert>
        )}
        
        {imageDataUri && moderationResult?.isFood && (
          <div className="mt-4 space-y-4 animate-subtle-fade-in relative">
            <p className="text-sm text-green-600 font-medium font-body">Food image detected!</p>
            <div className="relative group w-full aspect-[16/9] rounded-lg overflow-hidden border border-border shadow-sm">
              <Image src={imageDataUri} alt="Uploaded food" layout="fill" objectFit="cover" data-ai-hint="food dish"/>
              <Button
                variant="destructive"
                size="icon"
                onClick={clearImage}
                className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleGenerateRecipe}
              disabled={isGeneratingRecipe || isModerating || !imageDataUri}
              className="w-full font-body"
            >
              {isGeneratingRecipe ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SparklesIcon className="mr-2 h-4 w-4" />
              )}
              Generate Recipe
            </Button>
          </div>
        )}

        {isGeneratingRecipe && !localGeneratedRecipe && (
           <div className="flex items-center justify-center p-4 text-muted-foreground font-body">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating your delicious recipe...
          </div>
        )}

        {localGeneratedRecipe && (
          <div className="mt-6 animate-subtle-fade-in">
            <h3 className="text-lg font-headline mb-2 text-primary">Your Generated Recipe:</h3>
            <ScrollArea className="h-72 w-full rounded-md border p-4 bg-background shadow-inner">
              <pre className="whitespace-pre-wrap break-words font-body text-sm leading-relaxed">{localGeneratedRecipe}</pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
