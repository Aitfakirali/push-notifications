import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import { webpush } from '@/lib/vapid';

interface SendNotificationRequest {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  tag?: string;
  requireInteraction?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, body, icon, badge, image, data, actions, tag, requireInteraction } = req.body as SendNotificationRequest;

    if (!title || !body) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'body']
      });
    }

    // Connect to MongoDB
    await dbConnect();

    // Get all subscriptions
    const subscriptions = await Subscription.find({});

    if (subscriptions.length === 0) {
      return res.status(404).json({ 
        error: 'No subscriptions found',
        message: 'There are no devices subscribed to push notifications'
      });
    }

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: icon || '/icon-192x192.png',
      badge: badge || '/icon-192x192.png',
      image,
      data: data || {},
      actions,
      tag,
      requireInteraction: requireInteraction || false,
    });

    // Send notification to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
              },
            },
            notificationPayload
          );
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          // If subscription is no longer valid (410 Gone or 404 Not Found), remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await Subscription.deleteOne({ endpoint: sub.endpoint });
            return { 
              success: false, 
              endpoint: sub.endpoint, 
              error: 'Subscription expired and removed',
              removed: true
            };
          }
          throw error;
        }
      })
    );

    // Count successes and failures
    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
    const removed = results.filter(
      (r) => r.status === 'fulfilled' && r.value.removed
    ).length;

    res.status(200).json({
      success: true,
      message: 'Notifications sent',
      stats: {
        total: subscriptions.length,
        successful,
        failed,
        removed,
      },
      results: results.map((r, index) => {
        const baseResult = {
          subscriptionEndpoint: subscriptions[index].endpoint,
          status: r.status,
        };
        
        if (r.status === 'fulfilled') {
          return { ...baseResult, ...r.value };
        } else {
          return { ...baseResult, error: r.reason?.message || 'Unknown error' };
        }
      }),
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({
      error: 'Failed to send notifications',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
