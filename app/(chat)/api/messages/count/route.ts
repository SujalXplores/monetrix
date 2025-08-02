import { auth } from '@clerk/nextjs/server';
import { getTotalUserMessagesByUserId } from '@/lib/db/queries';

export async function GET() {
  try {
    const { userId } = await auth();

    const count = await getTotalUserMessagesByUserId({
      userId: userId || undefined,
    });

    return Response.json({ count });
  } catch (error) {
    console.error('Failed to get message count:', error);
    return Response.json(
      { error: 'Failed to get message count' },
      { status: 500 },
    );
  }
}
