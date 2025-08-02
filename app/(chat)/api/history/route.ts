import { auth } from '@clerk/nextjs/server';
import { getChatsByUserId } from '@/lib/db/queries';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  const chats = await getChatsByUserId({ id: userId });
  return Response.json(chats);
}
