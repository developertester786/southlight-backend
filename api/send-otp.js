// POST /api/send-otp
// Body: { phone }
// Called when the user clicks "Request an Introduction".

import { sendVerificationCode } from '../lib/twilioClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone } = req.body || {};
  if (!phone) return res.status(400).json({ error: 'phone is required' });

  try {
    await sendVerificationCode(phone);
    res.status(200).json({ sent: true });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
}
