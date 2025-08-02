'use server';

import { auth } from '@clerk/nextjs/server';
import { type CoreUserMessage, generateText } from 'ai';
import { cookies } from 'next/headers';
import type { VisibilityType } from '@/components/visibility-selector';
import { customModel } from '@/lib/ai';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisibilityById,
} from '@/lib/db/queries';

export async function saveModelId(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('model-id', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: CoreUserMessage;
}) {
  // Get the current session
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Get the user's OpenAI API key
  const { getUserApiKey } = await import('@/lib/db/api-key-storage');
  const openAIApiKey =
    (await getUserApiKey({
      userId,
      provider: 'openai',
    })) || process.env.OPENAI_API_KEY;

  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  const { text: title } = await generateText({
    model: customModel('gpt-4.1-mini-2025-04-14', openAIApiKey),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 30 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisibilityById({ chatId, visibility });
}
