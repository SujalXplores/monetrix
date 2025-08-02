import {
  boolean,
  foreignKey,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const user = pgTable(
  'User',
  {
    id: varchar({ length: 256 }).primaryKey().notNull(),
    email: text(),
    clerkId: text(),
    createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [unique('User_clerkId_unique').on(table.clerkId)],
);

export const message = pgTable(
  'Message',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    chatId: uuid().notNull(),
    role: varchar().notNull(),
    content: json().notNull(),
    createdAt: timestamp({ mode: 'string' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
      name: 'Message_chatId_Chat_id_fk',
    }),
  ],
);

export const chat = pgTable(
  'Chat',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp({ mode: 'string' }).notNull(),
    userId: varchar({ length: 256 }).notNull(),
    title: text().notNull(),
    visibility: varchar().default('private').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'Chat_userId_User_id_fk',
    }),
  ],
);

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    documentId: uuid().notNull(),
    documentCreatedAt: timestamp({ mode: 'string' }).notNull(),
    originalText: text().notNull(),
    suggestedText: text().notNull(),
    description: text(),
    isResolved: boolean().default(false).notNull(),
    userId: varchar({ length: 256 }).notNull(),
    createdAt: timestamp({ mode: 'string' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.createdAt, document.id],
      name: 'Suggestion_documentId_documentCreatedAt_Document_id_createdAt_f',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'Suggestion_userId_User_id_fk',
    }),
  ],
);

export const apiKey = pgTable(
  'ApiKey',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: varchar({ length: 256 }).notNull(),
    provider: varchar({ length: 32 }).notNull(),
    encryptedKey: text().notNull(),
    createdAt: timestamp({ mode: 'string' }).notNull(),
    updatedAt: timestamp({ mode: 'string' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'ApiKey_userId_User_id_fk',
    }),
  ],
);

export const userBackup = pgTable('User_backup', {
  id: uuid(),
  email: text(),
  clerkId: text(),
  createdAt: timestamp({ mode: 'string' }),
  updatedAt: timestamp({ mode: 'string' }),
});

export const vote = pgTable(
  'Vote',
  {
    chatId: uuid().notNull(),
    messageId: uuid().notNull(),
    isUpvoted: boolean().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
      name: 'Vote_chatId_Chat_id_fk',
    }),
    foreignKey({
      columns: [table.messageId],
      foreignColumns: [message.id],
      name: 'Vote_messageId_Message_id_fk',
    }),
    primaryKey({
      columns: [table.chatId, table.messageId],
      name: 'Vote_chatId_messageId_pk',
    }),
  ],
);

export const document = pgTable(
  'Document',
  {
    id: uuid().defaultRandom().notNull(),
    createdAt: timestamp({ mode: 'string' }).notNull(),
    title: text().notNull(),
    content: text(),
    userId: varchar({ length: 256 }).notNull(),
    text: varchar().default('text').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'Document_userId_User_id_fk',
    }),
    primaryKey({
      columns: [table.id, table.createdAt],
      name: 'Document_id_createdAt_pk',
    }),
  ],
);
