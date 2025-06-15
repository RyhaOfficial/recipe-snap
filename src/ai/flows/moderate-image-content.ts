'use server';

/**
 * @fileOverview This flow checks if an uploaded image is of food, and prompts the user to upload a food image if it is not.
 *
 * - moderateImageContent - A function that checks if an image is of food.
 * - ModerateImageContentInput - The input type for the moderateImageContent function.
 * - ModerateImageContentOutput - The return type for the moderateImageContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateImageContentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ModerateImageContentInput = z.infer<typeof ModerateImageContentInputSchema>;

const ModerateImageContentOutputSchema = z.object({
  isFood: z.boolean().describe('Whether or not the image is of food.'),
  prompt: z.string().describe('A prompt to the user if the image is not of food.'),
});
export type ModerateImageContentOutput = z.infer<typeof ModerateImageContentOutputSchema>;

export async function moderateImageContent(input: ModerateImageContentInput): Promise<ModerateImageContentOutput> {
  return moderateImageContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateImageContentPrompt',
  input: {schema: ModerateImageContentInputSchema},
  output: {schema: ModerateImageContentOutputSchema},
  prompt: `You are a helpful image analyzer. You will analyze the image and determine if it is of food.

  If the image is of food, return isFood as true, and leave prompt empty.
  If the image is not of food, return isFood as false, and return a prompt to the user to upload a food image.

  Image: {{media url=photoDataUri}}`,
});

const moderateImageContentFlow = ai.defineFlow(
  {
    name: 'moderateImageContentFlow',
    inputSchema: ModerateImageContentInputSchema,
    outputSchema: ModerateImageContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
