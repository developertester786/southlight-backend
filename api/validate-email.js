// POST /api/validate-email
// Body: { email }
// Called on the Email field's blur event in Webflow.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });

  try {
    const url = `https://api.zerobounce.net/v2/validate?api_key=${process.env.ZEROBOUNCE_KEY}&email=${encodeURIComponent(email)}`;
    const r = await fetch(url);
    const data = await r.json();

    // ZeroBounce statuses: valid, invalid, catch-all, unknown, spamtrap, abuse, do_not_mail
    const valid = data.status === 'valid';
    res.status(200).json({ valid, status: data.status });
  } catch (err) {
    console.error('validate-email error:', err);
    res.status(500).json({ error: 'Email validation failed' });
  }
}
