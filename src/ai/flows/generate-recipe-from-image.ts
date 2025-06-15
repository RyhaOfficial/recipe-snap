'use server';
/**
 * @fileOverview AI flow to generate a recipe from an uploaded image of food.
 *
 * - generateRecipeFromImage - A function that generates a recipe based on a food image.
 * - GenerateRecipeFromImageInput - The input type for the generateRecipeFromImage function.
 * - GenerateRecipeFromImageOutput - The return type for the generateRecipeFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeFromImageInputSchema = z.object({
  foodPhotoDataUri: z
    .string()
    .describe(
      "A photo of food, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe('The language for the AI to respond in (e.g., "Spanish", "French", "Tamil"). Defaults to English if not specified.'),
});
export type GenerateRecipeFromImageInput = z.infer<
  typeof GenerateRecipeFromImageInputSchema
>;

const GenerateRecipeFromImageOutputSchema = z.object({
  recipe: z.string().describe('The generated recipe for the food image.'),
});
export type GenerateRecipeFromImageOutput = z.infer<
  typeof GenerateRecipeFromImageOutputSchema
>;

export async function generateRecipeFromImage(
  input: GenerateRecipeFromImageInput
): Promise<GenerateRecipeFromImageOutput> {
  return generateRecipeFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipeFromImagePrompt',
  input: {schema: GenerateRecipeFromImageInputSchema},
  output: {schema: GenerateRecipeFromImageOutputSchema},
  prompt: `You are an expert chef. Generate a recipe based on the food image provided.
{{#if language}}
Generate the recipe in {{language}}.
{{else}}
Generate the recipe in English.
{{/if}}

Food Image: {{media url=foodPhotoDataUri}}`,
});

const generateRecipeFromImageFlow = ai.defineFlow(
  {
    name: 'generateRecipeFromImageFlow',
    inputSchema: GenerateRecipeFromImageInputSchema,
    outputSchema: GenerateRecipeFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
