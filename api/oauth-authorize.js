// GET /api/oauth-authorize
// Visit this URL once in a browser (as the Workspace user who should send the emails)
// to kick off the one-time Gmail OAuth authorization. It redirects to Google's
// consent screen, which then redirects back to /api/oauth-callback.

export default function handler(req, res) {
  const params = new URLSearchParams({
    client_id: process.env.GMAIL_CLIENT_ID,
    redirect_uri: process.env.GMAIL_REDIRECT_URI, // e.g. https://yourproject.vercel.app/api/oauth-callback
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/gmail.send',
    access_type: 'offline', // required to get a refresh_token back
    prompt: 'consent',      // forces refresh_token on every authorization, not just the first
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
