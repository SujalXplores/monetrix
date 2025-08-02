import { auth } from '@clerk/nextjs/server';
import { getUserApiKey, saveUserApiKey } from '@/lib/db/api-key-storage';

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const {
      provider,
      apiKey,
    }: { provider: 'openai' | 'financial-datasets'; apiKey: string } =
      await request.json();

    if (!provider || !apiKey) {
      return Response.json(
        { error: 'Provider and API key are required' },
        { status: 400 },
      );
    }

    // Validate provider
    if (provider !== 'openai' && provider !== 'financial-datasets') {
      return Response.json({ error: 'Invalid provider' }, { status: 400 });
    }

    await saveUserApiKey({
      userId,
      provider,
      key: apiKey,
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error saving API key:', error);
    return Response.json({ error: 'Failed to save API key' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') as
      | 'openai'
      | 'financial-datasets';

    if (!provider) {
      return Response.json({ error: 'Provider is required' }, { status: 400 });
    }

    // Validate provider
    if (provider !== 'openai' && provider !== 'financial-datasets') {
      return Response.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const apiKey = await getUserApiKey({
      userId,
      provider,
    });

    // Return whether key exists without exposing the actual key
    return Response.json(
      {
        hasKey: !!apiKey,
        // Only return masked version of the key for UI purposes
        maskedKey: apiKey
          ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
          : null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return Response.json(
      { error: 'Failed to retrieve API key' },
      { status: 500 },
    );
  }
}
