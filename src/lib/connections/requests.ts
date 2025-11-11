import { db } from '@/db';
import { connections, blocked_users } from '@/db/schema/connections';
import { users } from '@/db/schema/user';
import { and, eq, or } from 'drizzle-orm';

/**
 * Send a connection request from requester to recipient
 * @param requesterId - ID of the user sending the request
 * @param recipientId - ID of the user receiving the request
 * @param message - Optional message to include with the request
 * @returns The created connection record or error
 */
export async function sendConnectionRequest(
  requesterId: string,
  recipientId: string,
  message?: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Business Rule 1: Prevent self-connections
    if (requesterId === recipientId) {
      return { success: false, error: 'Cannot send connection request to yourself' };
    }

    // Business Rule 2: Check if users exist
    const [requester, recipient] = await Promise.all([
      db.select().from(users).where(eq(users.id, requesterId)).limit(1),
      db.select().from(users).where(eq(users.id, recipientId)).limit(1),
    ]);

    if (!requester[0] || !recipient[0]) {
      return { success: false, error: 'User not found' };
    }

    // Business Rule 3: Check if either user has blocked the other
    const blockCheck = await db
      .select()
      .from(blocked_users)
      .where(
        or(
          and(
            eq(blocked_users.user_id, requesterId),
            eq(blocked_users.blocked_user_id, recipientId)
          ),
          and(
            eq(blocked_users.user_id, recipientId),
            eq(blocked_users.blocked_user_id, requesterId)
          )
        )
      )
      .limit(1);

    if (blockCheck.length > 0) {
      return { success: false, error: 'Cannot send connection request to this user' };
    }

    // Business Rule 4: Check for existing connection (prevent duplicates)
    const existingConnection = await db
      .select()
      .from(connections)
      .where(
        or(
          and(
            eq(connections.requester_id, requesterId),
            eq(connections.recipient_id, recipientId)
          ),
          and(
            eq(connections.requester_id, recipientId),
            eq(connections.recipient_id, requesterId)
          )
        )
      )
      .limit(1);

    if (existingConnection.length > 0) {
      const status = existingConnection[0].status;
      if (status === 'pending') {
        return { success: false, error: 'Connection request already pending' };
      } else if (status === 'accepted') {
        return { success: false, error: 'Already connected with this user' };
      } else if (status === 'declined') {
        // Allow re-requesting after decline
        const updated = await db
          .update(connections)
          .set({
            status: 'pending',
            message,
            requested_at: new Date(),
            responded_at: null,
            updated_at: new Date(),
          })
          .where(
            and(
              eq(connections.requester_id, existingConnection[0].requester_id),
              eq(connections.recipient_id, existingConnection[0].recipient_id)
            )
          )
          .returning();

        return { success: true, data: updated[0] };
      }
    }

    // Create new connection request
    const newConnection = await db
      .insert(connections)
      .values({
        requester_id: requesterId,
        recipient_id: recipientId,
        status: 'pending',
        message: message || null,
        requested_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    return { success: true, data: newConnection[0] };
  } catch (error) {
    console.error('Error sending connection request:', error);
    return { success: false, error: 'Failed to send connection request' };
  }
}

/**
 * Accept a connection request
 * @param requesterId - ID of the user who sent the request
 * @param recipientId - ID of the user accepting the request
 * @returns Updated connection record or error
 */
export async function acceptRequest(
  requesterId: string,
  recipientId: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Find the pending connection request
    const existingConnection = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.requester_id, requesterId),
          eq(connections.recipient_id, recipientId),
          eq(connections.status, 'pending')
        )
      )
      .limit(1);

    if (existingConnection.length === 0) {
      return { success: false, error: 'Connection request not found' };
    }

    // Update connection status to accepted
    const updated = await db
      .update(connections)
      .set({
        status: 'accepted',
        responded_at: new Date(),
        updated_at: new Date(),
      })
      .where(
        and(
          eq(connections.requester_id, requesterId),
          eq(connections.recipient_id, recipientId)
        )
      )
      .returning();

    return { success: true, data: updated[0] };
  } catch (error) {
    console.error('Error accepting connection request:', error);
    return { success: false, error: 'Failed to accept connection request' };
  }
}

/**
 * Decline a connection request
 * @param requesterId - ID of the user who sent the request
 * @param recipientId - ID of the user declining the request
 * @returns Updated connection record or error
 */
export async function declineRequest(
  requesterId: string,
  recipientId: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Find the pending connection request
    const existingConnection = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.requester_id, requesterId),
          eq(connections.recipient_id, recipientId),
          eq(connections.status, 'pending')
        )
      )
      .limit(1);

    if (existingConnection.length === 0) {
      return { success: false, error: 'Connection request not found' };
    }

    // Update connection status to declined
    const updated = await db
      .update(connections)
      .set({
        status: 'declined',
        responded_at: new Date(),
        updated_at: new Date(),
      })
      .where(
        and(
          eq(connections.requester_id, requesterId),
          eq(connections.recipient_id, recipientId)
        )
      )
      .returning();

    return { success: true, data: updated[0] };
  } catch (error) {
    console.error('Error declining connection request:', error);
    return { success: false, error: 'Failed to decline connection request' };
  }
}

/**
 * Block a user (prevents all future connection requests)
 * @param userId - ID of the user doing the blocking
 * @param blockedUserId - ID of the user being blocked
 * @returns Blocked user record or error
 */
export async function blockUser(
  userId: string,
  blockedUserId: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Business Rule: Prevent self-blocking
    if (userId === blockedUserId) {
      return { success: false, error: 'Cannot block yourself' };
    }

    // Check if users exist
    const [user, blockedUser] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(users).where(eq(users.id, blockedUserId)).limit(1),
    ]);

    if (!user[0] || !blockedUser[0]) {
      return { success: false, error: 'User not found' };
    }

    // Check if already blocked
    const existingBlock = await db
      .select()
      .from(blocked_users)
      .where(
        and(
          eq(blocked_users.user_id, userId),
          eq(blocked_users.blocked_user_id, blockedUserId)
        )
      )
      .limit(1);

    if (existingBlock.length > 0) {
      return { success: false, error: 'User already blocked' };
    }

    // Create block record
    const blockRecord = await db
      .insert(blocked_users)
      .values({
        user_id: userId,
        blocked_user_id: blockedUserId,
        blocked_at: new Date(),
      })
      .returning();

    // Remove any existing connections (both directions)
    await db
      .delete(connections)
      .where(
        or(
          and(
            eq(connections.requester_id, userId),
            eq(connections.recipient_id, blockedUserId)
          ),
          and(
            eq(connections.requester_id, blockedUserId),
            eq(connections.recipient_id, userId)
          )
        )
      );

    return { success: true, data: blockRecord[0] };
  } catch (error) {
    console.error('Error blocking user:', error);
    return { success: false, error: 'Failed to block user' };
  }
}

/**
 * Unblock a user
 * @param userId - ID of the user doing the unblocking
 * @param blockedUserId - ID of the user being unblocked
 * @returns Success status or error
 */
export async function unblockUser(
  userId: string,
  blockedUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const deleted = await db
      .delete(blocked_users)
      .where(
        and(
          eq(blocked_users.user_id, userId),
          eq(blocked_users.blocked_user_id, blockedUserId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return { success: false, error: 'User is not blocked' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error unblocking user:', error);
    return { success: false, error: 'Failed to unblock user' };
  }
}
