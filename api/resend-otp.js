// POST /api/resend-otp
// Body: { phone }
// Called when the user clicks "Resend code" inside the OTP modal.
// Functionally identical to send-otp — separate route so the front end
// can call it independently and show its own "code resent" confirmation.

import { sendVerificationCode } from '../lib/twilioClient.js';
import { applyCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone } = req.body || {};
  if (!phone) return res.status(400).json({ error: 'phone is required' });

  try {
    await sendVerificationCode(phone);
    res.status(200).json({ sent: true });
  } catch (err) {
    console.error('resend-otp error:', err);
    res.status(500).json({ error: 'Failed to resend verification code' });
  }
}