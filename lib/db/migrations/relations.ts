import { relations } from 'drizzle-orm/relations';
import {
  apiKey,
  chat,
  document,
  message,
  suggestion,
  user,
  vote,
} from './schema';

export const messageRelations = relations(message, ({ one, many }) => ({
  chat: one(chat, {
    fields: [message.chatId],
    references: [chat.id],
  }),
  votes: many(vote),
}));

export const chatRelations = relations(chat, ({ one, many }) => ({
  messages: many(message),
  user: one(user, {
    fields: [chat.userId],
    references: [user.id],
  }),
  votes: many(vote),
}));

export const userRelations = relations(user, ({ many }) => ({
  chats: many(chat),
  suggestions: many(suggestion),
  apiKeys: many(apiKey),
  documents: many(document),
}));

export const suggestionRelations = relations(suggestion, ({ one }) => ({
  document: one(document, {
    fields: [suggestion.documentId],
    references: [document.createdAt],
  }),
  user: one(user, {
    fields: [suggestion.userId],
    references: [user.id],
  }),
}));

export const documentRelations = relations(document, ({ one, many }) => ({
  suggestions: many(suggestion),
  user: one(user, {
    fields: [document.userId],
    references: [user.id],
  }),
}));

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
  user: one(user, {
    fields: [apiKey.userId],
    references: [user.id],
  }),
}));

export const voteRelations = relations(vote, ({ one }) => ({
  chat: one(chat, {
    fields: [vote.chatId],
    references: [chat.id],
  }),
  message: one(message, {
    fields: [vote.messageId],
    references: [message.id],
  }),
}));
