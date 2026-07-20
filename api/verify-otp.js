// POST /api/verify-otp
// Body: { phone, code, name, email, lookingToDo, agentId }
// Called when the user submits the 6-digit code.
// On success: looks up the real agent contact info from Webflow CMS,
// fires all 6 notifications, and returns success so the front end can
// show the success modal.

import { checkVerificationCode } from '../lib/twilioClient.js';
import { getAgent } from '../lib/agents.js';
import { sendAllNotifications } from '../lib/notifications.js';
import { applyCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, code, name, email, lookingToDo, agentId } = req.body || {};
  if (!phone || !code) return res.status(400).json({ error: 'phone and code are required' });

  try {
    let check;
    try {
      check = await checkVerificationCode(phone, code);
    } catch (twilioErr) {
      if (twilioErr.status === 404 || twilioErr.code === 20404) {
        return res.status(400).json({ verified: false, reason: 'expired_or_not_found' });
      }
      throw twilioErr;
    }

    if (check.status !== 'approved') {
      return res.status(400).json({ verified: false, reason: 'incorrect_code' });
    }

    // Agent contact info is looked up server-side from Webflow CMS using only the
    // agent ID sent from the form — never trusting an email/phone value from the browser.
    const agent = await getAgent(agentId);

    const { sent, failed } = await sendAllNotifications({
      client: { name, email, phone, lookingToDo },
      agent,
    });

    res.status(200).json({
      verified: true,
      success: true,
      agentName: agent.name,
      notificationsSent: sent,
      notificationsFailed: failed,
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ verified: false, reason: 'server_error' });
  }
}