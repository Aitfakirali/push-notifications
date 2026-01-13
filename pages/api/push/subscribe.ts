import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Subscription from '@/models/Subscription';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['endpoint', 'keys.p256dh', 'keys.auth']
      });
    }

    // Connect to MongoDB
    await dbConnect();

    // Get user agent from headers
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Create or update subscription
    const subscription = await Subscription.findOneAndUpdate(
      { endpoint },
      {
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        userAgent,
      },
      { 
        upsert: true, // Create if doesn't exist
        new: true,    // Return updated document
      }
    );

    res.status(200).json({ 
      success: true,
      message: 'Subscription saved successfully',
      subscriptionId: subscription._id
    });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ 
      error: 'Failed to save subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
