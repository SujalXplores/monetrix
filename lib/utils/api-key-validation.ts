import { OpenAI } from 'openai';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateOpenAIKey(
  apiKey: string,
): Promise<ValidationResult> {
  try {
    const openai = new OpenAI({ apiKey });
    const list = await openai.models.list();

    if (list.data.length > 0) {
      return { isValid: true };
    }
    return {
      isValid: false,
      error: 'Invalid OpenAI API key',
    };
  } catch (_error) {
    return {
      isValid: false,
      error: 'Invalid OpenAI API key. Please check your key and try again.',
    };
  }
}
