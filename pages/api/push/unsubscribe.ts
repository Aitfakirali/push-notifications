import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Subscription from '@/models/Subscription';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ 
        error: 'Missing required field: endpoint'
      });
    }

    // Connect to MongoDB
    await dbConnect();

    // Delete subscription
    const result = await Subscription.deleteOne({ endpoint });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        error: 'Subscription not found'
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Subscription removed successfully'
    });
  } catch (error) {
    console.error('Error removing subscription:', error);
    res.status(500).json({ 
      error: 'Failed to remove subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
