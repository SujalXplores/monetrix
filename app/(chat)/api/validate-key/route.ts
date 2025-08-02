import { auth } from '@clerk/nextjs/server';
import { validateOpenAIKey } from '@/lib/utils/api-key-validation';

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { apiKey }: { apiKey: string } = await request.json();

    if (!apiKey) {
      return Response.json(
        { isValid: false, error: 'API key is required' },
        { status: 400 },
      );
    }

    const result = await validateOpenAIKey(apiKey);
    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error('Error validating API key:', error);
    return Response.json(
      { isValid: false, error: 'Failed to validate API key' },
      { status: 500 },
    );
  }
}
