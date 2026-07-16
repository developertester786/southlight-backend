// GET /api/oauth-callback?code=...
// Google redirects here automatically after the client approves access.
// This exchanges the one-time code for a refresh token and displays it once
// so it can be copied into the GMAIL_REFRESH_TOKEN environment variable.
//
// IMPORTANT: Google only returns the refresh_token on the FIRST authorization
// (or when prompt=consent forces re-consent). If it's lost, re-run /api/oauth-authorize.
// This endpoint can be deleted or left in place after setup — it's harmless either way,
// since it does nothing without a fresh ?code from Google.

export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing ?code from Google redirect.');

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GMAIL_CLIENT_ID,
        client_secret: process.env.GMAIL_CLIENT_SECRET,
        redirect_uri: process.env.GMAIL_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const data = await tokenRes.json();

    if (!data.refresh_token) {
      return res.status(400).send(
        `No refresh_token returned. This usually means the account was already authorized once before. ` +
        `Revoke access at https://myaccount.google.com/permissions and try /api/oauth-authorize again. ` +
        `Raw response: ${JSON.stringify(data)}`
      );
    }

    res.status(200).send(
      `Authorization successful. Copy this value into GMAIL_REFRESH_TOKEN in your environment variables, ` +
      `then remove this token from anywhere else it was displayed:\n\n${data.refresh_token}`
    );
  } catch (err) {
    console.error('oauth-callback error:', err);
    res.status(500).send('OAuth exchange failed. Check server logs.');
  }
}
