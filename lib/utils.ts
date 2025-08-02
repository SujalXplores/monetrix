import type {
  CoreAssistantMessage,
  CoreMessage,
  CoreToolMessage,
  Message,
  ToolInvocation,
} from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UUID_PATTERN } from '@/lib/constants';
import type { Message as DBMessage, Document } from '@/lib/db/schema';
import { logger } from '@/lib/logger';
import type { MessageAnnotationWithServer } from '@/lib/types/message-annotations';
import {
  MessageTransformers,
  sanitizeMessages,
} from '@/lib/utils/message-utils';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      'An error occurred while fetching the data.',
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  }
  return null;
}

export function setLocalStorage(
  key: string,
  value: string | number | boolean | object,
) {
  if (typeof window !== 'undefined') {
    try {
      const valueToStore =
        typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, valueToStore);
      logger.debug(`Successfully stored ${key}`, { value });
    } catch (error) {
      logger.error(`Error storing ${key}`, { error });
    }
  }
}

export function generateUUID(): string {
  return UUID_PATTERN.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function convertToUIMessages(
  messages: Array<DBMessage>,
): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    if (message.role === 'tool') {
      return MessageTransformers.addToolResult(
        chatMessages,
        message as CoreToolMessage,
      );
    }

    let textContent = '';
    const toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === 'string') {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === 'text') {
          textContent += content.text;
        } else if (content.type === 'tool-call') {
          toolInvocations.push({
            state: 'call',
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
          });
        }
      }
    }

    chatMessages.push({
      id: message.id,
      role: message.role as Message['role'],
      content: textContent,
      toolInvocations,
    });

    return chatMessages;
  }, []);
}

export function sanitizeResponseMessages(
  messages: Array<CoreToolMessage | CoreAssistantMessage>,
): Array<CoreToolMessage | CoreAssistantMessage> {
  return sanitizeMessages.response(messages);
}

export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
  return sanitizeMessages.ui(messages);
}

export function getMostRecentUserMessage(messages: Array<CoreMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number,
) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}

export function getMessageIdFromAnnotations(message: Message) {
  if (!message.annotations) return message.id;

  const [annotation] = message.annotations;
  if (!annotation || typeof annotation !== 'object' || annotation === null)
    return message.id;

  const typedAnnotation = annotation as MessageAnnotationWithServer;
  return typedAnnotation.messageIdFromServer ?? message.id;
}
