import { config } from 'dotenv';
config();

import '@/ai/flows/generate-recipe-from-image.ts';
import '@/ai/flows/moderate-image-content.ts';
import '@/ai/flows/answer-cooking-questions.ts';