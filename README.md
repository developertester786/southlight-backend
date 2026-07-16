# Intro Request Backend — Setup Guide

This implements the workflow: inline email validation (ZeroBounce) → phone OTP
verification (Twilio Verify) → 6 notifications (Twilio SMS + Gmail API) → success
response back to Webflow.

## 1. Deploy the backend

1. Push this whole folder to a new GitHub repo.
2. Go to vercel.com → New Project → import that repo. Framework preset: "Other" (it auto-detects the `/api` folder as serverless functions).
3. Deploy. You'll get a URL like `https://intro-request-backend.vercel.app`.
4. Your live endpoints will be:
   - `POST https://intro-request-backend.vercel.app/api/validate-email`
   - `POST https://intro-request-backend.vercel.app/api/send-otp`
   - `POST https://intro-request-backend.vercel.app/api/resend-otp`
   - `POST https://intro-request-backend.vercel.app/api/verify-otp`
   - `GET  https://intro-request-backend.vercel.app/api/oauth-authorize`
   - `GET  https://intro-request-backend.vercel.app/api/oauth-callback`

## 2. Add environment variables

In Vercel: **Project Settings → Environment Variables**, add each of these (get the values from the earlier credentials-collection step):

```
ZEROBOUNCE_KEY=
TWILIO_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SID=
TWILIO_PHONE_NUMBER=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=https://intro-request-backend.vercel.app/api/oauth-callback
GMAIL_SENDER_ADDRESS=       (the Workspace email address that should send)
GMAIL_REFRESH_TOKEN=        (leave blank for now — added in step 3)
WEBFLOW_API_TOKEN=
WEBFLOW_COLLECTION_ID=      (the Agents CMS collection ID)
ADMIN_EMAIL=
ADMIN_PHONE=
```

Redeploy after adding these (Vercel does this automatically on env var changes, or trigger a redeploy manually).

## 3. Run the one-time Gmail OAuth authorization

1. In Google Cloud Console: create/select a project under the client's Workspace org, enable the **Gmail API**, set the OAuth consent screen to **Internal**, add scope `gmail.send`, then create an **OAuth Client ID** (type: Web application) with authorized redirect URI = the `GMAIL_REDIRECT_URI` value above.
2. Copy the generated Client ID/Secret into the env vars from step 2, redeploy.
3. Visit `https://intro-request-backend.vercel.app/api/oauth-authorize` in a browser, logged in as the Workspace sending account.
4. Approve access. You'll land on `/api/oauth-callback`, which displays a refresh token.
5. Copy that refresh token into `GMAIL_REFRESH_TOKEN` in Vercel, redeploy.
6. This is a one-time step — no further action needed from the client afterward.

## 4. Fill in the real notification content

Replace the placeholder text in `/templates/*.html` and `/templates/*.txt` with the exact copy from the client's July 3rd content email. Keep the `{{placeholder}}` tokens (`{{clientName}}`, `{{agentName}}`, etc.) wherever personalization is needed — see `lib/templates.js` for the full list of available tokens. The first line of each `.html` file (`Subject: ...`) becomes the email subject line.

## 5. Confirm the Webflow CMS Agents collection field names

`lib/agents.js` currently expects the Agents collection to have fields named `name`, `email`, `phone`. Open the client's Webflow CMS → Agents collection → check the actual field slugs (visible in the CMS editor or via a test call to the Webflow API) and update `lib/agents.js` if they differ.

## 6. Add the Webflow custom code

1. Open `webflow/custom-code.html`.
2. Replace `API_BASE` near the top of the `<script>` with your real deployed backend URL, e.g. `https://intro-request-backend.vercel.app/api`.
3. In Webflow: **Page Settings** (or **Project Settings**, for site-wide) → **Custom Code** → paste the entire file contents into **"Before `</body>` tag"**.
4. Confirm how the agent is identified on each page (URL slug, hidden field, or a `data-agent-id` attribute on `<body>`) and update the `getAgentId()` function near the top of the script to match — this is a placeholder and needs to be wired to the real mechanism.
5. Publish the site.

## 7. Change the form method

In Webflow, select the form (`#email-form`) → Settings → change **Method** from `GET` to `POST`. This is a backup safeguard in case the custom JS doesn't intercept submission for any reason — it prevents form data from leaking into the URL.

## 8. Test end to end, in this order

1. Enter a bad email → confirm inline error appears on blur.
2. Enter a bad phone number → confirm inline error appears on submit, before any OTP is sent.
3. Submit with valid info → confirm the OTP modal opens and a real SMS arrives.
4. Enter the wrong code → confirm the inline "incorrect code" message appears.
5. Click "Resend code" → confirm a new SMS arrives.
6. Enter the correct code → confirm the success modal appears.
7. Check that all 6 notifications actually landed (client email/SMS, agent email/SMS, admin email/SMS) with the right names filled in.
8. Temporarily break something (e.g. wrong Twilio credentials) → confirm the generic "Something went wrong" modal appears with working Try Again / Back buttons.

## Open items to confirm before go-live

- Exact Webflow CMS field slugs for agent name/email/phone (`lib/agents.js`).
- How the agent ID is actually passed on each page (`getAgentId()` in the custom code).
- Real copy for all 6 templates (currently placeholders).
- Whether Webflow's built-in "Send form data to email" should be disabled (Form Settings) so it doesn't fire a duplicate notification alongside the ones this backend sends.
