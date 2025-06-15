
// This is an AI-powered chatbot designed to answer cooking-related questions.
// It can provide information about recipes, ingredients, or suggest alternatives.
// - answerCookingQuestions - A function that handles the chatbot interactions.
// - AnswerCookingQuestionsInput - The input type for the answerCookingQuestions function.
// - AnswerCookingQuestionsOutput - The return type for the answerCookingQuestions function.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerCookingQuestionsInputSchema = z.object({
  question: z.string().describe('The question about the recipe, ingredients, or alternatives.'),
  recipe: z.string().optional().describe('The recipe to use as context for answering question'),
  language: z.string().optional().describe('The language for the AI to respond in (e.g., "Spanish", "French", "Tamil"). Defaults to English if not specified.'),
});
export type AnswerCookingQuestionsInput = z.infer<
  typeof AnswerCookingQuestionsInputSchema
>;

const AnswerCookingQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AnswerCookingQuestionsOutput = z.infer<
  typeof AnswerCookingQuestionsOutputSchema
>;

export async function answerCookingQuestions(
  input: AnswerCookingQuestionsInput
): Promise<AnswerCookingQuestionsOutput> {
  return answerCookingQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerCookingQuestionsPrompt',
  input: {
    schema: AnswerCookingQuestionsInputSchema,
  },
  output: {
    schema: AnswerCookingQuestionsOutputSchema,
  },
  prompt: `You are a helpful cooking assistant.
{{#if language}}
Respond in {{language}}.
{{else}}
Respond in English.
{{/if}}

If the user asks something unrelated to cooking, gently remind them to stay on topic.
If the user uses mixed language (e.g., Tanglish, Hinglish, Spanglish), try to understand and respond appropriately in the requested language ({{language}} or English if not specified), acknowledging the mixed usage if it feels natural to do so.

Recipe (if provided, use as context):
{{{recipe}}}

User's Question: {{{question}}}`,
});

const answerCookingQuestionsFlow = ai.defineFlow(
  {
    name: 'answerCookingQuestionsFlow',
    inputSchema: AnswerCookingQuestionsInputSchema,
    outputSchema: AnswerCookingQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
