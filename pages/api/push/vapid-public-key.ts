import type { NextApiRequest, NextApiResponse } from 'next';
import { VAPID_PUBLIC_KEY } from '@/lib/vapid';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!VAPID_PUBLIC_KEY) {
    return res.status(500).json({ 
      error: 'VAPID public key not configured',
      message: 'Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY in your environment variables'
    });
  }

  res.status(200).json({ publicKey: VAPID_PUBLIC_KEY });
}
