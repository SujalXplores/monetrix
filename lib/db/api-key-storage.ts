import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { decryptApiKey, encryptApiKey } from '@/lib/utils/encryption';
import { apiKey } from './schema';

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function saveUserApiKey({
  userId,
  provider,
  key,
}: {
  userId: string;
  provider: 'openai' | 'financial-datasets';
  key: string;
}) {
  try {
    const encryptedKey = encryptApiKey(key);
    const now = new Date();

    // Check if key already exists for this user and provider
    const existingKey = await db
      .select()
      .from(apiKey)
      .where(and(eq(apiKey.userId, userId), eq(apiKey.provider, provider)))
      .limit(1);

    if (existingKey.length > 0) {
      await db
        .update(apiKey)
        .set({
          encryptedKey,
          updatedAt: now,
        })
        .where(and(eq(apiKey.userId, userId), eq(apiKey.provider, provider)));
    } else {
      // Insert new key
      await db.insert(apiKey).values({
        userId,
        provider,
        encryptedKey,
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch (error) {
    console.error('Error saving API key:', error);
    throw new Error('Failed to save API key');
  }
}

export async function getUserApiKey({
  userId,
  provider,
}: {
  userId: string;
  provider: 'openai' | 'financial-datasets';
}): Promise<string | null> {
  try {
    const result = await db
      .select()
      .from(apiKey)
      .where(and(eq(apiKey.userId, userId), eq(apiKey.provider, provider)))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const decryptedKey = decryptApiKey(result[0].encryptedKey);
    return decryptedKey;
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return null;
  }
}

export async function deleteUserApiKey({
  userId,
  provider,
}: {
  userId: string;
  provider: 'openai' | 'financial-datasets';
}) {
  try {
    await db
      .delete(apiKey)
      .where(and(eq(apiKey.userId, userId), eq(apiKey.provider, provider)));
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw new Error('Failed to delete API key');
  }
}
