import { db } from '@/db';
import { notifications } from '@/db/schema/notifications';
import { users } from '@/db/schema/user';
import { and, eq, or } from 'drizzle-orm';
import { render } from '@react-email/components';
import sendMail from '@/lib/email/sendMail';
import { appConfig } from '@/lib/config';
import ConnectionRequestEmail from '@/emails/ConnectionRequest';
import ConnectionAcceptedEmail from '@/emails/ConnectionAccepted';

export type ConnectionNotificationType =
  | 'connection_request'
  | 'connection_accepted';

export interface NotificationMetadata {
  requester_id?: string;
  requester_name?: string;
  connection_id?: string;
  card_url?: string;
}

/**
 * Create a connection-related notification for a user
 * @param userId - ID of the user to notify
 * @param type - Type of notification
 * @param metadata - Additional notification data
 * @returns Created notification record or error
 */
export async function createConnectionNotification(
  userId: string,
  type: ConnectionNotificationType,
  metadata: NotificationMetadata
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Validate user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      return { success: false, error: 'User not found' };
    }

    // Generate notification content based on type
    const notificationContent = getNotificationContent(type, metadata);

    // Create notification
    const notification = await db
      .insert(notifications)
      .values({
        user_id: userId,
        type,
        title: notificationContent.title,
        message: notificationContent.message,
        action_url: notificationContent.action_url,
        metadata,
        is_read: false,
        is_dismissed: false,
        created_at: new Date(),
      })
      .returning();

    return { success: true, data: notification[0] };
  } catch (error) {
    console.error('Error creating connection notification:', error);
    return { success: false, error: 'Failed to create notification' };
  }
}

/**
 * Send a connection request email to the recipient
 * @param recipientEmail - Email address of the recipient
 * @param requesterName - Name of the user sending the request
 * @param cardUrl - URL to the requester's DevCard
 * @param message - Optional message from the requester
 * @returns Success status or error
 */
export async function sendConnectionEmail(
  recipientEmail: string,
  requesterName: string,
  cardUrl: string,
  message?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Render the React Email template
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://devius.io';
    const emailHtml = await render(
      ConnectionRequestEmail({
        requesterName,
        cardUrl,
        message,
        actionUrl: `${baseUrl}/app/network/requests`,
      })
    );

    // Send email
    await sendMail(
      recipientEmail,
      `${requesterName} wants to connect on ${appConfig.projectName}`,
      emailHtml
    );

    return { success: true };
  } catch (error) {
    console.error('Error sending connection email:', error);
    return { success: false, error: 'Failed to send connection email' };
  }
}

/**
 * Send both notification and email for a connection request
 * @param recipientId - ID of the recipient
 * @param requesterId - ID of the requester
 * @param requesterName - Name of the requester
 * @param cardUrl - URL to the requester's DevCard
 * @param message - Optional message from the requester
 */
export async function notifyConnectionRequest(
  recipientId: string,
  requesterId: string,
  requesterName: string,
  cardUrl: string,
  message?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get recipient's email
    const recipient = await db
      .select()
      .from(users)
      .where(eq(users.id, recipientId))
      .limit(1);

    if (!recipient[0]) {
      return { success: false, error: 'Recipient not found' };
    }

    // Create in-app notification
    await createConnectionNotification(recipientId, 'connection_request', {
      requester_id: requesterId,
      requester_name: requesterName,
      card_url: cardUrl,
    });

    // Send email notification
    if (recipient[0].email) {
      await sendConnectionEmail(
        recipient[0].email,
        requesterName,
        cardUrl,
        message
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error notifying connection request:', error);
    return { success: false, error: 'Failed to send notifications' };
  }
}

/**
 * Send notification when a connection request is accepted
 * @param requesterId - ID of the original requester (now being notified)
 * @param accepterName - Name of the user who accepted
 * @param cardUrl - URL to the accepter's DevCard
 */
export async function notifyConnectionAccepted(
  requesterId: string,
  accepterName: string,
  cardUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get requester's email
    const requester = await db
      .select()
      .from(users)
      .where(eq(users.id, requesterId))
      .limit(1);

    if (!requester[0]) {
      return { success: false, error: 'Requester not found' };
    }

    // Create in-app notification
    await createConnectionNotification(requesterId, 'connection_accepted', {
      requester_name: accepterName,
      card_url: cardUrl,
    });

    // Send email notification
    if (requester[0].email) {
      try {
        const emailHtml = await render(
          ConnectionAcceptedEmail({
            accepterName,
            cardUrl,
          })
        );

        await sendMail(
          requester[0].email,
          `${accepterName} accepted your connection request on DevCard`,
          emailHtml
        );
      } catch (emailError) {
        console.error('Error sending connection accepted email:', emailError);
        // Don't fail the entire operation if email fails
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error notifying connection accepted:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}

/**
 * Helper function to generate notification content based on type
 */
function getNotificationContent(
  type: ConnectionNotificationType,
  metadata: NotificationMetadata
): { title: string; message: string; action_url: string } {
  switch (type) {
    case 'connection_request':
      return {
        title: 'New Connection Request',
        message: `${metadata.requester_name || 'Someone'} wants to connect with you`,
        action_url: '/app/network/requests',
      };
    case 'connection_accepted':
      return {
        title: 'Connection Accepted',
        message: `${metadata.requester_name || 'Someone'} accepted your connection request`,
        action_url: '/app/network/connections',
      };
    default:
      return {
        title: 'Connection Update',
        message: 'You have a new connection update',
        action_url: '/app/network',
      };
  }
}

/**
 * Mark a notification as read
 * @param notificationId - ID of the notification
 * @returns Success status or error
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(notifications)
      .set({
        is_read: true,
        read_at: new Date(),
      })
      .where(eq(notifications.id, notificationId));

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: 'Failed to mark notification as read' };
  }
}

/**
 * Get unread connection notifications for a user
 * @param userId - ID of the user
 * @returns Array of unread notifications
 */
export async function getUnreadConnectionNotifications(
  userId: string
): Promise<any[]> {
  try {
    const unreadNotifications = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.user_id, userId),
          eq(notifications.is_read, false),
          or(
            eq(notifications.type, 'connection_request'),
            eq(notifications.type, 'connection_accepted')
          )
        )
      )
      .orderBy(notifications.created_at);

    return unreadNotifications;
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return [];
  }
}
