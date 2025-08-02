import { auth, currentUser } from '@clerk/nextjs/server';
import { createOrUpdateUser } from '@/lib/db/queries';

/**
 * Clerk webhook handler to sync user data with our database
 * This should be called when users sign in to ensure they exist in our database
 */
export async function syncUserWithDatabase() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const user = await currentUser();

    if (!user) {
      return null;
    }

    const email = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    )?.emailAddress;

    const [dbUser] = await createOrUpdateUser(userId, email);

    return dbUser;
  } catch (error) {
    console.error('Error syncing user with database:', error);
    return null;
  }
}

/**
 * Get the current user from our database, creating if necessary
 */
export async function getCurrentDatabaseUser() {
  return await syncUserWithDatabase();
}
